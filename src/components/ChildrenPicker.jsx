// src/components/ChildrenPicker.jsx
import React, { useEffect, useMemo, useState } from "react";

/** Resolve API base (window → Vite → CRA → fallback) */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

function emailLike(s) {
  return typeof s === "string" && /\S+@\S+\.\S+/.test(s);
}

function toEntry(x) {
  if (!x) return null;
  if (typeof x === "string") {
    const e = x.trim();
    return emailLike(e) ? { email: e } : null;
  }
  if (typeof x === "object") {
    const e = String(x.email || "").trim();
    if (!emailLike(e)) return null;
    const name = x.name != null && String(x.name).trim() ? String(x.name).trim() : undefined;
    return name ? { email: e, name } : { email: e };
  }
  return null;
}
function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const o = toEntry(item);
    if (!o) continue;
    const key = o.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...o });
  }
  return out.sort((a, b) => {
    const an = (a.name || "").toLowerCase();
    const bn = (b.name || "").toLowerCase();
    if (an !== bn) return an.localeCompare(bn);
    return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
  });
}

function getParentEmail() {
  try {
    const raw = localStorage.getItem("fp_user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.email) return u.email;
    }
  } catch {}
  try {
    // demo
    return localStorage.getItem("demoEmail") || "parent@example.com";
  } catch {
    return "parent@example.com";
  }
}

/**
 * ChildrenPicker
 * Props:
 *  - value: currently selected child email (string)
 *  - onChange: (email: string) => void
 *  - style: inline style (optional)
 */
export default function ChildrenPicker({ value, onChange, style }) {
  const parentEmail = getParentEmail();
  const [items, setItems] = useState(() => {
    try {
      const cached = localStorage.getItem("fp_parent_children");
      return normalizeList(cached ? JSON.parse(cached) : []);
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!parentEmail) return;
      setStatus("loading");
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/user?email=${encodeURIComponent(parentEmail)}`, {
          headers: { Accept: "application/json" },
        });
        const json = await res.json().catch(() => null);
        const serverChildren = normalizeList(json?.profile?.children || []);
        if (!ignore) {
          setItems(serverChildren);
          try {
            localStorage.setItem("fp_parent_children", JSON.stringify(serverChildren));
          } catch {}
          if (!value && serverChildren.length && onChange) {
            onChange(serverChildren[0].email);
          }
          setStatus("ok");
        }
      } catch (e) {
        if (!ignore) {
          setStatus("error");
          setErr(e?.message || "Failed to load children");
        }
      }
    }
    load();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentEmail]);

  const options = useMemo(() => {
    return items.map((c) => ({
      value: c.email,
      label: c.name ? `${c.name} — ${c.email}` : c.email,
    }));
  }, [items]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...(style || {}) }}>
      <label style={{ fontSize: 12, color: "#475569" }}>Student</label>
      <select
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          fontSize: 14,
          minWidth: 260,
        }}
        aria-label="Select student"
      >
        {!value && <option value="">Select a student…</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {status === "error" ? (
        <div style={{ fontSize: 12, color: "#b91c1c" }}>{err}</div>
      ) : null}
    </div>
  );
}
