import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

// Simple brand block (replace image src with your real logo)
const Brand = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 14px" }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: "linear-gradient(135deg,#06b6d4,#3b82f6)",
      }}
    />
    <div>
      <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>FuturePath</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>Student Success</div>
    </div>
  </div>
);

function pill(isActive) {
  return {
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: isActive ? "#0b4aa2" : "#0f172a",
    background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
    fontWeight: isActive ? 700 : 500,
  };
}

function nameFromUser(user) {
  const a = user?.attributes || {};
  return a.name || a.given_name || user?.username || (a.email ? a.email.split("@")[0] : "User");
}

// Demo profile fallbacks by email → district/grade
function profileFromUser(user) {
  const email = user?.attributes?.email || "";
  const map = {
    "student@example.com": { displayName: "Jessie Lopez", district: "Palo Verde USD", grade: "11" },
    "parent@example.com": { displayName: "Eliza Lopez", district: "Palo Verde USD", grade: "Parent" },
    "admin@example.com": { displayName: "PV Admin", district: "Palo Verde USD", grade: "Admin" },
  };
  const fallback = { displayName: nameFromUser(user), district: "Demo District", grade: "—" };
  return map[email] || fallback;
}

export default function SidebarLayout({ user, onSignOut, children }) {
  const prof = useMemo(() => profileFromUser(user), [user]);

  return (
    <div style={wrap}>
      <aside style={sidebar}>
        <Brand />
        <div style={{ padding: "0 12px" }}>
          <div style={userCard}>
            <div style={{ fontWeight: 700 }}>{prof.displayName}</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{prof.district}</div>
            <div style={{ fontSize: 12, color: "#475569" }}>Grade: {prof.grade}</div>
          </div>

          <div style={groupLabel}>Dashboards</div>
          <nav style={nav}>
            <NavLink to="/student" style={({ isActive }) => pill(isActive)}>Student</NavLink>
            <NavLink to="/parent" style={({ isActive }) => pill(isActive)}>Parent</NavLink>
            <NavLink to="/admin" style={({ isActive }) => pill(isActive)}>Admin</NavLink>
          </nav>

          <div style={groupLabel}>Data</div>
          <nav style={nav}>
            <NavLink to="/leaderboard" style={({ isActive }) => pill(isActive)}>
              Student Leaderboard
            </NavLink>
            <NavLink to="/leaderboard/parents" style={({ isActive }) => pill(isActive)}>
              Parent Leaderboard
            </NavLink>
            <NavLink to="/leaderboard/schools" style={({ isActive }) => pill(isActive)}>
              School Leaderboard
            </NavLink>
            <NavLink to="/announcements" style={({ isActive }) => pill(isActive)}>
              Announcements
            </NavLink>
          </nav>

          <button onClick={onSignOut} style={signOutBtn}>Sign out</button>
        </div>
      </aside>

      <main style={mainArea}>
        <div style={pageWrap}>{children}</div>
      </main>
    </div>
  );
}

const wrap = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#c7f9ff,#dbeafe)",
};

const sidebar = {
  borderRight: "1px solid #e2e8f0",
  background: "white",
};

const nav = { display: "grid", gap: 6, marginBottom: 16 };

const groupLabel = {
  margin: "14px 12px 8px",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: "#6b7280",
};

const userCard = {
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#f8fafc",
  marginBottom: 8,
};

const signOutBtn = {
  marginTop: 10,
  display: "inline-block",
  width: "100%",
  textAlign: "center",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  color: "#ef4444",
  background: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const mainArea = { minWidth: 0 };
const pageWrap = { padding: "24px 24px 48px" };
