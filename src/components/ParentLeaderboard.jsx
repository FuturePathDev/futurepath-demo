// src/components/ParentLeaderboard.jsx
import React, { useMemo } from "react";

/**
 * ParentLeaderboard (presentational)
 *
 * Props:
 * - items?: Array<{ id:string, name?:string, points?:number, district?:string, schoolId?:string }>
 * - title?: string                         (default: "Parents Leaderboard")
 * - subtitle?: string                      (optional small caption)
 * - limit?: number                         (slice top N)
 * - loading?: boolean                      (show loading state)
 * - error?: string                         (show error state)
 * - onRetry?: () => void                   (retry handler for error state)
 * - lastUpdated?: Date|string|null         (renders "Last updated" if provided)
 * - showDistrict?: boolean                 (default: true)
 * - showSchool?: boolean                   (default: true)
 * - onRowClick?: (row) => void             (optional row click)
 * - className?: string                     (optional outer class)
 *
 * This component does NO data fetching. Feed it data from your page container.
 */

export default function ParentLeaderboard({
  items = [],
  title = "Parents Leaderboard",
  subtitle = "Recognition for engagement and support.",
  limit,
  loading = false,
  error = "",
  onRetry,
  lastUpdated = null,
  showDistrict = true,
  showSchool = true,
  onRowClick,
  className = "",
}) {
  const normalized = Array.isArray(items) ? items : [];

  const sorted = useMemo(() => {
    const copy = [...normalized];
    copy.sort((a, b) => {
      const bp = Number(b?.points ?? 0);
      const ap = Number(a?.points ?? 0);
      if (bp !== ap) return bp - ap;
      const bn = String(b?.name ?? "").toLowerCase();
      const an = String(a?.name ?? "").toLowerCase();
      if (bn !== an) return an.localeCompare(bn); // name ASC
      return String(a?.id ?? "").localeCompare(String(b?.id ?? "")); // id ASC
    });
    return typeof limit === "number" && limit > 0 ? copy.slice(0, limit) : copy;
  }, [normalized, limit]);

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return null;
    try {
      const d = typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
      if (Number.isNaN(d?.getTime())) return null;
      return d.toLocaleTimeString();
    } catch {
      return null;
    }
  }, [lastUpdated]);

  function handleExportCSV() {
    try {
      const rows = [["rank", "id", "name", "points", "district", "schoolId"]];
      sorted.forEach((row, i) => {
        rows.push([
          String(i + 1),
          safe(row.id),
          safe(row.name),
          String(row.points ?? ""),
          safe(row.district),
          safe(row.schoolId),
        ]);
      });
      const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parents_leaderboard.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // no-op; export is best-effort
      console.error("Export CSV failed:", e);
    }
  }

  // -------- Render states --------
  if (loading) {
    return (
      <div className={className} style={styles.wrap}>
        <Header
          title={title}
          subtitle={subtitle}
          lastUpdatedText={lastUpdatedText}
          onExportCSV={null}
          disabled
        />
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.h2}>Top Parents</h2>
          </div>
          <div style={{ padding: 16, color: "#475569" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={styles.wrap}>
        <Header
          title={title}
          subtitle={subtitle}
          lastUpdatedText={lastUpdatedText}
          onExportCSV={null}
          disabled
        />
        <div style={{ ...styles.alert, borderColor: "#ef4444", background: "#fef2f2", color: "#991b1b" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Failed to load</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{String(error)}</div>
          {typeof onRetry === "function" ? (
            <button style={{ ...styles.button, marginTop: 10 }} onClick={onRetry}>
              Try again
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={styles.wrap}>
      <Header
        title={title}
        subtitle={subtitle}
        lastUpdatedText={lastUpdatedText}
        onExportCSV={sorted.length ? handleExportCSV : null}
      />

      <div style={styles.card}>
        <div style={styles.cardHead}>
          <h2 style={styles.h2}>Top Parents</h2>
        </div>

        {!sorted.length ? (
          <div style={{ padding: 16, color: "#64748b" }}>No entries.</div>
        ) : (
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {sorted.map((row, idx) => (
              <li
                key={row.id ?? idx}
                style={{
                  ...styles.row,
                  cursor: onRowClick ? "pointer" : "default",
                }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                <span style={styles.rank}>{idx + 1}</span>

                <div style={{ ...styles.cell, flex: 1 }}>
                  <div style={styles.name}>{row.name ?? "—"}</div>
                  <div style={styles.meta}>ID: {row.id ?? "—"}</div>
                </div>

                {showDistrict ? (
                  <div style={{ ...styles.cell, minWidth: 140 }}>
                    <div style={styles.metaLabel}>District</div>
                    <div style={styles.metaValue}>{row.district ?? "—"}</div>
                  </div>
                ) : null}

                {showSchool ? (
                  <div style={{ ...styles.cell, minWidth: 120 }}>
                    <div style={styles.metaLabel}>School</div>
                    <div style={styles.metaValue}>{row.schoolId ?? "—"}</div>
                  </div>
                ) : null}

                <div style={{ ...styles.pointsCell }}>
                  <span style={styles.pointsValue}>{row.points ?? 0}</span>
                  <span style={styles.pointsUnit}>pts</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ---------- small header subcomponent ---------- */
function Header({ title, subtitle, lastUpdatedText, onExportCSV, disabled }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.h1}>{title}</h1>
        {subtitle ? <div style={styles.sub}>{subtitle}</div> : null}
        {lastUpdatedText ? (
          <div style={styles.lastUpdated}>Last updated: {lastUpdatedText}</div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {onExportCSV ? (
          <button
            type="button"
            style={styles.button}
            onClick={onExportCSV}
            disabled={disabled}
            aria-label="Export to CSV"
          >
            Export CSV
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function safe(v) {
  return v == null ? "" : String(v);
}
function csvEscape(s) {
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/* ---------- styles ---------- */
const styles = {
  wrap: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "16px",
    color: "#0f172a",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,system-ui',
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 22, letterSpacing: 0.2 },
  sub: { color: "#475569", marginTop: 4 },
  lastUpdated: { color: "#64748b", fontSize: 12, marginTop: 4 },
  button: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  alert: {
    border: "1px solid",
    borderRadius: 12,
    padding: 12,
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  cardHead: {
    padding: "10px 14px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  h2: { margin: 0, fontSize: 16 },
  row: {
    display: "grid",
    gridTemplateColumns: "40px 1fr 160px 140px 120px",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderTop: "1px solid #f1f5f9",
  },
  rank: {
    fontWeight: 800,
    textAlign: "right",
    color: "#334155",
    fontVariantNumeric: "tabular-nums",
  },
  cell: { minWidth: 0 },
  name: {
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  meta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  metaLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: 600 },
  pointsCell: {
    justifySelf: "end",
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  },
  pointsValue: { fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  pointsUnit: { color: "#64748b", fontSize: 12 },
};
