// src/pages/CareerResults.jsx
import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function CareerResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = useMemo(() => {
    // Prefer router state, then localStorage, else null
    if (location?.state?.code) return location.state;
    try {
      const raw = localStorage.getItem("fp_lastCareerResult");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location?.state]);

  useEffect(() => {
    document.title = "Career Results • FuturePath";
  }, []);

  if (!data) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Career Results</h1>
          <p style={styles.sub}>We couldn’t find a recent assessment result.</p>
          <div style={{ marginTop: 12 }}>
            <Link to="/career" style={styles.btn}>
              Take the Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { code, category, scores, recommendation, email } = data;

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Your Best-Fit: {recommendation.title}</h1>
          <div style={styles.sub}>
            Holland Code: <strong>{code}</strong> (top category:{" "}
            <strong>
              {category === "R" && "Realistic"}
              {category === "I" && "Investigative"}
              {category === "A" && "Artistic"}
              {category === "S" && "Social"}
              {category === "E" && "Enterprising"}
              {category === "C" && "Conventional"}
            </strong>
            )
          </div>
          <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
            Saved to profile for: <code>{email || "student@example.com"}</code>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/career" style={styles.secondary}>
            Retake Assessment
          </Link>
          <Link to="/" style={styles.primary}>
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Scores bar */}
      <section style={styles.scores}>
        {Object.entries(scores).map(([k, v]) => (
          <div key={k} style={styles.scoreItem}>
            <div style={styles.scoreLabel}>
              <span style={styles.badgeSmall}>{k}</span>
              <span style={{ fontWeight: 700, marginLeft: 6 }}>
                {k === "R" && "Realistic"}
                {k === "I" && "Investigative"}
                {k === "A" && "Artistic"}
                {k === "S" && "Social"}
                {k === "E" && "Enterprising"}
                {k === "C" && "Conventional"}
              </span>
            </div>
            <div style={styles.barWrap}>
              <div style={{ ...styles.bar, width: `${Math.min(100, v * 12.5)}%` }} />
            </div>
            <div style={styles.scoreValue}>{v}</div>
          </div>
        ))}
      </section>

      {/* Recommendations */}
      <section style={styles.grid}>
        <div style={styles.panel}>
          <h2 style={styles.h2}>Careers</h2>
          <ul style={styles.ul}>
            {recommendation.careers.map((c) => (
              <li key={c} style={styles.li}>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.h2}>Suggested Majors</h2>
          <ul style={styles.ul}>
            {recommendation.majors.map((m) => (
              <li key={m} style={styles.li}>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.h2}>Programs & Schools (Examples)</h2>
          <ul style={styles.ul}>
            {recommendation.programs.map((p) => (
              <li key={p} style={styles.li}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(-1)} style={styles.secondary}>
          Back
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
  },
  h1: { margin: 0, fontSize: 24, color: "#0f172a", letterSpacing: 0.2 },
  sub: { marginTop: 6, color: "#475569" },
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  primary: {
    textDecoration: "none",
    background: "#0f172a",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
  secondary: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
  scores: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 10,
    marginBottom: 16,
  },
  scoreItem: {
    display: "grid",
    gridTemplateColumns: "220px 1fr 40px",
    gap: 8,
    alignItems: "center",
  },
  scoreLabel: { display: "flex", alignItems: "center" },
  badgeSmall: {
    display: "inline-grid",
    placeItems: "center",
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "#0ea5e9",
    color: "white",
    fontWeight: 800,
    fontSize: 12,
  },
  barWrap: {
    height: 10,
    background: "#f1f5f9",
    borderRadius: 999,
    overflow: "hidden",
  },
  bar: { height: "100%", background: "#0ea5e9" },
  scoreValue: { textAlign: "right", fontVariantNumeric: "tabular-nums" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 12,
  },
  panel: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
  },
  h2: { margin: 0, fontSize: 16, color: "#0f172a" },
  ul: { margin: "8px 0 0", paddingLeft: 16, color: "#0f172a" },
  li: { margin: "4px 0" },
  btn: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
};
