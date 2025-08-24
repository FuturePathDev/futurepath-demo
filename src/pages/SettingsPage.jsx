// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";

/** Resolve API base (window → Vite → CRA → fallback) */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

const LS_NOTIFY_KEY = "fp_notify_enabled";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, status, refresh, signOut: ctxSignOut } = useProfile?.() ?? {};
  const email = profile?.email ?? ""; // used only for API identity (not rendered)

  const [form, setForm] = useState({
    name: profile?.name || "",
    grade: profile?.grade || profile?.profile?.grade || "",
    school: profile?.school || profile?.profile?.school || "",
    district: profile?.district || profile?.profile?.district || "",
    careerInterest: joinList(
      profile?.careerInterest || profile?.profile?.careerInterest || []
    ),
  });

  // Notifications toggle (default from localStorage)
  const [notifyOn, setNotifyOn] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_NOTIFY_KEY);
      return raw ? raw === "true" : true; // default ON for demo
    } catch {
      return true;
    }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Pull latest profile/settings from API (without showing email anywhere)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!email) return;
      setLoading(true);
      setMsg("");
      try {
        const res = await fetch(
          `${API_BASE}/user?email=${encodeURIComponent(email)}`,
          { headers: { Accept: "application/json" } }
        );
        const json = await res.json().catch(() => null);
        if (!ignore && json?.profile) {
          setForm({
            name: json.profile.name || profile?.name || "",
            grade: json.profile.grade || "",
            school: json.profile.school || "",
            district: json.profile.district || "",
            careerInterest: joinList(json.profile.careerInterest || []),
          });
          const apiNotify =
            json.profile?.settings?.notifications?.enabled ??
            json.settings?.notifications?.enabled;
          if (typeof apiNotify === "boolean") {
            setNotifyOn(apiNotify);
            try { localStorage.setItem(LS_NOTIFY_KEY, String(apiNotify)); } catch {}
          }
        }
      } catch (e) {
        if (!ignore) setMsg(e?.message || "Failed to load profile.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    // Persist toggle locally right away
    try { localStorage.setItem(LS_NOTIFY_KEY, String(notifyOn)); } catch {}

    // Save to API if we have an email (identity). Email is NOT displayed.
    if (!email) {
      setSaving(false);
      setMsg("Saved locally.");
      return;
    }

    const payload = {
      email,
      name: form.name || undefined,
      profile: {
        grade: form.grade || undefined,
        school: form.school || undefined,
        district: form.district || undefined,
        careerInterest: splitList(form.careerInterest),
        // keep settings under profile.settings for simplicity
        settings: { notifications: { enabled: !!notifyOn } },
      },
    };

    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMsg("Saved!");
      try { await refresh?.(); } catch {}
    } catch (e) {
      setMsg(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  function doSignOut() {
    try {
      // Clear common demo/local keys
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("fp_") || k === "demoEmail") {
          localStorage.removeItem(k);
        }
      }
    } catch {}
    try { ctxSignOut?.(); } catch {}
    navigate("/");
  }

  function clearLocalDemoData() {
    let cleared = 0;
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith("fp_") || k === "demoEmail") {
          localStorage.removeItem(k);
          cleared++;
        }
      }
      setMsg(`Cleared ${cleared} local demo keys.`);
    } catch {
      setMsg("Could not clear local storage.");
    }
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Settings</h1>

      <section style={styles.card}>
        <div style={styles.cardHead}>
          <div>
            <div style={styles.kicker}>Profile</div>
            <div style={styles.sub}>Update your basic information</div>
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {status !== "idle" || loading ? "Syncing…" : ""}
          </div>
        </div>

        <form onSubmit={onSave} style={styles.formGrid}>
          {/* No email field rendered */}
          <Field label="Name">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Your name"
              style={styles.input}
            />
          </Field>
          <Field label="Grade">
            <input
              name="grade"
              value={form.grade}
              onChange={onChange}
              placeholder="11"
              style={styles.input}
            />
          </Field>
          <Field label="School">
            <input
              name="school"
              value={form.school}
              onChange={onChange}
              placeholder="Riverside High"
              style={styles.input}
            />
          </Field>
          <Field label="District">
            <input
              name="district"
              value={form.district}
              onChange={onChange}
              placeholder="Riverside USD"
              style={styles.input}
            />
          </Field>
          <Field label="Career Interests (comma-separated)">
            <input
              name="careerInterest"
              value={form.careerInterest}
              onChange={onChange}
              placeholder="Electrician, Product Manager"
              style={styles.input}
            />
          </Field>

          {/* Notifications */}
          <div style={{ ...styles.row, gridColumn: "1 / -1" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={notifyOn}
                onChange={(e) => setNotifyOn(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Enable in-app notifications</span>
            </label>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              (Used for nudges and reminders inside the app—no emails sent.)
            </span>
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              style={styles.primaryBtn}
              title="Save profile"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {msg ? <span style={styles.msg}>{msg}</span> : null}
          </div>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.cardHead}>
          <div>
            <div style={styles.kicker}>Account</div>
            <div style={styles.sub}>Sign out or clear local demo data</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={doSignOut} style={styles.secondaryBtn}>
            Sign out
          </button>
          <button
            type="button"
            onClick={clearLocalDemoData}
            style={styles.dangerBtn}
            title="Remove local demo caches (tasks, selections, etc.)"
          >
            Clear local demo data
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------------- helpers ---------------- */
function joinList(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}
function splitList(s) {
  if (!s) return [];
  return String(s)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ---------------- small UI bits ---------------- */
function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px", display: "grid", gap: 16 },
  h1: { margin: 0, fontSize: 24, color: "#0f172a" },

  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    display: "grid",
    gap: 12,
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  kicker: { fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  sub: { fontSize: 13, color: "#475569" },

  formGrid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  row: { display: "flex", gap: 10, alignItems: "center" },

  label: { fontSize: 12, color: "#64748b" },
  input: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    background: "white",
  },
  actions: { gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center" },

  primaryBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #0ea5e9",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  dangerBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  msg: { fontSize: 13, color: "#065f46" },
};

