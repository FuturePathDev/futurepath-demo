// src/components/DemoSwitcher.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const DEMO_USERS = [
  { label: "Parent (parent@example.com)", role: "parent", email: "parent@example.com", route: "/parent" },
  { label: "Student (student@example.com)", role: "student", email: "student@example.com", route: "/student" },
  
];

export default function DemoSwitcher() {
  const navigate = useNavigate();

  function switchTo(u) {
    try {
      // app-wide “who am I?” for demo flows
      localStorage.setItem("demoEmail", u.email);
      localStorage.setItem("demoRole", u.role);
      // helpful for parent pages that remember a child
      if (u.role === "parent") {
        localStorage.setItem("fp_parent_child_email", "student@example.com");
      }
    } catch {}

    navigate(u.route);
  }

  return (
    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
      {DEMO_USERS.map(u => (
        <button
          key={u.email}
          onClick={() => switchTo(u)}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {u.label}
        </button>
      ))}
    </div>
  );
}
