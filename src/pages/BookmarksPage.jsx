// src/pages/BookmarksPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listBookmarks,
  removeBookmark,
  getResource,
} from "../api/Resources.js";

export default function BookmarksPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]); // [{ id, title, summary }]

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const bms = await listBookmarks(); // [{userId, resourceId, createdAt}]
      const ids = bms.map((b) => b.resourceId);
      // Fetch details in parallel; ignore failures
      const details = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await getResource(id);
            return { id: r.id, title: r.title, summary: r.summary };
          } catch {
            return null;
          }
        })
      );
      setRows(details.filter(Boolean));
    } catch (e) {
      setErr(e?.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onRemove(id) {
    try {
      await removeBookmark(id);
      setRows((xs) => xs.filter((r) => r.id !== id));
    } catch {
      // ignore for demo
    }
  }

  return (
    <div style={sx.wrap}>
      <div style={sx.header}>
        <h1 style={sx.h1}>Bookmarks</h1>
        <Link to="/resources" style={sx.link}>Browse resources →</Link>
      </div>

      {loading ? <div>Loading…</div> : null}
      {err ? <div style={sx.err}>{err}</div> : null}

      {!loading && !err && rows.length === 0 ? (
        <div style={sx.empty}>
          No saved items yet. Visit <Link to="/resources" style={sx.inlineLink}>Resources</Link> and click ☆ to save.
        </div>
      ) : null}

      <div style={sx.list}>
        {rows.map((r) => (
          <article key={r.id} style={sx.card}>
            <div style={sx.cardTop}>
              <Link to={`/resources/${encodeURIComponent(r.id)}`} style={sx.title}>
                {r.title}
              </Link>
              <button onClick={() => onRemove(r.id)} style={sx.unBtn} title="Remove bookmark">
                Remove
              </button>
            </div>
            <p style={sx.sum}>{r.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const sx = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px", display: "grid", gap: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  h1: { margin: 0, fontSize: 24, color: "#0f172a" },
  link: { color: "#0ea5e9", textDecoration: "none", fontWeight: 600 },
  inlineLink: { color: "#0ea5e9", textDecoration: "none" },
  err: { color: "#b91c1c" },
  empty: {
    border: "1px dashed #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
  },
  list: { display: "grid", gap: 10 },
  card: { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 6 },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" },
  title: { color: "#0f172a", textDecoration: "none", fontWeight: 700 },
  sum: { margin: 0, color: "#334155" },
  unBtn: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    borderRadius: 10,
    padding: "4px 8px",
    cursor: "pointer",
    fontWeight: 700,
  },
};
