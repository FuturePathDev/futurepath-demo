import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Lightweight search bar that navigates to /resources?query=...
 * Works in both Tailwind and non-Tailwind pages (uses inline styles).
 */
export default function DashboardSearchBar({
  placeholder = "Search resources (e.g., FAFSA, scholarships, SAT)…",
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/resources?query=${encodeURIComponent(query)}` : "/resources");
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Search resources"
      style={{ display: "flex", gap: 8, width: "100%" }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 220,
          padding: "10px 12px",
          borderRadius: 999,
          border: "1px solid #cbd5e1",
          fontSize: 14,
          background: "#fff",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #0ea5e9",
          background: "#fff",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Search
      </button>
    </form>
  );
}
