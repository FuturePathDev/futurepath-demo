// src/pages/SchoolDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_BASE = (() => {
  const g = typeof globalThis !== "undefined" ? globalThis : {};
  const fromWindow =
    typeof window !== "undefined" && window.API_BASE ? window.API_BASE : null;
  const fromVite =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE
      ? import.meta.env.VITE_API_BASE
      : null;
  const fromCRA =
    g.process && g.process.env && g.process.env.REACT_APP_API_BASE
      ? g.process.env.REACT_APP_API_BASE
      : null;
  return (
    fromWindow ||
    fromVite ||
    fromCRA ||
    "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo"
  );
})();

async function getJSON(path, params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      usp.set(k, String(v));
    }
  });
  const url = `${API_BASE}${path}${usp.toString() ? `?${usp.toString()}` : ""}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} -> HTTP ${res.status}\n${text || "(no body)"}`);
  }
  return res.json();
}

export default function SchoolDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [school, setSchool] = useState(null);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      // 1) Find this school from /schools overallTop
      const schoolsJson = await getJSON("/schools", { limit: 100 });
      const allSchools = Array.isArray(schoolsJson?.overallTop) ? schoolsJson.overallTop : [];
      const current = allSchools.find((s) => String(s.id) === String(id)) || null;
      setSchool(current);

      // 2) Try to fetch parents/students filtered by schoolId (if backend supports it)
      let parentList = [];
      try {
        const pj = await getJSON("/leaderboard/parents", { schoolId: id, limit: 20 });
        parentList = Array.isArray(pj?.overallTop) ? pj.overallTop : [];
      } catch {
        // fallback: filter by district if we have it
        if (current?.district) {
          const pj = await getJSON("/leaderboard/parents", {
            district: current.district,
            limit: 50,
          });
          parentList = Array.isArray(pj?.overallTop) ? pj.overallTop : [];
        } else {
          parentList = [];
        }
      }
      setParents(parentList);

      let studentList = [];
      try {
        const sj = await getJSON("/leaderboard", { schoolId: id, limit: 20 });
        // your students endpoint returns buckets; flatten quick top list
        if (sj?.overallTop) {
          studentList = Array.isArray(sj.overallTop) ? sj.overallTop : [];
        } else {
          const buckets = ["middleSchool", "grade9", "grade10", "grade11", "grade12"];
          studentList = buckets.flatMap((b) => sj?.[b] || []);
        }
      } catch {
        studentList = [];
      }
      setStudents(studentList);
    } catch (e) {
      setErr(e?.message || "Failed to load school details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const parentChart = useMemo(
    () =>
      parents
        .slice(0, 10)
        .map((p) => ({ name: p.name || p.id, points: Number(p.points) || 0 })),
    [parents]
  );
  const studentChart = useMemo(
    () =>
      students
        .slice(0, 10)
        .map((s) => ({ name: s.name || s.id, points: Number(s.points) || 0 })),
    [students]
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.breadcrumbs}>
        <Link to="/admin" style={styles.breadLink}>← Back to Admin</Link>
      </div>

      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>
            {school?.name || id}
          </h1>
          <p style={styles.sub}>
            {school?.district ? `District: ${school.district} • ` : ""}
            Engagement: <strong>{school?.engagement ?? "—"}</strong>
          </p>
        </div>

        <div>
          <button type="button" onClick={load} disabled={loading} style={styles.button}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      {err ? (
        <div style={styles.error}>
          <strong>Failed to load.</strong>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
        </div>
      ) : null}

      <section style={styles.charts}>
        <div style={styles.chartCard}>
          <div style={styles.cardHead}><h2 style={styles.h2}>Top Parents (points)</h2></div>
          <div style={{ height: 260, padding: "8px 12px 16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parentChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.cardHead}><h2 style={styles.h2}>Top Students (points)</h2></div>
          <div style={{ height: 260, padding: "8px 12px 16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHead}><h2 style={styles.h2}>Parents</h2></div>
          {parents.length === 0 ? (
            <div style={styles.empty}>
              No parent data. If your backend adds <code>?schoolId=</code> support to
              <code> /leaderboard/parents</code>, this panel will populate automatically.
            </div>
          ) : (
            <ol style={styles.list}>
              {parents.map((p, idx) => (
                <li key={p.id ?? idx} style={styles.row}>
                  <span style={styles.rank}>{idx + 1}</span>
                  <div style={styles.person}>
                    <div style={styles.name}>{p.name ?? "—"}</div>
                    <div style={styles.metaSmall}>
                      ID: {p.id ?? "—"}{p.district ? ` • ${p.district}` : ""}
                    </div>
                  </div>
                  <div style={styles.points}>
                    <span style={styles.pointsValue}>{p.points ?? 0}</span>
                    <span style={styles.pointsLabel}>pts</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}><h2 style={styles.h2}>Students</h2></div>
          {students.length === 0 ? (
            <div style={styles.empty}>
              No student data. If your backend adds <code>?schoolId=</code> support to
              <code> /leaderboard</code>, this panel will populate automatically.
            </div>
          ) : (
            <ol style={styles.list}>
              {students.map((s, idx) => (
                <li key={`${s.bucket || "all"}-${s.id ?? idx}`} style={styles.row}>
                  <span style={styles.rank}>{idx + 1}</span>
                  <div style={styles.person}>
                    <div style={styles.name}>{s.name ?? "—"}</div>
                    <div style={styles.metaSmall}>
                      {s.bucket ? `${s.bucket} • ` : ""}ID: {s.id ?? "—"}
                    </div>
                  </div>
                  <div style={styles.points}>
                    <span style={styles.pointsValue}>{s.points ?? 0}</span>
                    <span style={styles.pointsLabel}>pts</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px 48px" },
  breadcrumbs: { marginBottom: 8 },
  breadLink: { color: "#0ea5e9", textDecoration: "none", fontWeight: 600 },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2, color: "#0f172a" },
  sub: { margin: "6px 0", color: "#475569" },

  button: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },

  error: {
    border: "1px solid #ef4444",
    background: "#fef2f2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    margin: "8px 0 16px",
  },

  charts: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 16,
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardHead: {
    padding: "10px 14px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  h2: { margin: 0, fontSize: 16 },

  list: { margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "grid",
    gridTemplateColumns: "40px 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderTop: "1px solid #f1f5f9",
  },
  rank: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    color: "#334155",
    textAlign: "right",
  },
  person: { minWidth: 0 },
  name: {
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaSmall: { fontSize: 12, color: "#64748b", marginTop: 2 },
  points: { display: "flex", alignItems: "baseline", gap: 6 },
  pointsValue: { fontVariantNumeric: "tabular-nums", fontWeight: 700 },
  pointsLabel: { fontSize: 12, color: "#64748b" },
  empty: { padding: 16, color: "#64748b", fontSize: 14 },
};
