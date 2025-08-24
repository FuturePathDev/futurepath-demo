// src/pages/Onboarding.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";

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

const ROLES = [
  { key: "student", label: "Student" },
  { key: "parent", label: "Parent/Guardian" },
  { key: "admin", label: "School Admin" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    profile,
    saveProfile,
    refreshProfile,
    isStudent,
    isParent,
    isAdmin,
  } = useProfile();

  // Demo identity (same approach used elsewhere)
  const demoEmail = useMemo(() => {
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  }, []);

  // step: 1 = choose role, 2 = details
  const [step, setStep] = useState(1);

  // form state
  const [role, setRole] = useState(profile?.role || "");
  const [name, setName] = useState(profile?.name || "");
  const [district, setDistrict] = useState(profile?.district || "");
  const [grade, setGrade] = useState(profile?.grade || "");
  const [childEmailInput, setChildEmailInput] = useState("");

  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [error, setError] = useState("");

  // If a role already exists, prefill & maybe skip step 1
  useEffect(() => {
    if (profile?.role && step === 1) {
      setRole(profile.role);
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.role]);

  function next() {
    if (!role) return;
    setStep(2);
  }

  function back() {
    setStep(1);
  }

  function parseChildrenList() {
    if (!childEmailInput.trim()) return [];
    return childEmailInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function validForSubmit() {
    if (!role || !name.trim() || !district.trim()) return false;
    if (role === "student" && !String(grade).trim()) return false;
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validForSubmit()) return;

    try {
      setStatus("saving");
      setError("");

      const base = {
        email: profile?.email || demoEmail,
        role,
        name: name.trim(),
        district: district.trim(),
      };
      if (role === "student") base.grade = String(grade).trim();

      // Parent: attach children array if provided
      if (role === "parent") {
        const kids = parseChildrenList();
        if (kids.length) base.children = kids;
      }

      await saveProfile(base);

      // optional refresh (if backend enriches anything)
      await refreshProfile();

      // route per role
      if (role === "student") navigate("/dashboard");
      else if (role === "parent") navigate("/parent");
      else navigate("/"); // admin dashboard can be added later
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Failed to save profile");
    } finally {
      setStatus((s) => (s === "saving" ? "idle" : s));
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Welcome to FuturePath</h1>
        <div className="text-sm text-gray-600">
          Let’s set up your profile so we can personalize your experience.
        </div>
      </header>

      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="mb-4 text-sm text-gray-600">
          Signed in as{" "}
          <span className="font-medium">
            {profile?.email || demoEmail}
          </span>
        </div>

        {/* Stepper header */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <span className={`rounded-full px-2 py-0.5 ${step === 1 ? "bg-black text-white" : "bg-gray-200"}`}>
            1
          </span>
          <span>Select role</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className={`rounded-full px-2 py-0.5 ${step === 2 ? "bg-black text-white" : "bg-gray-200"}`}>
            2
          </span>
          <span>Basic details</span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">Choose your role:</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`rounded-lg border px-3 py-3 text-left hover:bg-gray-50 ${
                    role === r.key ? "border-black" : "border-gray-300"
                  }`}
                >
                  <div className="font-medium">{r.label}</div>
                  <div className="text-xs text-gray-500">{r.key}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div />
              <button
                type="button"
                onClick={next}
                disabled={!role}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="text-sm text-gray-700">
              Role:{" "}
              <span className="font-medium">
                {ROLES.find((r) => r.key === role)?.label || role}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="e.g., Alex Kim"
                  required
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">District</span>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="e.g., Riverside USD"
                  required
                />
              </label>

              {role === "student" ? (
                <label className="grid gap-1">
                  <span className="text-sm">Grade</span>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="rounded-md border px-3 py-2"
                    placeholder="e.g., 9"
                    required
                  />
                </label>
              ) : null}

              {role === "parent" ? (
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-sm">
                    Child email(s) (optional, comma-separated)
                  </span>
                  <input
                    type="text"
                    value={childEmailInput}
                    onChange={(e) => setChildEmailInput(e.target.value)}
                    className="rounded-md border px-3 py-2"
                    placeholder="e.g., student@example.com, child2@example.com"
                  />
                </label>
              ) : null}
            </div>

            {status === "error" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!validForSubmit() || status === "saving"}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {status === "saving" ? "Saving…" : "Finish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
