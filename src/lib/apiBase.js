// src/lib/apiBase.js

// Priority:
// 1) window.API_BASE
// 2) Vite: import.meta.env.VITE_API_BASE
// 3) CRA:  process.env.REACT_APP_API_BASE
// 4) Fallback: demo URL
export const API_BASE = (() => {
  const w = (typeof window !== 'undefined') ? window : undefined;
  const p = (typeof process !== 'undefined') ? process : undefined;

  const fromWindow = (w && w.API_BASE) ? w.API_BASE : null;

  const fromVite = (typeof import.meta !== 'undefined'
    && import.meta.env
    && import.meta.env.VITE_API_BASE)
      ? import.meta.env.VITE_API_BASE
      : null;

  const fromCRA = (p && p.env && p.env.REACT_APP_API_BASE)
      ? p.env.REACT_APP_API_BASE
      : null;

  return (
    fromWindow ||
    fromVite ||
    fromCRA ||
    'https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo'
  );
})();

export function apiPath(path) {
  const base = API_BASE.replace(/\/+$/, '');
  const tail = String(path || '').replace(/^\/+/, '');
  return `${base}/${tail}`;
}
