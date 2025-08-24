import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = (() => {
  const g = typeof globalThis !== "undefined" ? globalThis : {};
  const w = typeof window !== "undefined" ? window : {};
  const fromWindow = w.API_BASE || null;
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

function readProfile() {
  try {
    const raw = localStorage.getItem("fp_user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Get district from query (?district=) or from profile as a default */
function getInitialDistrict() {
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("district");
    if (q) return q;
  } catch {}
  const p = readProfile();
  return p?.district || "";
}

export default function SchoolLeaderboard() {
  // Filters & state
  const [district, setDistrict] = useState(getInitialDistrict());
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");
  const lastUpdatedRef = useRef(null);
  const myProfile = useMemo(readProfile, []);

  // Auto-refresh
  const [autoOn, setAutoOn] = useState(false);
  const [intervalSec, setIntervalSec] = useState(60);
  const [countdown, setCountdown] = useState(intervalSec);
  const tickTimerRef = useRef(null);
  const inFlightRef = useRef(false);

  async function load(currentLimit = limit, currentDistrict = district) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setStatus("loading");
      setError("");

      const params = new URLSearchParams();
      if (currentLimit) params.set("limit", String(currentLimit));
      if (currentDistrict && currentDistrict.trim()) {
        params.set("district", currentDistrict.trim());
      }

      const url = `${API_BASE}/schools${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}\n${text || "(no body)"}`);
      }
      const json = await res.json();

      const list = Array.isArray(json?.overallTop) ? json.overallTop : [];
      // Normalize shape: id, name, district, engagement
      const norm = list
        .map((x) => ({
          id: x.id,
          name: x.name || x.id,
          district: x.district || "",
          engagement: Number(x.engagement || 0),
        }))
        .filter((x) => x.id);
      setItems(norm);
      lastUpdatedRef.current = new Date();
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Failed to load schools leaderboard");
    } finally {
      inFlightRef.current = false;
    }
  }

  useEffect(() => {
    load(limit, district);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto refresh
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
          load(limit, district);
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

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (b.engagement !== a.engagement) return b.engagement - a.engagement;
        return (a.name || "").localeCompare(b.name || "");
      }),
    [items]
  );

  const mySchoolId = myProfile?.schoolId || "";
  const myDistrict = myProfile?.district || "";

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

          <label
            style={{ ...styles.label, display: "flex", gap: 6, alignItems: "center" }}
          >
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
            onClick={() => load(limit, district)}
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

      <div style={styles.card}>
        <div style={styles.cardHead}>
          <h2 style={styles.h2}>
            {district && district.trim()
              ? `Top ${limit} • ${district.trim()}`
              : `Top ${limit} • All Districts`}
          </h2>
        </div>

        {!sorted.length ? (
          <div style={styles.empty}>No entries.</div>
        ) : (
          <ol style={styles.list}>
            {sorted.map((s, idx) => {
              const isMine = mySchoolId && s.id === mySchoolId;
              return (
                <li
                  key={s.id}
                  style={{
                    ...styles.row,
                    ...(isMine ? styles.rowHighlight : null),
                  }}
                >
                  <span style={styles.rank}>{idx + 1}</span>

                  <div style={styles.schoolInfo}>
                    <div style={styles.schoolTitle}>
                      <span style={styles.icon} role="img" aria-label="school">
                        🏫
                      </span>
                      <span style={{ fontWeight: 700 }}>{s.name}</span>
                      {isMine ? (
                        <span style={styles.badgeMine}>My School</span>
                      ) : null}
                    </div>
                    <div style={styles.metaSmall}>
                      ID: {s.id}{" "}
                      {s.district ? (
                        <span style={styles.badgeDistrict}>{s.district}</span>
                      ) : null}
                    </div>
                  </div>

                  <div style={styles.points}>
                    <span style={styles.pointsValue}>{s.engagement}</span>
                    <span style={styles.pointsLabel}>engagement</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Quick actions row */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {myDistrict ? (
          <a
            href={`/leaderboard/schools?district=${encodeURIComponent(
              myDistrict
            )}`}
            style={styles.linkBtn}
          >
            View {myDistrict} only
          </a>
        ) : null}
        <a href="/profile" style={styles.linkBtn}>
          Update my profile
        </a>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1000, margin: "0 auto", padding: "24px 16px 48px" },
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
  rowHighlight: {
    background: "#f0f9ff",
  },
  rank: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    color: "#334155",
    textAlign: "right",
  },
  schoolInfo: { minWidth: 0 },
  schoolTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  icon: { fontSize: 18 },
  metaSmall: { fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" },
  points: { display: "flex", alignItems: "baseline", gap: 6 },
  pointsValue: { fontVariantNumeric: "tabular-nums", fontWeight: 700 },
  pointsLabel: { fontSize: 12, color: "#64748b" },

  badgeMine: {
    marginLeft: 6,
    background: "#063970",
    color: "white",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },
  badgeDistrict: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },

  empty: { padding: 16, color: "#64748b", fontSize: 14 },

  linkBtn: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
};

