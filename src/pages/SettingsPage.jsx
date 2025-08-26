// src/pages/SettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";
import { saveProfile, mergeLocalProfile } from "../lib/userApi";
import { Avatar } from "../components/Avatar.jsx";

/** Safe window reference */
const win = typeof window !== "undefined" ? window : null;

/** Small UI primitives */
function Section({ title, subtitle, children, right }) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-600">{subtitle}</div> : null}
        </div>
        {right || null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
function Labeled({ label, hint, children }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4"
      />
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
    </div>
  );
}
function Select({ value, onChange, children }) {
  return (
    <select
      className="rounded-md border px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}
function Button({ children, onClick, kind = "primary" }) {
  const base = "rounded-md px-3 py-2 text-sm font-medium";
  const styles =
    kind === "primary"
      ? "bg-black text-white"
      : kind === "danger"
      ? "border border-red-300 text-red-700 hover:bg-red-50"
      : "border hover:bg-gray-50";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

/** Helpers for local settings */
function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export default function SettingsPage() {
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();

  // ------- Profile form -------
  const [name, setName] = useState(profile?.name || "");
  const [grade, setGrade] = useState(profile?.grade || "");
  const [district, setDistrict] = useState(profile?.district || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  useEffect(() => {
    setName(profile?.name || "");
    setGrade(profile?.grade || "");
    setDistrict(profile?.district || "");
    setPhone(profile?.phone || "");
  }, [profile?.name, profile?.grade, profile?.district, profile?.phone]);

  async function saveProfileForm() {
    const next = mergeLocalProfile(profile, {
      name: name.trim() || undefined,
      grade: grade || undefined,
      district: district.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setProfile(next);
    try {
      await saveProfile({
        email: next?.email,
        name: next?.name,
        grade: next?.grade,
        district: next?.district,
        phone: next?.phone,
      });
    } catch {
      /* demo: ignore errors */
    }
  }

  // ------- Preferences (local only) -------
  const [notifEnabled, setNotifEnabled] = useState(() =>
    getLocal("fp_notifications_enabled", true)
  );
  const [theme, setTheme] = useState(() => getLocal("fp_theme", "auto")); // auto | light | dark
  const [density, setDensity] = useState(() => getLocal("fp_density", "comfortable")); // compact | comfortable

  useEffect(() => setLocal("fp_notifications_enabled", !!notifEnabled), [notifEnabled]);
  useEffect(() => {
    setLocal("fp_theme", theme);
    if (!win || !win.document) return;
    const root = win.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      // auto
      const prefers = win.matchMedia && win.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefers) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => setLocal("fp_density", density), [density]);

  // ------- Security / privacy (demo) -------
  const lastLogin = useMemo(() => {
    try {
      return localStorage.getItem("fp_last_login") || "";
    } catch {
      return "";
    }
  }, []);
  function exportData() {
    const data = {
      profile,
      settings: {
        notifEnabled,
        theme,
        density,
      },
      localStorageSnapshot: (() => {
        const out = {};
        try {
          Object.keys(localStorage).forEach((k) => {
            out[k] = localStorage.getItem(k);
          });
        } catch {}
        return out;
      })(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = win?.document?.createElement("a");
    if (a) {
      a.href = url;
      a.download = "futurepath-demo-export.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  function resetLocal() {
    try {
      const keep = localStorage.getItem("demoEmail");
      localStorage.clear();
      if (keep) localStorage.setItem("demoEmail", keep);
    } catch {}
    win?.location?.reload?.();
  }
  function signOut() {
    try {
      localStorage.removeItem("demoEmail");
    } catch {}
    navigate("/");
  }

  // ------- Demo helpers -------
  function setDemo(email) {
    try {
      localStorage.setItem("demoEmail", email);
    } catch {}
    win?.location?.reload?.();
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="text-sm text-slate-600">
            Manage your profile, preferences, and demo options.
          </div>
        </div>
        <Link
          to="/avatar-builder"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
          title="Open Avatar Builder"
        >
          Open Avatar Builder
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="grid gap-4">
          {/* Profile */}
          <Section
            title="Profile"
            subtitle="These details appear on your dashboards"
            right={<Button onClick={saveProfileForm}>Save changes</Button>}
          >
            <div className="grid items-start gap-4 md:grid-cols-[120px_1fr]">
              <div className="grid place-items-center gap-2">
                <div className="h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                  <Avatar size={96} />
                </div>
                <Link
                  to="/avatar-builder"
                  className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Edit Avatar
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Labeled label="Name">
                  <input
                    className="rounded-md border px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </Labeled>
                <Labeled label="Grade" hint="e.g., 10, 11, 12">
                  <input
                    className="rounded-md border px-3 py-2"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="11"
                  />
                </Labeled>
                <Labeled label="District" className="sm:col-span-2">
                  <input
                    className="rounded-md border px-3 py-2"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Your district"
                  />
                </Labeled>
                <Labeled label="Phone (optional)" className="sm:col-span-2">
                  <input
                    className="rounded-md border px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </Labeled>
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences" subtitle="Local settings saved on this device">
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle
                checked={notifEnabled}
                onChange={setNotifEnabled}
                label="Enable in-app notifications"
                hint="We will not send emails — only in-app alerts."
              />
              <div className="grid gap-1 text-sm">
                <div className="text-slate-600">Theme</div>
                <Select value={theme} onChange={setTheme}>
                  <option value="auto">Auto (system)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
                <div className="text-xs text-slate-500">
                  Auto follows your OS appearance where supported.
                </div>
              </div>
              <div className="grid gap-1 text-sm">
                <div className="text-slate-600">Dashboard density</div>
                <Select value={density} onChange={setDensity}>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </Select>
              </div>
              <div className="grid content-end">
                <Button kind="secondary" onClick={() => resetLocal()}>
                  Reset local settings
                </Button>
              </div>
            </div>
          </Section>

          {/* Privacy & Security */}
          <Section title="Privacy & Security" subtitle="Demo-only utilities">
            <div className="grid gap-3">
              <div className="text-sm">
                <span className="text-slate-600">Signed in as</span>{" "}
                <span className="font-semibold">{profile?.email || "demo user"}</span>
              </div>
              {lastLogin ? (
                <div className="text-xs text-slate-500">Last login: {lastLogin}</div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button kind="secondary" onClick={exportData}>
                  Export my data (JSON)
                </Button>
                <Button kind="danger" onClick={resetLocal}>
                  Clear local data
                </Button>
                <Button kind="danger" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </div>
          </Section>

          {/* Developer / Demo helpers */}
          <Section title="Demo Helpers" subtitle="Swap between seeded identities quickly">
            <div className="flex flex-wrap items-center gap-2">
              <Button kind="secondary" onClick={() => setDemo("student@example.com")}>
                Use Student (demo)
              </Button>
              <Button kind="secondary" onClick={() => setDemo("parent@example.com")}>
                Use Parent (demo)
              </Button>
              <Button kind="secondary" onClick={() => setDemo("jordan@example.com")}>
                Use Jordan (demo)
              </Button>
            </div>
          </Section>
        </div>

        {/* Right rail */}
        <div className="grid gap-4">
          <Section title="Account">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <Avatar size={48} />
                </div>
                <div>
                  <div className="font-semibold">{profile?.name || "Student"}</div>
                  <div className="text-slate-600">{profile?.email || "demo@futurepath"}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Avatars, not photos, are shown in this demo. You can customize yours in the Avatar
                Builder.
              </div>
              <Link
                to="/avatar-builder"
                className="w-fit rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Customize Avatar
              </Link>
            </div>
          </Section>

          <Section title="Shortcuts">
            <div className="grid gap-2 text-sm">
              <Link to="/student" className="text-blue-600 underline">
                Go to Dashboard
              </Link>
              <Link to="/resources" className="text-blue-600 underline">
                Browse Resources
              </Link>
              <Link to="/bookmarks" className="text-blue-600 underline">
                View Bookmarks
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}



