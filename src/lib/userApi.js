// src/lib/userApi.js
import { API_BASE, apiPath } from './apiBase';

/** Save/merge a profile into the backend and cache */
export async function saveProfile(partial) {
  const payload = { ...(partial || {}) };

  const res = await fetch(apiPath('/user'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  const profile = json?.profile || payload;

  // cache locally for the demo
  try {
    const prev = JSON.parse(localStorage.getItem('fp_user') || '{}');
    const next = { ...prev, ...profile };
    localStorage.setItem('fp_user', JSON.stringify(next));
  } catch {
    // ignore
  }

  if (!res.ok) {
    const text = json?.message || res.statusText || 'Request failed';
    throw new Error(`POST /user ${res.status} – ${text}`);
  }

  return profile;
}

/** Fetch by email and cache */
export async function fetchProfileByEmail(email) {
  const url = apiPath(`/user?email=${encodeURIComponent(email)}`);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  const json = await res.json().catch(() => ({}));
  const profile = json?.profile || null;

  if (profile) {
    try {
      localStorage.setItem('fp_user', JSON.stringify(profile));
    } catch {}
  }

  if (!res.ok) {
    const text = json?.message || res.statusText || 'Request failed';
    throw new Error(`GET /user ${res.status} – ${text}`);
  }

  return profile;
}

/** Merge partial object into the cached profile (no network) */
export function mergeLocalProfile(partial) {
  try {
    const prev = JSON.parse(localStorage.getItem('fp_user') || '{}');
    const next = { ...prev, ...(partial || {}) };
    localStorage.setItem('fp_user', JSON.stringify(next));
    return next;
  } catch {
    return partial || {};
  }
}

export { API_BASE, apiPath };
