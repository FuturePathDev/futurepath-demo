// src/pages/TutorsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";

/**
 * Resolve API base like the rest of the app:
 * - window.API_BASE
 * - Vite: import.meta.env.VITE_API_BASE
 * - CRA:  process.env.REACT_APP_API_BASE
 * - Fallback: your deployed API stage
 */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo";

/** Fallback demo tutors (used if API unavailable) */
const DEMO_TUTORS = [
  {
    tutorId: "t-101",
    tutorName: "Jamie Lee",
    email: "jamie.tutor@example.com",
    subjects: ["Algebra", "Geometry", "SAT Math"],
    city: "Riverside",
  },
  {
    tutorId: "t-102",
    tutorName: "Priya S.",
    email: "priya.sci@example.com",
    subjects: ["Biology", "Chemistry", "AP Bio"],
    city: "Metro",
  },
  {
    tutorId: "t-103",
    tutorName: "Carlos M.",
    email: "carlos.english@example.com",
    subjects: ["English", "Essay Writing", "SAT EBRW"],
    city: "Valley",
  },
  {
    tutorId: "t-104",
    tutorName: "Ava T.",
    email: "ava.cs@example.com",
    subjects: ["Intro CS", "Python", "AP CSA"],
    city: "Metro",
  },
];

function Pill({ children }) {
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}

function Label({ children }) {
  return (
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {children}
    </span>
  );
}

export default function TutorsPage() {
  const { profile } = useProfile();

  // List + fetching state
  const [tutors, setTutors] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");

  // Filters
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [picked, setPicked] = useState(null);
  const [invStatus, setInvStatus] = useState("idle"); // idle | loading | ok | error
  const [invError, setInvError] = useState("");

  // Pre-fill from profile (or demo)
  const defaultStudentEmail = useMemo(() => {
    if (profile?.email) return profile.email;
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  }, [profile?.email]);

  const defaultStudentName = profile?.name || "";
  const [studentEmail, setStudentEmail] = useState(defaultStudentEmail);
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [parentEmail, setParentEmail] = useState("");
  const [parentName, setParentName] = useState("");

  // Load tutors from API
  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus("loading");
      setError("");
      try {
        const res = await fetch(`${API_BASE}/tutors`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Expect an array of { tutorId, tutorName, email, subjects[] , ... }
        const arr = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
        const normalized = arr
          .map((t) => ({
            tutorId: t.tutorId || t.id || t.tutorID || t.pk || String(t.tutorName || ""),
            tutorName: t.tutorName || t.name || "Tutor",
            email: t.email || "",
            subjects: Array.isArray(t.subjects) ? t.subjects : [],
            city: t.city || "",
          }))
          .filter((t) => t.tutorId && t.tutorName);
        if (!ignore) {
          setTutors(normalized);
          setStatus("ok");
        }
      } catch (e) {
        // Fallback to demo list
        if (!ignore) {
          setTutors(DEMO_TUTORS);
          setStatus("ok");
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const subjectsAll = useMemo(() => {
    const set = new Set();
    for (const t of tutors) for (const s of t.subjects || []) set.add(s);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tutors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const subj = subject.trim().toLowerCase();
    return tutors.filter((t) => {
      const passQ =
        !q ||
        t.tutorName.toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        (t.city || "").toLowerCase().includes(q) ||
        (t.subjects || []).some((s) => s.toLowerCase().includes(q));
      const passS = !subj || (t.subjects || []).some((s) => s.toLowerCase() === subj);
      return passQ && passS;
    });
  }, [tutors, query, subject]);

  function openInvite(t) {
    setPicked(t);
    // refresh prefills from current profile when opening
    setStudentEmail(profile?.email || defaultStudentEmail);
    setStudentName(profile?.name || defaultStudentName);
    setInviteOpen(true);
    setInvStatus("idle");
    setInvError("");
  }

  async function submitInvite(e) {
    e.preventDefault();
    if (!picked) return;
    if (!studentEmail.trim()) {
      setInvStatus("error");
      setInvError("Student email is required.");
      return;
    }
    try {
      setInvStatus("loading");
      setInvError("");
      const payload = {
        tutorId: picked.tutorId,
        tutorName: picked.tutorName,
        studentEmail: studentEmail.trim(),
        studentName: studentName.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
        parentName: parentName.trim() || undefined,
      };
      const res = await fetch(`${API_BASE}/tutors/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}\n${text || "(no body)"}`);
      }
      // Success
      setInvStatus("ok");
      // small delay then close
      setTimeout(() => {
        setInviteOpen(false);
        setPicked(null);
      }, 700);
    } catch (e) {
      setInvStatus("error");
      setInvError(e?.message || "Failed to send invite.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tutors</h1>
          <p className="text-gray-600">
            Browse available tutors and send an invite for your student.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city, subject…"
            className="rounded-md border px-3 py-2"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-md border px-3 py-2"
          >
            <option value="">All subjects</option>
            {subjectsAll.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </header>

      {status === "loading" ? (
        <div className="rounded-2xl border p-4 text-sm text-gray-600">Loading tutors…</div>
      ) : status === "error" ? (
        <div className="rounded-2xl border p-4 text-sm text-red-700 bg-red-50">
          {error || "Failed to load tutors."}
        </div>
      ) : !filtered.length ? (
        <div className="rounded-2xl border p-4 text-sm text-gray-600">No tutors match the filters.</div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.tutorId} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{t.tutorName}</div>
                  <div className="text-xs text-gray-500">{t.city || "—"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => openInvite(t)}
                  className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                >
                  Invite
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                <div className="flex flex-wrap gap-1">
                  {(t.subjects || []).map((s) => (
                    <Pill key={`${t.tutorId}-${s}`}>{s}</Pill>
                  ))}
                </div>
                {t.email ? (
                  <div className="text-sm text-gray-700">
                    <Label>Email</Label>
                    <div>{t.email}</div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Invite modal */}
      {inviteOpen && picked ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Invite tutor</div>
                <div className="text-xl font-bold">{picked.tutorName}</div>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-md border px-2 py-1 text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {invStatus === "ok" ? (
              <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-800">
                Invite sent!
              </div>
            ) : invStatus === "error" ? (
              <div className="mt-4 whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
                {invError}
              </div>
            ) : null}

            <form onSubmit={submitInvite} className="mt-4 grid gap-3">
              <div className="grid gap-1">
                <Label>Student name</Label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="Alex Kim"
                />
              </div>
              <div className="grid gap-1">
                <Label>Student email (required)</Label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="student@example.com"
                />
              </div>
              <div className="grid gap-1">
                <Label>Parent/Guardian name (optional)</Label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="Parent name"
                />
              </div>
              <div className="grid gap-1">
                <Label>Parent/Guardian email (optional)</Label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="rounded-md border px-3 py-2"
                  placeholder="parent@example.com"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invStatus === "loading"}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {invStatus === "loading" ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

