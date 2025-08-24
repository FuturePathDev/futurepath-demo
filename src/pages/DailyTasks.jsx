// src/pages/DailyTasks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";

/**
 * Simple, deterministic, local-first daily task system:
 * - Uses focus career (first item in profile.focusCareers) to theme tasks
 * - Generates a daily set of tasks (stable for that date + email)
 * - Persists completion to localStorage under a per-day key
 *
 * No backend write is required for the demo. You can later POST completions
 * to /user or a dedicated /tasks endpoint if desired.
 */

/** LocalStorage helpers */
function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

/** Date helpers */
function yyyy_mm_dd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Basic pseudo-random (deterministic by seed) */
function mulberry32(seed) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Task bank: by focus keyword (demo content; tweak freely) */
const TASK_BANK = {
  Doctor: [
    { title: "Shadow a healthcare video (15m)", minutes: 15, points: 25 },
    { title: "Learn vital signs basics", minutes: 20, points: 20 },
    { title: "Explore pre-med HS clubs", minutes: 10, points: 10 },
    { title: "Read about HIPAA fundamentals", minutes: 15, points: 20 },
    { title: "Medical terminology—5 new terms", minutes: 10, points: 15 },
    { title: "Career spotlight: Family Medicine", minutes: 12, points: 15 },
    { title: "Build a study plan for biology", minutes: 15, points: 20 },
    { title: "Interview prep: Why medicine?", minutes: 10, points: 10 },
  ],
  Hospital: [
    { title: "Departments 101: ER vs ICU", minutes: 12, points: 15 },
    { title: "Role deep-dive: Respiratory Therapist", minutes: 15, points: 20 },
    { title: "Teamwork in rounds (video)", minutes: 10, points: 10 },
    { title: "Understand patient triage", minutes: 15, points: 20 },
    { title: "Safety: Hand hygiene protocols", minutes: 8, points: 10 },
    { title: "Career map: CNA → RN", minutes: 10, points: 15 },
    { title: "Create a volunteer plan", minutes: 12, points: 15 },
  ],
  Laboratory: [
    { title: "Lab safety checklist", minutes: 10, points: 15 },
    { title: "Microscope basics", minutes: 10, points: 10 },
    { title: "PCR explained (video)", minutes: 12, points: 15 },
    { title: "Career spotlight: Lab Tech", minutes: 10, points: 15 },
    { title: "Sample handling 101", minutes: 8, points: 10 },
    { title: "Data logging practice", minutes: 10, points: 10 },
    { title: "Biostats: mean/median/mode", minutes: 10, points: 15 },
  ],
  Pharmacy: [
    { title: "Medication classes overview", minutes: 12, points: 15 },
    { title: "Dosage math practice", minutes: 10, points: 15 },
    { title: "Career spotlight: Pharm Tech", minutes: 10, points: 15 },
    { title: "OTC vs Rx — what’s the diff?", minutes: 8, points: 10 },
    { title: "Customer counseling basics", minutes: 10, points: 10 },
    { title: "Inventory/labeling practice", minutes: 10, points: 10 },
    { title: "Local programs research", minutes: 12, points: 15 },
  ],
  Insurance: [
    { title: "Healthcare systems 101", minutes: 12, points: 15 },
    { title: "Claims lifecycle overview", minutes: 10, points: 10 },
    { title: "Policy terms cheat sheet", minutes: 10, points: 10 },
    { title: "Career spotlight: Claims Adjuster", minutes: 10, points: 15 },
    { title: "Customer empathy exercise", minutes: 8, points: 10 },
    { title: "Compliance basics", minutes: 12, points: 15 },
    { title: "Local internship search", minutes: 12, points: 15 },
  ],
  /** Fallback/general */
  General: [
    { title: "Set weekly goals (SMART)", minutes: 8, points: 10 },
    { title: "Build a simple resume draft", minutes: 15, points: 20 },
    { title: "Join a school club this week", minutes: 10, points: 15 },
    { title: "Plan volunteer hours", minutes: 10, points: 10 },
    { title: "Learn email etiquette", minutes: 8, points: 10 },
    { title: "Time-block your study hours", minutes: 10, points: 10 },
    { title: "Find 2 local programs", minutes: 12, points: 15 },
    { title: "Practice a 30s intro pitch", minutes: 6, points: 10 },
  ],
};

/** Stable daily generator */
function generateDailyTasks(focusTitle, email, dateStr, want = 6) {
  const bank =
    TASK_BANK[focusTitle] ||
    TASK_BANK[
      focusTitle?.toLowerCase().includes("doctor")
        ? "Doctor"
        : focusTitle?.toLowerCase().includes("hospital")
        ? "Hospital"
        : focusTitle?.toLowerCase().includes("lab")
        ? "Laboratory"
        : focusTitle?.toLowerCase().includes("pharm")
        ? "Pharmacy"
        : focusTitle?.toLowerCase().includes("insur")
        ? "Insurance"
        : "General"
    ];

  const seed = hashString(`${email}::${dateStr}::${focusTitle || "general"}`);
  const rnd = mulberry32(seed);
  const choices = [...bank];
  const picked = [];

  // Fisher-Yates-ish sample using rnd()
  for (let i = 0; i < want && choices.length > 0; i++) {
    const idx = Math.floor(rnd() * choices.length);
    picked.push(choices[idx]);
    choices.splice(idx, 1);
  }

  // Assign ids
  return picked.map((t, i) => ({
    id: `T-${i + 1}`,
    title: t.title,
    minutes: t.minutes,
    points: t.points,
    done: false,
    doneAt: null,
  }));
}

/** Storage key helper */
function storageKey(email, dateStr) {
  return `fp_tasks::${email || "guest"}::${dateStr}`;
}

export default function DailyTasks() {
  const { profile } = useProfile();

  const email = useMemo(() => {
    try {
      return localStorage.getItem("demoEmail") || profile?.email || "student@example.com";
    } catch {
      return profile?.email || "student@example.com";
    }
  }, [profile?.email]);

  const focus =
    Array.isArray(profile?.focusCareers) && profile.focusCareers.length
      ? profile.focusCareers[0]
      : null;

  const dateStr = yyyy_mm_dd();

  const [tasks, setTasks] = useState(() => {
    const key = storageKey(email, dateStr);
    const existing = safeGet(key, null);
    if (Array.isArray(existing) && existing.length) return existing;
    return generateDailyTasks(focus, email, dateStr, 6);
  });

  // Persist on change
  useEffect(() => {
    const key = storageKey(email, dateStr);
    safeSet(key, tasks);
  }, [tasks, email, dateStr]);

  // Regenerate when email/focus/date changes (rare during a single mount)
  useEffect(() => {
    const key = storageKey(email, dateStr);
    const existing = safeGet(key, null);
    if (!existing) {
      setTasks(generateDailyTasks(focus, email, dateStr, 6));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, focus, dateStr]);

  const completed = tasks.filter((t) => t.done).length;
  const totalPoints = tasks.reduce((acc, t) => acc + (t.done ? t.points : 0), 0);

  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null }
          : t
      )
    );
  }

  function completeAll() {
    const now = new Date().toISOString();
    setTasks((prev) => prev.map((t) => ({ ...t, done: true, doneAt: now })));
  }

  function resetAll() {
    setTasks((prev) => prev.map((t) => ({ ...t, done: false, doneAt: null })));
  }

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Daily Tasks</h1>
          <div style={styles.subText}>
            {dateStr}
            {focus ? ` • Focus: ${focus}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/dashboard" style={styles.secondaryBtn}>Back to Dashboard</Link>
          <Link to="/career/results" style={styles.secondaryBtn}>View Results</Link>
        </div>
      </div>

      {/* Progress */}
      <section style={styles.progressCard}>
        <div style={styles.progressLeft}>
          <div style={styles.kicker}>Progress</div>
          <div style={styles.bigValue}>
            {completed}/{tasks.length} completed
          </div>
        </div>
        <div style={styles.progressRight}>
          <div style={styles.kicker}>Points (demo)</div>
          <div style={styles.bigValue}>{totalPoints}</div>
        </div>
      </section>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: -4, marginBottom: 8 }}>
        <button type="button" onClick={completeAll} style={styles.primaryBtn}>
          Complete All
        </button>
        <button type="button" onClick={resetAll} style={styles.secondaryBtn}>
          Reset
        </button>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Tasks are generated daily and saved locally for <b>{email}</b>.
        </div>
      </div>

      {/* Tasks list */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <h2 style={styles.h2}>Today’s list</h2>
        </div>
        {!tasks.length ? (
          <div style={styles.empty}>No tasks for today.</div>
        ) : (
          <ol style={styles.list}>
            {tasks.map((t) => (
              <li key={t.id} style={styles.row}>
                <label style={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleDone(t.id)}
                  />
                </label>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      ...styles.title,
                      ...(t.done ? styles.titleDone : null),
                    }}
                  >
                    {t.title}
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.meta}>{t.minutes} min</span>
                    <span style={styles.dot}>•</span>
                    <span style={styles.meta}>{t.points} pts</span>
                    {t.doneAt ? (
                      <>
                        <span style={styles.dot}>•</span>
                        <span style={styles.meta}>Done: {new Date(t.doneAt).toLocaleTimeString()}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    type="button"
                    onClick={() => toggleDone(t.id)}
                    style={{
                      ...styles.smallBtn,
                      ...(t.done ? styles.smallBtnUndo : styles.smallBtnDo),
                    }}
                  >
                    {t.done ? "Undo" : "Mark complete"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1000, margin: "0 auto", padding: "24px 16px 48px", display: "grid", gap: 16 },
  headerRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2, color: "#0f172a" },
  subText: { marginTop: 4, color: "#475569" },

  progressCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "white",
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  progressLeft: {},
  progressRight: { textAlign: "right" },
  kicker: { fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  bigValue: { fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 4 },

  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardHead: { padding: "12px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" },
  h2: { margin: 0, fontSize: 16, fontWeight: 700 },

  list: { margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "grid",
    gridTemplateColumns: "32px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "10px 14px",
    borderTop: "1px solid #f1f5f9",
  },
  checkCol: { display: "grid", placeItems: "center" },
  title: { fontWeight: 600, color: "#0f172a" },
  titleDone: { textDecoration: "line-through", color: "#94a3b8" },
  metaRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  meta: { fontSize: 12, color: "#64748b" },
  dot: { color: "#cbd5e1" },

  smallBtn: {
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "white",
    fontSize: 12,
    padding: "6px 10px",
    cursor: "pointer",
  },
  smallBtnDo: { borderColor: "#0ea5e9" },
  smallBtnUndo: { borderColor: "#94a3b8", color: "#334155" },

  primaryBtn: {
    textDecoration: "none",
    background: "black",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    border: "1px solid black",
    cursor: "pointer",
  },
  secondaryBtn: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: { padding: 16, color: "#64748b", fontSize: 14 },
};
