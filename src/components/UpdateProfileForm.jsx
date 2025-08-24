import React, { useEffect, useMemo, useState } from "react";

/**
 * Resolve API base in a resilient way:
 * - window.API_BASE (quick override)
 * - Vite: import.meta.env.VITE_API_BASE
 * - CRA:  process.env.REACT_APP_API_BASE
 * - Fallback: your demo URL
 */
const API_BASE = (() => {
  const fromWindow = typeof window !== "undefined" && window.API_BASE ? window.API_BASE : null;
  const fromVite =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE
      ? import.meta.env.VITE_API_BASE
      : null;
  const fromCRA =
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE
      ? process.env.REACT_APP_API_BASE
      : null;
  return (
    fromWindow ||
    fromVite ||
    fromCRA ||
    "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo"
  );
})();

/** Helpers */
function readProfile() {
  try {
    const raw = localStorage.getItem("fp_user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveProfile(p) {
  try {
    localStorage.setItem("fp_user", JSON.stringify(p || {}));
  } catch {}
}

/** Small “input” wrapper */
function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export default function UpdateProfileForm() {
  const initial = useMemo(() => {
    const p = readProfile();
    return {
      email: p.email || "",
      name: p.name || "",
      role: p.role || "student",
      district: p.district || "",
      grade: p.grade || "",
      schoolId: p.schoolId || "",
    };
  }, []);

  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const districts = useMemo(() => {
    const set = new Set();
    for (const s of schools) if (s?.district) set.add(s.district);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [schools]);

  const schoolsByDistrict = useMemo(() => {
    const map = {};
    for (const s of schools) {
      const d = s?.district || "Other";
      if (!map[d]) map[d] = [];
      map[d].push(s);
    }
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return map;
  }, [schools]);

  useEffect(() => {
    async function loadSchools() {
      setLoadingSchools(true);
      try {
        const res = await fetch(`${API_BASE}/schools`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // normalize to an array
        const arr = Array.isArray(json?.overallTop)
          ? json.overallTop
          : Array.isArray(json)
          ? json
          : [];
        // ensure we have {id, name, district}
        const norm = arr
          .map((x) => ({
            id: x.id,
            name: x.name || x.id,
            district: x.district || "",
          }))
          .filter((x) => x.id);
        setSchools(norm);
      } catch (e) {
        // fallback sample
        setSchools([
          { id: "S-001", name: "Riverside High", district: "Riverside USD" },
          { id: "S-002", name: "Ramona Academy", district: "Riverside USD" },
          { id: "S-003", name: "Hillcrest Prep", district: "Riverside USD" },
          { id: "S-101", name: "Metro North HS", district: "Metro USD" },
          { id: "S-102", name: "Metro Tech", district: "Metro USD" },
          { id: "S-201", name: "Valley Charter", district: "Valley USD" },
        ]);
      } finally {
        setLoadingSchools(false);
      }
    }
    loadSchools();
  }, []);

  function onChange(k, v) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // keep district in sync if school changes
      if (k === "schoolId") {
        const found = schools.find((s) => s.id === v);
        if (found) next.district = found.district || next.district;
      }
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      // Upsert to /user (idempotent)
      const res = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}\n${text || "(no body)"}`);
      }
      const json = await res.json().catch(() => ({}));
      const saved = json?.profile || form;

      // persist locally for the rest of the app (dashboards/LBs read this)
      saveProfile(saved);

      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Failed to save profile");
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-2">Update Profile</h1>
      <p className="text-gray-600 mb-4">
        This powers personalization across dashboards and leaderboards.
      </p>

      {status === "error" && (
        <div
          style={{
            border: "1px solid #ef4444",
            background: "#fef2f2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      {status === "ok" && (
        <div
          style={{
            border: "1px solid #10b981",
            background: "#ecfdf5",
            color: "#065f46",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          Profile saved.
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border p-4"
        style={{ background: "white" }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Full name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="Alex Kim"
              required
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) => onChange("role", e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="admin">School Admin</option>
            </select>
          </Field>

          <Field label="Grade (if student)">
            <select
              value={form.grade}
              onChange={(e) => onChange("grade", e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="">—</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </Field>

          <Field label="District">
            <input
              type="text"
              value={form.district}
              onChange={(e) => onChange("district", e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="Riverside USD"
              list="districts-list"
            />
            {/* datalist from fetched schools */}
            <datalist id="districts-list">
              {districts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>

          <Field label="School">
            {loadingSchools ? (
              <div className="text-sm text-gray-500">Loading schools…</div>
            ) : (
              <select
                value={form.schoolId}
                onChange={(e) => onChange("schoolId", e.target.value)}
                className="rounded-md border px-3 py-2"
              >
                <option value="">— Select school —</option>
                {Object.keys(schoolsByDistrict)
                  .sort((a, b) => a.localeCompare(b))
                  .map((dist) => (
                    <optgroup key={dist} label={dist}>
                      {schoolsByDistrict[dist].map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            )}
            <div className="text-xs text-gray-500">
              Selecting a school will also set your district automatically.
            </div>
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Saving…" : "Save Profile"}
          </button>
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={() => {
              setForm(initial);
              setStatus("idle");
              setError("");
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
