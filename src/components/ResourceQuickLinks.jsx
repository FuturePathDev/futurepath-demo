// src/components/ResourceQuickLinks.jsx
import React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { id: "faFsa-walkthrough-2025", label: "FAFSA Walkthrough" },
  { id: "fafsa-quick-checklist-2025", label: "FAFSA Checklist" },
  { id: "fafsa-video-walkthrough-2025", label: "FAFSA Video" },
  { id: "scholarship-search-starter", label: "Scholarship Search" },
  { id: "scholarship-essay-template", label: "Scholarship Essay Template" },
  { id: "sat-prep-quickstart", label: "SAT Prep Quickstart" },
  { id: "act-prep-8-week-plan", label: "ACT: 8-Week Plan" },
  { id: "cc-transfer-guide", label: "CC → University Guide" },
  { id: "apprenticeships-101", label: "Apprenticeships 101" },
];

export default function ResourceQuickLinks({ title = "Featured Resources" }) {
  return (
    <section style={styles.wrap}>
      <div style={styles.header}>
        <h3 style={styles.h3}>{title}</h3>
        <Link to="/resources" style={styles.viewAll}>Browse all</Link>
      </div>
      <div style={styles.grid}>
        {LINKS.map((r) => (
          <Link key={r.id} to={`/resources/${encodeURIComponent(r.id)}`} style={styles.chip}>
            {r.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const styles = {
  wrap: { background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 12, marginTop: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  h3: { margin: 0, fontSize: 16, color: "#0f172a" },
  viewAll: { fontSize: 13, color: "#0ea5e9", textDecoration: "none", fontWeight: 600 },
  grid: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "6px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 999,
    textDecoration: "none",
    color: "#0f172a",
    fontSize: 13,
    background: "white",
  },
};
