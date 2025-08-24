// src/pages/ParentsLeaderboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";
import FocusCareerCard from "../components/FocusCareerCard.jsx";

/** Resolve API base (window → Vite → CRA → fallback) */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

/** Matches your mock set */
const FOCUS_MAP = [
  { key: "hospital",  title: "Hospital",     tone: "#0ea5e9", icon: "hospital"  },
  { key: "doctor",    title: "Doctor",       tone: "#10b981", icon: "doctor"    },
  { key: "lab",       title: "Laboratory",   tone: "#f59e0b", icon: "lab"       },
  { key: "pharmacy",  title: "Pharmacy",     tone: "#6366f1", icon: "pharmacy"  },
  { key: "insurance", title: "Insurance",    tone: "#ef4444", icon: "insurance" },
];

const DEMO_CHILDREN = [
  { email: "student@example.com", name: "Alex Kim" },
  { email: "jordan@example.com", name: "Jordan P." },
  { email: "ava.parentdemo@example.com", name: "Ava T." },
];

/* ----------------- localStorage helpers for tasks snapshot ----------------- */
function yyyy_mm_dd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function storageKey(email, dateStr) {
  return `fp_tasks::${email || "guest"}::${dateStr}`;
}
function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ----------------------------- children utils ----------------------------- */
function emailLike(s) {
  return typeof s === "string" && /\S+@\S+\.\S+/.test(s);
}

function toEntry(x) {
  if (!x) return null;
  if (typeof x === "string") {
    const e = x.trim();
    return emailLike(e) ? { email: e } : null;
  }
  if (typeof x === "object") {
    const e = String(x.email || "").trim();
    if (!emailLike(e)) return null;
    const name = x.name != null && String(x.name).trim() ? String(x.name).trim() : undefined;
    return name ? { email: e, name } : { email: e };
  }
  return null;
}

function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const o = toEntry(item);
    if (!o) continue;
    const key = o.email.toLowerCase();
    if (seen.has(key)) {
      const idx = out.findIndex((c) => c.email.toLowerCase() === key);
      if (idx >= 0 && !out[idx].name && o.name) out[idx].name = o.name;
      continue;
    }
    seen.add(key);
    out.push({ ...o });
  }
  return out.sort((a, b) => {
    const an = (a.name || "").toLowerCase();
    const bn = (b.name || "").toLowerCase();
    if (an !== bn) return an.localeCompare(bn);
    return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
  });
}

function getInitialChildEmail() {
  try {
    return localStorage.getItem("fp_parent_child_email") || "student@example.com";
  } catch {
    return "student@example.com";
  }
}

export default function ParentsLeaderboard() {
  const navigate = useNavigate();
  const { profile: parent, status } = useProfile();

  const parentEmail = parent?.email || null;
  const parentName = parent?.name || "Parent/Guardian";
  const parentDistrict = parent?.district || "—";

  // --- child selection ---
  const [childEmail, setChildEmail] = useState(getInitialChildEmail);
  useEffect(() => {
    try {
      localStorage.setItem("fp_parent_child_email", childEmail || "");
    } catch {}
  }, [childEmail]);

  // --- children list + edit ---
  const [children, setChildren] = useState(() => {
    return normalizeList(safeGet("fp_parent_children", []));
  });
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenErr, setChildrenErr] = useState("");
  const [newChildEmail, setNewChildEmail] = useState("");
  const [newChildName, setNewChildName] = useState("");
  const [editName, setEditName] = useState("");

  // load server children
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!parentEmail) return;
      setChildrenLoading(true);
      setChildrenErr("");
      try {
        const res = await fetch(`${API_BASE}/user?email=${encodeURIComponent(parentEmail)}`, {
          headers: { Accept: "application/json" },
        });
        const json = await res.json().catch(() => null);
        const serverChildren = normalizeList(json?.profile?.children || []);
        if (!ignore) {
          setChildren(serverChildren);
          try {
            localStorage.setItem("fp_parent_children", JSON.stringify(serverChildren));
          } catch {}
          if (!childEmail && serverChildren.length) {
            setChildEmail(serverChildren[0].email);
          }
        }
      } catch (e) {
        if (!ignore) setChildrenErr(e?.message || "Unable to load children");
      } finally {
        if (!ignore) setChildrenLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [parentEmail]); // run when parent identity available

  async function persistChildren(nextList) {
    const norm = normalizeList(nextList);
    setChildren(norm);
    try {
      localStorage.setItem("fp_parent_children", JSON.stringify(norm));
    } catch {}
    if (!parentEmail) return;
    try {
      await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail, children: norm }),
      });
    } catch {
      // ignore for demo
    }
  }

  function addChild(email, name) {
    const e = String(email || "").trim();
    if (!emailLike(e)) return;
    const entry = normalizeList([{ email: e, name }])[0];
    if (!entry) return;
    const existing = children.find((c) => c.email.toLowerCase() === e.toLowerCase());
    let next;
    if (existing) {
      // update name if provided
      next = children.map((c) =>
        c.email.toLowerCase() === e.toLowerCase()
          ? { ...c, name: c.name || entry.name }
          : c
      );
    } else {
      next = [...children, entry];
    }
    persistChildren(next);
    setChildEmail(e);
    setNewChildEmail("");
    setNewChildName("");
  }

  function removeChild(email) {
    const e = String(email || "").toLowerCase();
    const next = children.filter((c) => c.email.toLowerCase() !== e);
    persistChildren(next);
    if (String(childEmail || "").toLowerCase() === e) {
      setChildEmail(next[0]?.email || "");
    }
  }

  // Compute selected child & editName binding
  const selectedChild = useMemo(
    () => children.find((c) => c.email.toLowerCase() === String(childEmail || "").toLowerCase()) || null,
    [children, childEmail]
  );
  useEffect(() => {
    setEditName(selectedChild?.name || "");
  }, [selectedChild?.email]); // re-init when selection changes

  function saveSelectedChildName() {
    if (!selectedChild) return;
    const trimmed = String(editName || "").trim();
    const next = children.map((c) =>
      c.email.toLowerCase() === selectedChild.email.toLowerCase()
        ? (trimmed ? { ...c, name: trimmed } : { email: c.email })
        : c
    );
    persistChildren(next);
  }

  // Load child profile (name, district, grade, focus) from API
  const [childProfile, setChildProfile] = useState(null);
  const [childLoading, setChildLoading] = useState(false);
  const [childErr, setChildErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!childEmail) {
        setChildProfile(null);
        return;
      }
      setChildLoading(true);
      setChildErr("");
      try {
        const res = await fetch(`${API_BASE}/user?email=${encodeURIComponent(childEmail)}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!ignore) setChildProfile(json?.profile || null);
      } catch (e) {
        if (!ignore) {
          setChildProfile(null);
          setChildErr(e?.message || "Unable to load child profile");
        }
      } finally {
        if (!ignore) setChildLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [childEmail]);

  // Snapshot of tasks for selected child
  const today = yyyy_mm_dd();
  const childTasks = safeGet(storageKey(childEmail, today), []);
  const completed = Array.isArray(childTasks) ? childTasks.filter((t) => t?.done).length : 0;
  const total = Array.isArray(childTasks) ? childTasks.length : 0;

  // Display fields
  const childName = selectedChild?.name || childProfile?.name || "(student)";
  const childDistrict = childProfile?.district || "—";
  const childGrade = childProfile?.grade ? `Grade ${childProfile.grade}` : "—";
  const childFocus =
    Array.isArray(childProfile?.focusCareers) && childProfile.focusCareers.length
      ? childProfile.focusCareers[0]
      : null;

  function openChildTasks() {
    try {
      localStorage.setItem("demoEmail", childEmail);
    } catch {}
    navigate("/tasks");
  }

  const cards = useMemo(() => FOCUS_MAP, []);

  return (
    <div style={styles.wrap}>
      {/* Parent header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Welcome, {parentName}</h1>
          <div style={styles.subText}>
            {parentDistrict} • Viewing: {childName} {childGrade !== "—" ? `• ${childGrade}` : ""}
          </div>
          {childErr ? <div style={{ color: "#b91c1c", fontSize: 12 }}>{childErr}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/leaders/parents" style={styles.secondaryBtn}>Parents Leaderboard</Link>
          <Link to="/leaders/schools" style={styles.secondaryBtn}>Schools Leaderboard</Link>
        </div>
      </div>

      {/* Children manager */}
      <section style={styles.selectorCard}>
        <div style={styles.selectorRow}>
          <div style={{ fontWeight: 700 }}>Students</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="student email"
              value={newChildEmail}
              onChange={(e) => setNewChildEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="name (optional)"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => addChild(newChildEmail, newChildName)}
              style={styles.button}
              disabled={!emailLike(newChildEmail)}
              title="Add student"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => childEmail && openChildTasks()}
              style={styles.button}
              disabled={!childEmail}
              title="Open current student's tasks"
            >
              Open Tasks
            </button>
          </div>
        </div>

        <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {childrenLoading ? (
            <span style={{ color: "#64748b" }}>Loading…</span>
          ) : childrenErr ? (
            <span style={{ color: "#b91c1c" }}>{childrenErr}</span>
          ) : children.length ? (
            children.map((c) => {
              const selected = String(childEmail || "").toLowerCase() === c.email.toLowerCase();
              const label = c.name || c.email;
              return (
                <div key={c.email} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setChildEmail(c.email)}
                    style={{
                      ...styles.chip,
                      ...(selected ? styles.chipActive : null),
                    }}
                    title={c.email}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChild(c.email)}
                    style={styles.chipRemove}
                    aria-label={`Remove ${label}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                No students yet. Add one by email, or click to add a demo:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DEMO_CHILDREN.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => addChild(d.email, d.name)}
                    style={styles.chip}
                    title={`Add ${d.name}`}
                  >
                    {d.name} • {d.email}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rename selected child */}
        {selectedChild ? (
          <div
            style={{
              padding: 12,
              borderTop: "1px dashed #e2e8f0",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 13, color: "#475569" }}>
              Label for <b>{selectedChild.email}</b>
            </div>
            <input
              type="text"
              placeholder="enter a display name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={styles.input}
            />
            <button type="button" onClick={saveSelectedChildName} style={styles.button}>
              Save name
            </button>
          </div>
        ) : null}
      </section>

      {/* Focus Career hero */}
      <section style={styles.focusHero}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={styles.kicker}>Child’s Focus</div>
          <div style={styles.focusTitle}>{childFocus || "Not set yet"}</div>
          <div style={styles.focusSub}>
            Guidance and opportunities aligned to your student’s selected pathway.
          </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={openChildTasks} style={styles.pillBtn}>View Today’s Tasks</button>
            <Link to="/assessment/results" style={styles.pillBtnOutline}>Assessment Results</Link>
          </div>
        </div>

        <div style={styles.avatars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ ...styles.avatar, transform: `translateX(${i * -10}px)` }}>
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* Today’s Tasks widget */}
      <section style={styles.widgetRow}>
        <div style={styles.widgetCard}>
          <div style={styles.widgetHead}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={styles.widgetKicker}>Today’s Tasks</span>
              <span style={styles.widgetDate}>{today}</span>
            </div>
            <button onClick={openChildTasks} style={styles.widgetLinkBtn}>Open Tasks</button>
          </div>

          <div style={styles.widgetBody}>
            {total ? (
              <>
                <div style={styles.widgetBig}>
                  {childName}: {completed}/{total} completed
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.round((completed / total) * 100)}%`,
                    }}
                  />
                </div>
                {childFocus ? (
                  <div style={styles.widgetHint}>Focus: <b>{childFocus}</b></div>
                ) : (
                  <div style={styles.widgetHint}>
                    Encourage your student to complete the{" "}
                    <Link to="/assessment" style={styles.widgetInlineLink}>Career Assessment</Link>.
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={styles.widgetBig}>{childName}: No tasks yet today</div>
                <div style={styles.widgetHint}>
                  Have them visit{" "}
                  <button onClick={openChildTasks} style={styles.widgetInlineBtn}>Daily Tasks</button>{" "}
                  to generate their list.
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Focus cards (read-only for parents) */}
      <section>
        <div style={styles.rowHeader}>
          <h2 style={styles.h2}>Focus Pathways</h2>
          <Link to="/assessment/results" style={styles.link}>See results</Link>
        </div>

        <div style={styles.cardRow}>
          {cards.map((c) => (
            <FocusCareerCard
              key={c.key}
              tone={c.tone}
              title={c.title}
              icon={c.icon}
              onSelect={() => {}}
              footer={childFocus === c.title ? "Selected" : "Learn more"}
            />
          ))}
        </div>
      </section>

      {/* District engagement stub */}
      <section style={styles.mapStub}>
        <div style={{ fontWeight: 700 }}>District Engagement</div>
        <div style={{ fontSize: 12, color: "#475569" }}>Charts / modules placeholder</div>
      </section>

      {status !== "idle" ? (
        <div style={{ fontSize: 12, color: "#64748b" }}>Syncing your account…</div>
      ) : null}
    </div>
  );
}

/* ------------------------------- styles ------------------------------- */
const styles = {
  wrap: { display: "grid", gap: 16, padding: "24px 16px 48px", maxWidth: 1200, margin: "0 auto" },
  headerRow: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
  },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2, color: "#0f172a" },
  subText: { marginTop: 4, color: "#475569" },

  selectorCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  selectorRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
  },
  input: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14, minWidth: 220,
  },
  button: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  chip: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 13,
    cursor: "pointer",
  },
  chipActive: {
    borderColor: "#0ea5e9",
    boxShadow: "0 0 0 2px rgba(14,165,233,0.15) inset",
  },
  chipRemove: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    borderRadius: 14,
    padding: "0 8px",
    height: 28,
    cursor: "pointer",
    fontWeight: 800,
    lineHeight: "26px",
  },

  focusHero: {
    display: "grid",
    gridTemplateColumns: "1fr 260px",
    alignItems: "center",
    gap: 10,
    padding: 18,
    borderRadius: 20,
    color: "white",
    background: "linear-gradient(135deg,#14b8a6 0%, #06b6d4 60%, #3b82f6 100%)",
    boxShadow: "0 20px 40px rgba(2,132,199,0.25)",
  },
  kicker: { textTransform: "uppercase", fontSize: 12, letterSpacing: 1, opacity: 0.95 },
  focusTitle: { fontSize: 28, fontWeight: 800, letterSpacing: 0.3 },
  focusSub: { opacity: 0.95 },
  pillBtn: {
    background: "white",
    color: "#0ea5e9",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    border: "1px solid transparent",
  },
  pillBtnOutline: {
    background: "transparent",
    color: "white",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.7)",
    textDecoration: "none",
  },
  avatars: { display: "flex", justifyContent: "flex-end" },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "rgba(255,255,255,0.9)", color: "#0ea5e9",
    display: "grid", placeItems: "center", fontWeight: 800,
    boxShadow: "0 8px 18px rgba(2,8,23,0.2)",
  },

  /* Today widget styles */
  widgetRow: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },
  widgetCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  widgetHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  widgetKicker: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, color: "#64748b" },
  widgetDate: { fontSize: 12, color: "#64748b" },
  widgetLinkBtn: {
    fontSize: 13, color: "#0ea5e9", textDecoration: "none", fontWeight: 600,
    background: "transparent", border: "none", cursor: "pointer",
  },
  widgetInlineLink: { color: "#0ea5e9", textDecoration: "none", fontWeight: 600 },
  widgetInlineBtn: {
    color: "#0ea5e9", textDecoration: "none", fontWeight: 600,
    background: "transparent", border: "none", cursor: "pointer", padding: 0,
  },
  widgetBody: { padding: 14 },
  widgetBig: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
  widgetHint: { marginTop: 6, fontSize: 13, color: "#475569" },
  progressTrack: {
    width: "100%",
    height: 8,
    background: "#eef2f7",
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    background: "#0ea5e9",
    borderRadius: 999,
    transition: "width 200ms ease",
  },

  rowHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  h2: { margin: 0, fontSize: 18, color: "#0f172a" },
  link: { color: "#0ea5e9", textDecoration: "none", fontWeight: 600 },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0,1fr))",
    gap: 12,
  },

  mapStub: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 18px rgba(2,8,23,0.04)",
  },

  secondaryBtn: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
};
