// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <li key={to} style={{ listStyle: "none", marginBottom: 8 }}>
      <Link
        to={to}
        style={{
          display: "block",
          padding: "10px 12px",
          borderRadius: 8,
          textDecoration: "none",
          color: pathname === to ? "#111827" : "#374151",
          background: pathname === to ? "#e5e7eb" : "transparent",
          border: "1px solid #e5e7eb"
        }}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <aside style={{ width: 240, padding: 16, borderRight: "1px solid #e5e7eb", background: "#fff" }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Menu</h3>
      <ul style={{ padding: 0, margin: 0 }}>
        {link("/student", "Student Dashboard")}
        {link("/parent", "Parent Dashboard")}
        {link("/admin", "Admin Dashboard")}
        {link("/tutors", "Tutors")}
      </ul>
    </aside>
  );
}
