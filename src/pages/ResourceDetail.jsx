// src/pages/ResourceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResource, listBookmarks, addBookmark, removeBookmark } from "../api/Resources.js";

export default function ResourceDetail() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [detail, bms] = await Promise.all([getResource(id), listBookmarks()]);
        if (!ignore) {
          setR(detail);
          setSaved(bms.some((b) => b.resourceId === id));
        }
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load resource");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  async function toggleBookmark() {
    try {
      if (!saved) {
        await addBookmark(id);
        setSaved(true);
      } else {
        await removeBookmark(id);
        setSaved(false);
      }
    } catch {
      // ignore for demo
    }
  }

  if (loading && !r) return <div style={sx.wrap}>Loading…</div>;
  if (err) return <div style={sx.wrap}><div style={sx.err}>{err}</div></div>;
  if (!r) return <div style={sx.wrap}>Not found.</div>;

  return (
    <div style={sx.wrap}>
      <div style={sx.topRow}>
        <Link to="/resources" style={sx.back}>&larr; All resources</Link>
        <button onClick={toggleBookmark} style={{ ...sx.saveBtn, ...(saved ? sx.saveOn : null) }}>
          {saved ? "★ Saved" : "☆ Save"}
        </button>
      </div>

      <h1 style={sx.h1}>{r.title}</h1>
      <p style={sx.sum}>{r.summary}</p>

      <div style={sx.meta}>
        {r.audience?.length ? <Badge>Audience: {r.audience.join(", ")}</Badge> : null}
        {r.grades?.length ? <Badge>Grades: {r.grades.join(", ")}</Badge> : null}
        {r.formats?.length ? <Badge>{r.formats.join(", ")}</Badge> : null}
        {typeof r.durationMin === "number" ? <Badge>{r.durationMin} min</Badge> : null}
        {r.costType ? <Badge>{r.costType}</Badge> : null}
        {r.language?.length ? <Badge>{r.language.join(", ")}</Badge> : null}
      </div>

      {/* Placeholder for richer content (links, downloads, embeds) */}
      <section style={sx.bodyCard}>
        <div style={{ color: "#475569", fontSize: 14 }}>
          This is a FuturePath resource. In a later pass, we can attach external links,
          PDFs, or embed a walkthrough video here.
        </div>
      </section>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        fontSize: 12,
        border: "1px solid #e2e8f0",
        padding: "2px 8px",
        borderRadius: 999,
        background: "#f8fafc",
      }}
    >
      {children}
    </span>
  );
}

const sx = {
  wrap: { maxWidth: 840, margin: "0 auto", padding: "20px 16px 40px", display: "grid", gap: 10 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  back: { textDecoration: "none", color: "#0ea5e9" },
  saveBtn: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  saveOn: { borderColor: "#fde68a", background: "#fffbeb" },
  h1: { margin: "4px 0 0 0", fontSize: 26, color: "#0f172a" },
  sum: { margin: 0, color: "#334155", fontSize: 15 },
  meta: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  bodyCard: {
    marginTop: 10,
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
};


