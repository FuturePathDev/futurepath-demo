import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

const BUCKET_ORDER = ["middleSchool", "grade9", "grade10", "grade11", "grade12"];
const BUCKET_LABELS = {
  middleSchool: "Middle School",
  grade9: "Grade 9",
  grade10: "Grade 10",
  grade11: "Grade 11",
  grade12: "Grade 12",
};

export default function Announcements() {
  const [email, setEmail] = useState("student@example.com");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const lastUpdatedRef = useRef(null);

  async function load() {
    try {
      setStatus("loading");
      setError("");
      const res = await fetch(`${API_BASE}/announcements`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      lastUpdatedRef.current = new Date();
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Failed to load announcements");
    }
  }

  async function dismiss(id) {
    try {
      const res = await fetch(`${API_BASE}/notifications/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: email, id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic removal from UI:
      setData((prev) => {
        if (!prev) return prev;
        const out = {};
        for (const k of Object.keys(prev)) {
          out[k] = (prev[k] || []).filter((a) => a.id !== id);
        }
        return out;
      });
    } catch (e) {
      alert(`Could not dismiss: ${e?.message || e}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const perBucket = useMemo(() => {
    const out = {};
    BUCKET_ORDER.forEach((b) => (out[b] = data?.[b] || []));
    return out;
  }, [data]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Announcements</h1>
      <div style={{ color: "#475569", marginBottom: 10 }}>
        Last updated: {lastUpdatedRef.current ? lastUpdatedRef.current.toLocaleTimeString() : "—"}
      </div>

      <div style={toolbar}>
        <label style={label}>
          User email:
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="you@example.com"
          />
        </label>
        <button onClick={load} style={btn}>Refresh</button>
      </div>

      {status === "error" && (
        <div style={errorBox}>Failed to load: {error}</div>
      )}

      <div style={grid}>
        {BUCKET_ORDER.map((b) => (
          <div key={b} style={card}>
            <div style={cardHead}>
              <h2 style={h2}>{BUCKET_LABELS[b]}</h2>
            </div>
            <div style={{ padding: 14 }}>
              {!perBucket[b].length ? (
                <div style={{ color: "#64748b" }}>No announcements.</div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {perBucket[b].map((a) => (
                    <li key={a.id} style={row}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.title}</div>
                        <div style={{ color: "#475569", marginTop: 4 }}>{a.body}</div>
                        <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>ID: {a.id}</div>
                      </div>
                      <div>
                        <button style={btnSmall} onClick={() => dismiss(a.id)}>Dismiss</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const toolbar = { display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" };
const label = { display: "flex", alignItems: "center", gap: 6, fontSize: 14 };
const input = { padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 8 };
const btn = { padding: "8px 12px", borderRadius: 10, border: "1px solid #0ea5e9", background: "white", cursor: "pointer" };
const errorBox = { padding: 12, border: "1px solid #ef4444", background: "#fef2f2", color: "#991b1b", borderRadius: 10, marginBottom: 12 };
const grid = { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" };
const card = { background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };
const cardHead = { padding: "10px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" };
const h2 = { margin: 0, fontSize: 16 };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid #f1f5f9" };
const btnSmall = { padding: "6px 10px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
