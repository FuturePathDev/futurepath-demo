import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Resolve API base just like the rest of the app:
 * - window.API_BASE (quick override)
 * - Vite: import.meta.env.VITE_API_BASE
 * - CRA:  process.env.REACT_APP_API_BASE
 * - Fallback: your demo stage URL
 */
const API_BASE = (() => {
  const fromWindow = typeof window !== "undefined" && window.API_BASE ? window.API_BASE : null;
  const fromVite =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE
      ? import.meta.env.VITE_API_BASE
      : null;
  const fromCRA =
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE
      ? process.env.REACT_APP_API_BASE
      : null;

  return (
    fromWindow ||
    fromVite ||
    fromCRA ||
    "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo"
  );
})();

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function sortSchools(arr) {
  // Defensive sort by engagement desc, then name asc, then id asc
  return [...(arr || [])].sort((a, b) => {
    const ae = Number(a?.engagement || 0);
    const be = Number(b?.engagement || 0);
    if (be !== ae) return be - ae;

    const an = String(a?.name || "").toLowerCase();
    const bn = String(b?.name || "").toLowerCase();
    if (an !== bn) return an.localeCompare(bn);

    return String(a?.id || "").localeCompare(String(b?.id || ""));
  });
}

export default function SchoolsLeaderboard() {
  const query = useQuery();
  const navigate = useNavigate();

  // read initial params (district, limit)
  const qDistrict = query.get("district") || "";
  const qLimit = Number(query.get("limit") || "10");

  // Controls
  const [district, setDistrict] = useState(qDistrict);
  const [limit, setLimit] = useState(
    Number.isFinite(qLimit) && qLimit > 0 ? qLimit : 10
  );

  // Data
  const [overall, setOverall] = useState([]);
  const [byDistrict, setByDistrict] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");

  // UX
  const lastUpdatedRef = useRef(null);

  // Auto-refresh
  const [autoOn, setAutoOn] = useState(false);
  const [intervalSec, setIntervalSec] = useState(60);
  const [countdown, setCountdown] = useState(intervalSec);
  const tickTimerRef = useRef(null);
  const inFlightRef = useRef(false);

  async function fetchData(currentLimit = limit, currentDistrict = district) {
    if (inFlightRef.current) return; // avoid overlapping fetches
    inFlightRef.current = true;

    try {
      setStatus("loading");
      setError("");

      const params = new URLSearchParams();
      if (currentLimit) params.set("limit", String(currentLimit));
      if (currentDistrict && currentDistrict.trim()) {
        params.set("district", currentDistrict.trim());
      }

      // endpoint backed by your new Schools Lambda
      const url = `${API_BASE}/schools${params.toString() ? `?${params}` : ""}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}\n${text || "(no body)"}`);
      }
      const json = await res.json();

      const top = Array.isArray(json?.overallTop) ? json.overallTop : [];
      const groups = json?.byDistrict && typeof json.byDistrict === "object" ? json.byDistrict : {};

      setOverall(top);
      setByDistrict(groups);
      lastUpdatedRef.current = new Date();
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Failed to load schools leaderboard");
    } finally {
      inFlightRef.current = false;
    }
  }

  // initial load
  useEffect(() => {
    fetchData(limit, district);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep query string in sync (nice for sharing links)
  useEffect(() => {
    const params = new URLSearchParams();
    if (district && district.trim()) params.set("district", district.trim());
    if (limit) params.set("limit", String(limit));
    const next = `/leaderboard/schools${params.toString() ? `?${params}` : ""}`;
    // avoid redundant replaces
    const current = window.location.pathname + window.location.search;
    if (current !== next) navigate(next, { replace: true });
  }, [district, limit, navigate]);

  // auto-refresh ticking + countdown
  useEffect(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    setCountdown(intervalSec);
    if (!autoOn) return;

    tickTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(limit, district);
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOn, intervalSec, limit, district]);

  const sortedOverall = useMemo(() => sortSchools(overall), [overall]);

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Schools Leaderboard</h1>
          <p style={styles.sub}>Top schools by engagement.</p>
          <div style={styles.meta}>
            Last updated:{" "}
            <strong>
              {lastUpdatedRef.current
                ? lastUpdatedRef.current.toLocaleTimeString()
                : "—"}
            </strong>
            {autoOn ? (
              <span style={{ color: "#64748b", marginLeft: 8 }}>
                • auto in {countdown}s
              </span>
            ) : null}
          </div>
        </div>

        <div style={styles.controls}>
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

          <input
            type="text"
            placeholder="Filter by district (optional)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={styles.input}
            aria-label="District"
          />

          <label style={{ ...styles.label, display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={autoOn}
              onChange={(e) => setAutoOn(e.target.checked)}
              aria-label="Enable auto refresh"
            />
            Auto-refresh
          </label>

          <select
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            disabled={!autoOn}
            style={{ ...styles.select, ...(autoOn ? null : { opacity: 0.7 }) }}
            aria-label="Auto refresh interval"
          >
            <option value={30}>Every 30s</option>
            <option value={60}>Every 60s</option>
          </select>

          <button
            onClick={() => fetchData(limit, district)}
            style={{
              ...styles.button,
              ...(status === "loading" ? styles.buttonDisabled : null),
            }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      {status === "error" && (
        <div style={styles.error}>
          <strong>Failed to load.</strong>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{error}</div>
        </div>
      )}

      {/* Top overall list */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <h2 style={styles.h2}>
            {district && district.trim()
              ? `Top ${limit} • ${district.trim()}`
              : `Top ${limit} • All Districts`}
          </h2>
        </div>

        {!sortedOverall.length ? (
          <div style={styles.empty}>No entries.</div>
        ) : (
          <ol style={styles.list}>
            {sortedOverall.slice(0, limit).map((s, idx) => (
              <li key={s.id ?? idx} style={styles.row}>
                <span style={styles.rank}>{idx + 1}</span>

                <div style={styles.person}>
                  <div style={styles.name}>{s.name ?? "—"}</div>
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

      {/* Optional: by-district groupings (shown only if no district filter) */}
      {(!district || !district.trim()) && Object.keys(byDistrict || {}).length ? (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ margin: "4px 0 8px", fontSize: 16, color: "#0f172a" }}>
            By District
          </h3>
          <div style={styles.groupGrid}>
            {Object.entries(byDistrict).map(([dName, list]) => {
              const sList = sortSchools(list).slice(0, limit);
              return (
                <div key={dName} style={styles.card}>
                  <div style={styles.cardHead}>
                    <h4 style={{ margin: 0, fontSize: 15 }}>{dName}</h4>
                  </div>
                  {!sList.length ? (
                    <div style={styles.empty}>No entries.</div>
                  ) : (
                    <ol style={styles.list}>
                      {sList.map((s, idx) => (
                        <li key={s.id ?? idx} style={styles.row}>
                          <span style={styles.rank}>{idx + 1}</span>
                          <div style={styles.person}>
                            <div style={styles.name}>{s.name ?? "—"}</div>
                            <div style={styles.metaSmall}>ID: {s.id ?? "—"}</div>
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
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  h1: { margin: 0, fontSize: 26, letterSpacing: 0.2, color: "#0f172a" },
  sub: { margin: "6px 0", color: "#475569" },
  meta: { fontSize: 12, color: "#64748b" },

  controls: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  label: { fontSize: 14, color: "#0f172a" },
  select: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  input: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    minWidth: 240,
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

  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
};
