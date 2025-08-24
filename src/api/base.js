// src/api/base.js
export function apiBase() {
  return (
    (typeof window !== "undefined" &&
      (window.__API_BASE_URL__ || window.API_BASE)) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) ||
    (typeof process !== "undefined" &&
      process.env &&
      (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE)) ||
    "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo"
  );
}

export async function apiFetch(path, opts = {}) {
  const base = apiBase();
  if (!base) throw new Error("API base URL missing");

  // Dev-only header to simulate an authenticated user (so bookmarks work without Cognito yet)
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    "x-demo-user": "demo-sub",
  };

  const res = await fetch(`${base}${path}`, { ...opts, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.message) msg += ` – ${j.message}`;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}
