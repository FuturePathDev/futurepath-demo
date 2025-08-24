// src/components/ParentMentorStickyCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createMentorInvite, listMentorInvitesByStudent } from "../lib/mentorsApi";

/**
 * Small, self-contained sticky mentor panel for the Parent dashboard.
 * - Shows recommended mentors (demo content)
 * - “Invite” calls real API (/mentors/invite)
 * - Loads recent invites from API (with local fallback)
 * - Optimistic UI
 */

const DEMO_MENTORS = [
  {
    id: "m-101",
    name: "Dr. Priya Shah",
    title: "Pediatrician",
    org: "Metro Health",
    tags: ["Healthcare", "Pediatrics"],
  },
  {
    id: "m-102",
    name: "Luis Ortega",
    title: "Clinical Lab Scientist",
    org: "Riverside Med Labs",
    tags: ["Laboratory", "Diagnostics"],
  },
  {
    id: "m-103",
    name: "Avery Chen",
    title: "Pharmacist",
    org: "Canyon Pharmacy",
    tags: ["Pharmacy", "Community Health"],
  },
];

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function ParentMentorStickyCard({ selectedChild }) {
  const [invites, setInvites] = useState(() => safeGet("fp_parent_invites", []));
  const [recent, setRecent] = useState(null); // {ok,msg} or {err,msg}
  const [loading, setLoading] = useState(false);

  const childName = selectedChild?.name || "your student";
  const childEmail = selectedChild?.email || null;

  // Load from API when student changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!childEmail) return;
      setLoading(true);
      try {
        const data = await listMentorInvitesByStudent(childEmail, 5);
        const list = Array.isArray(data?.invites) ? data.invites : [];
        if (!cancelled) {
          setInvites(list);
          safeSet("fp_parent_invites", list);
        }
      } catch (e) {
        // Keep local cache; surface a gentle toast
        if (!cancelled) {
          setRecent({ err: true, msg: "Couldn’t refresh invites (using local cache)." });
          setTimeout(() => setRecent(null), 2500);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [childEmail]);

  async function invite(mentor) {
    if (!childEmail) return;

    // optimistic add (for the visible “recent invites” list)
    const optimistic = {
      studentEmail: childEmail,
      inviteId: "local-" + Date.now(),
      mentorId: mentor.id,
      mentorName: mentor.name,
      studentName: selectedChild?.name || null,
      status: "invited",
      createdAt: new Date().toISOString(),
    };
    setInvites((prev) => {
      const next = [optimistic, ...prev].slice(0, 10);
      safeSet("fp_parent_invites", next);
      return next;
    });
    setRecent({ ok: true, msg: `Invited ${mentor.name} for ${childName}.` });
    setTimeout(() => setRecent(null), 2000);

    // real POST
    try {
      const { invite } = await createMentorInvite({
        mentorId: mentor.id,
        mentorName: mentor.name,
        studentEmail: childEmail,
        studentName: selectedChild?.name || null,
        // If you have parent profile in context, attach it here:
        // parentEmail: profile.email,
        // parentName: profile.name,
      });

      // replace optimistic with server row
      setInvites((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((x) => x.inviteId === optimistic.inviteId);
        if (idx >= 0) copy[idx] = invite;
        else copy.unshift(invite);
        safeSet("fp_parent_invites", copy);
        return copy;
      });
    } catch (e) {
      // rollback optimistic on hard failure
      setInvites((prev) => {
        const copy = prev.filter((x) => x.inviteId !== optimistic.inviteId);
        safeSet("fp_parent_invites", copy);
        return copy;
      });
      setRecent({ err: true, msg: "Invite failed. Please try again." });
      setTimeout(() => setRecent(null), 2500);
    }
  }

  const lastFew = useMemo(() => invites.slice(0, 3), [invites]);

  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <h3 style={styles.h3}>Mentors</h3>
          <Link to="/mentors" style={styles.linkSm}>Browse all</Link>
        </div>
        <div style={styles.sub}>
          {selectedChild?.name ? `For ${selectedChild.name}` : "Select a student"}
          {loading ? <span style={{ marginLeft: 8, color: "#64748b" }}>• loading…</span> : null}
        </div>
      </div>

      {recent ? (
        <div style={recent.err ? styles.toastErr : styles.toastOk}>{recent.msg}</div>
      ) : null}

      <ul style={styles.list}>
        {DEMO_MENTORS.map((m) => (
          <li key={m.id} style={styles.row}>
            <div style={{ minWidth: 0 }}>
              <div style={styles.mName}>{m.name}</div>
              <div style={styles.mMeta}>{m.title} • {m.org}</div>
              <div style={styles.tags}>
                {m.tags.map((t, i) => (
                  <span key={i} style={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!childEmail}
              onClick={() => invite(m)}
              title={childEmail ? `Invite ${m.name}` : "Select a student to invite"}
              style={{
                ...styles.btn,
                ...(childEmail ? null : styles.btnDisabled),
              }}
            >
              Invite
            </button>
          </li>
        ))}
      </ul>

      {lastFew.length ? (
        <div style={styles.invitesWrap}>
          <div style={styles.invitesTitle}>Recent invites</div>
          <ul style={styles.invitesList}>
            {lastFew.map((v, i) => (
              <li key={v.inviteId || i} style={styles.inviteRow}>
                <span style={{ fontWeight: 600 }}>{v.mentorName}</span>
                <span style={{ color: "#64748b" }}>
                  {" • "}
                  {v.studentName || v.studentEmail || "student"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={styles.footer}>
        <Link to="/mentors" style={styles.primaryBtn}>Find more mentors</Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardHead: { padding: "12px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" },
  h3: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" },
  sub: { marginTop: 4, fontSize: 12, color: "#64748b" },

  toastOk: {
    margin: 12,
    padding: "8px 10px",
    borderRadius: 10,
    background: "#ecfeff",
    border: "1px solid #06b6d4",
    color: "#0e7490",
    fontSize: 13,
  },
  toastErr: {
    margin: 12,
    padding: "8px 10px",
    borderRadius: 10,
    background: "#fef2f2",
    border: "1px solid #ef4444",
    color: "#991b1b",
    fontSize: 13,
  },

  list: { listStyle: "none", margin: 0, padding: 0 },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    padding: "10px 12px",
    borderTop: "1px solid #f1f5f9",
    alignItems: "center",
  },

  mName: { fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mMeta: { fontSize: 12, color: "#475569", marginTop: 2 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: { fontSize: 11, color: "#0ea5e9", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "2px 6px", borderRadius: 999 },

  btn: {
    border: "1px solid #0ea5e9",
    background: "white",
    color: "#0ea5e9",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  btnDisabled: { opacity: 0.6, cursor: "default", borderColor: "#cbd5e1", color: "#94a3b8" },

  invitesWrap: { padding: "8px 12px 0" },
  invitesTitle: { fontSize: 12, color: "#64748b", margin: "0 0 6px" },
  invitesList: { listStyle: "none", padding: 0, margin: 0 },
  inviteRow: { fontSize: 13, padding: "6px 0", borderTop: "1px dashed #eef2f7" },

  footer: { padding: 12, borderTop: "1px solid #f1f5f9" },
  primaryBtn: {
    display: "inline-block",
    textDecoration: "none",
    background: "black",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
  },
  linkSm: { color: "#0ea5e9", textDecoration: "none", fontSize: 13, fontWeight: 600 },
};
