import React from "react";

/** Simple inline SVG icons to match the mock’s vibe */
const icons = {
  hospital: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" opacity="0.15"/>
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  doctor: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20c1.5-3.5 4.5-5.5 8-5.5S18.5 16.5 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  lab: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9 3v6L4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l-5-11V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  pharmacy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  insurance: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2.2 2.2L15 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

export default function FocusCareerCard({
  tone = "#10b981",
  title = "Hospital",
  icon = "hospital",
  onSelect,
  footer = "See jobs",
}) {
  return (
    <button onClick={onSelect} style={{ ...styles.card, borderColor: tone }}>
      <div style={{ ...styles.iconWrap, color: tone, background: tone + "22" }}>
        {icons[icon] ?? icons.hospital}
      </div>
      <div style={styles.title}>{title}</div>
      <div style={{ ...styles.footer, color: tone }}>{footer} →</div>
    </button>
  );
}

const styles = {
  card: {
    textAlign: "left",
    background: "white",
    border: "2px solid",
    borderRadius: 18,
    padding: 14,
    display: "grid",
    gap: 8,
    boxShadow: "0 8px 16px rgba(16,24,40,0.06)",
    cursor: "pointer",
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 12,
    display: "grid", placeItems: "center",
  },
  title: { fontWeight: 700, color: "#0f172a" },
  footer: { fontSize: 12, fontWeight: 600 },
};
