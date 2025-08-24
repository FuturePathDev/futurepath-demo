// src/utils/demoIdentity.js
export function getDemoEmail() {
  // 1) Query string override ?demoEmail=… or ?email=…
  try {
    const u = new URL(window.location.href);
    const q = u.searchParams.get('demoEmail') || u.searchParams.get('email');
    if (q) {
      try { localStorage.setItem('demoEmail', q); } catch {}
      return q;
    }
  } catch {}

  // 2) localStorage (may be blocked in iframes/incognito)
  try {
    const v = localStorage.getItem('demoEmail');
    if (v) return v;
  } catch {}

  // 3) fallback
  return 'student@example.com';
}
