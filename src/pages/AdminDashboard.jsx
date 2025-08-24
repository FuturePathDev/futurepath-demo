// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Resolve API base.
 */
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

function sortDesc(arr, key) {
  return [...(arr || [])].sort((a, b) => (Number(b?.[key]) || 0) - (Number(a?.[key]) || 0));
}

function toCSV(rows, headers) {
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
  const head = headers.map((h) => h.label).join(",");
  const body = (rows || [])
    .map((r) => headers.map((h) => esc(r[h.key])).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}
function downloadCSV(name, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export default function AdminDashboard() {
  const [district, setDistrict] = useState(() => {
    try {
      const raw = localStorage.getItem("fp_user");
      const obj = raw ? JSON.parse(raw) : null;
      return obj?.district || "";
    } catch {
      return "";
    }
  });
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [schools, setSchools] = useState([]);
  const [parents, setParents] = useState([]);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [parentTotal, setParentTotal] = useState(0);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const schoolsJson = await getJSON("/schools", { district: district || undefined, limit });
      const schoolsList = Array.isArray(schoolsJson?.overallTop) ? schoolsJson.overallTop : [];
      setSchools(schoolsList);
      setSchoolTotal(Number(schoolsJson?.total || schoolsList.length || 0));

      const parentsJson = await getJSON("/leaderboard/parents", {
        district: district || undefined,
        limit,
      });
      const parentsList = Array.isArray(parentsJson?.overallTop) ? parentsJson.overallTop : [];
      setParents(parentsList);
      setParentTotal(Number(parentsJson?.total || parentsList.length || 0));
    } catch (e) {
      setErr(e?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schoolsSorted = useMemo(() => sortDesc(schools, "engagement"), [schools]);
  const parentsSorted = useMemo(() => sortDesc(parents, "points"), [parents]);

  const schoolChartData = useMemo(
    () =>
      schoolsSorted.slice(0, limit).map((s) => ({
        name: s.name || s.id,
        engagement: Number(s.engagement) || 0,
      })),
    [schoolsSorted, limit]
  );
  const parentChartData = useMemo(
    () =>
      parentsSorted.slice(0, limit).map((p) => ({
        name: p.name || p.id,
        points: Number(p.points) || 0,
      })),
    [parentsSorted, limit]
  );

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Admin Dashboard</h1>
          <p style={styles.sub}>Engagement across schools and families.</p>
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Filter by district (optional)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={styles.input}
            aria-label="District"
          />
          <label style={styles.label}>
            Top&nbsp;
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={styles.select}
              aria-label="Top N"
            >
              {[3, 5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : null) }}
          >
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

      {/* Summary tiles */}
      <section style={styles.tiles}>
        <div style={styles.tile}>
          <div style={styles.tileLabel}>Schools (total)</div>
          <div style={styles.tileValue}>{schoolTotal}</div>
        </div>
        <div style={styles.tile}>
          <div style={styles.tileLabel}>Parents (total)</div>
          <div style={styles.tileValue}>{parentTotal}</div>
        </div>
      </section>

      {/* Charts */}
      <section style={styles.charts}>
        <div style={styles.chartCard}>
          <div style={styles.cardHead}>
            <h2 style={styles.h2}>Top Schools (engagement)</h2>
          </div>
          <div style={{ height: 260, padding: "8px 12px 16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.cardHead}>
            <h2 style={styles.h2}>Top Parents (points)</h2>
          </div>
          <div style={{ height: 260, padding: "8px 12px 16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parentChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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

      {/* Two-up lists with drill-down & CSV */}
      <section style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.h2}>
              Top Schools {district ? `• ${district}` : "• All Districts"}
            </h2>
            <button
              type="button"
              style={styles.linkBtn}
              onClick={() => {
                const csv = toCSV(schoolsSorted, [
                  { key: "id", label: "id" },
                  { key: "name", label: "name" },
                  { key: "district", label: "district" },
                  { key: "engagement", label: "engagement" },
                ]);
                downloadCSV(
                  `schools_top_${district ? district.replace(/\s+/g, "_") + "_" : ""}${limit}.csv`,
                  csv
                );
              }}
            >
              Export CSV
            </button>
          </div>

          {schoolsSorted.length === 0 ? (
            <div style={styles.empty}>No data.</div>
          ) : (
            <ol style={styles.list}>
              {schoolsSorted.map((s, idx) => (
                <li key={s.id ?? idx} style={styles.row}>
                  <span style={styles.rank}>{idx + 1}</span>
                  <div style={styles.person}>
                    <div style={styles.name}>
                      <Link to={`/admin/schools/${encodeURIComponent(s.id)}`} style={styles.linkName}>
                        {s.name ?? "—"}
                      </Link>
                    </div>
                    <div style={styles.metaSmall}>
                      ID: {s.id ?? "—"}
                      {s.district ? ` • ${s.district}` : ""}
                    </div>
                  </div>
                  <div style={styles.points}>
                    <span style={styles.pointsValue}>{s.engagement ?? 0}</span>
                    <span style={styles.pointsLabel}>engagement</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.h2}>
              Top Parents {district ? `• ${district}` : "• All Districts"}
            </h2>
            <button
              type="button"
              style={styles.linkBtn}
              onClick={() => {
                const csv = toCSV(parentsSorted, [
                  { key: "id", label: "id" },
                  { key: "name", label: "name" },
                  { key: "district", label: "district" },
                  { key: "points", label: "points" },
                ]);
                downloadCSV(
                  `parents_top_${district ? district.replace(/\s+/g, "_") + "_" : ""}${limit}.csv`,
                  csv
                );
              }}
            >
              Export CSV
            </button>
          </div>

          {parentsSorted.length === 0 ? (
            <div style={styles.empty}>No data.</div>
          ) : (
            <ol style={styles.list}>
              {parentsSorted.map((p, idx) => (
                <li key={p.id ?? idx} style={styles.row}>
                  <span style={styles.rank}>{idx + 1}</span>
                  <div style={styles.person}>
                    <div style={styles.name}>{p.name ?? "—"}</div>
                    <div style={styles.metaSmall}>
                      ID: {p.id ?? "—"}
                      {p.district ? ` • ${p.district}` : ""}
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
      </section>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px 48px" },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2, color: "#0f172a" },
  sub: { margin: "6px 0", color: "#475569" },

  controls: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  label: { fontSize: 14, color: "#0f172a" },
  input: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    minWidth: 240,
  },
  select: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  button: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  buttonDisabled: { opacity: 0.7, cursor: "default" },

  error: {
    border: "1px solid #ef4444",
    background: "#fef2f2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    margin: "8px 0 16px",
  },

  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 12,
    marginBottom: 16,
  },
  tile: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  tileLabel: { color: "#64748b", fontSize: 13, marginBottom: 6 },
  tileValue: { fontSize: 24, fontWeight: 800, color: "#0f172a" },

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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#0ea5e9",
    fontWeight: 600,
    cursor: "pointer",
    padding: 4,
  },
  linkName: { color: "#0ea5e9", textDecoration: "none" },
};
