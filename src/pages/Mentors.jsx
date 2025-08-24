// src/pages/Mentors.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";
import {
  createInvite,
  listInvitesByStudent,
  getMentors,
  getAllMentors,
} from "../lib/mentorsApi";

/* ---------------------------
 * Small UI primitives
 * --------------------------*/
function TextInput({ label, value, onChange, placeholder, type = "text", disabled }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-md border px-3 py-2 disabled:bg-gray-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-gray-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border px-3 py-2"
      />
    </label>
  );
}

/* ---------------------------
 * Mentor Card
 * --------------------------*/
function MentorCard({ m, onInvite }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{m.name}</div>
          <div className="text-sm text-gray-600">{m.title}</div>
          <div className="mt-1 text-xs text-gray-500">
            RIASEC: {m.riasec} • Focus: {m.focus}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onInvite(m)}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          Invite
        </button>
      </div>

      <div className="mt-3 text-sm">{m.bio}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {m.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border px-2 py-0.5 text-xs text-gray-700"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------
 * Invite Form (student-only)
 * --------------------------*/
function InviteForm({ openFor, studentDefaults, onClose, onCreated }) {
  const [studentEmail, setStudentEmail] = useState(studentDefaults.email || "");
  const [studentName, setStudentName] = useState(studentDefaults.name || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!openFor) return;
    setBusy(true);
    setErr("");

    try {
      const { invite } = await createInvite({
        mentorId: openFor.id,
        mentorName: openFor.name,
        studentEmail,
        studentName,
        message: message || null,
      });
      onCreated?.(invite);
      onClose?.();
    } catch (e2) {
      setErr(e2?.message || "Failed to send invite");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500">Invite mentor</div>
            <div className="text-lg font-semibold">{openFor?.name}</div>
            <div className="text-sm text-gray-600">{openFor?.title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {err ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <form className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Your name"
              value={studentName}
              onChange={setStudentName}
              placeholder="Alex Kim"
            />
            <TextInput
              label="Your email"
              value={studentEmail}
              onChange={setStudentEmail}
              placeholder="student@example.com"
              type="email"
            />
          </div>

          <TextArea
            label="Message (optional)"
            value={message}
            onChange={setMessage}
            placeholder="Why do you want to connect with this mentor?"
          />

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !studentEmail}
              className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------
 * Mentors page
 * --------------------------*/
export default function Mentors() {
  const { profile } = useProfile();

  // student identity (demo-friendly)
  const defaultEmail = useMemo(() => {
    if (profile?.email) return profile.email;
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  }, [profile?.email]);

  const studentDefaults = useMemo(
    () => ({
      email: defaultEmail,
      name: profile?.name || "",
    }),
    [defaultEmail, profile?.name]
  );

  // filters
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(() => {
    // prefer student's holland code, fallback to empty (show all)
    const hc = String(profile?.hollandCode || "")
      .toUpperCase()
      .replace(/[^RIASEC]/g, "");
    return hc.slice(0, 2);
  });

  // mentor list
  const mentors = useMemo(() => {
    const list = (q || focus) ? getMentors({ q, focus }) : getAllMentors();
    return list;
  }, [q, focus]);

  // invites
  const [invites, setInvites] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingInv(true);
      try {
        const { invites: rows } = await listInvitesByStudent(defaultEmail, { limit: 20 });
        if (alive) setInvites(rows);
      } catch {
        if (alive) setInvites([]);
      } finally {
        if (alive) setLoadingInv(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [defaultEmail]);

  // modal
  const [openFor, setOpenFor] = useState(null);

  function onCreated(invite) {
    setInvites((prev) => [invite, ...prev]);
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Find a Mentor</h1>
          <div className="text-sm text-gray-600">
            Student-selected mentors. Send an invite; mentor accepts later.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search mentors, skills, titles…"
            className="w-72 rounded-md border px-3 py-2"
          />
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value.toUpperCase().replace(/[^RIASEC]/g, "").slice(0, 2))}
            placeholder="Focus (e.g., RI, AE)"
            className="w-28 rounded-md border px-3 py-2 font-mono"
          />
        </div>
      </header>

      {/* Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((m) => (
          <MentorCard key={m.id} m={m} onInvite={setOpenFor} />
        ))}
      </section>

      {/* Invites list */}
      <section className="space-y-2">
        <div className="text-sm font-semibold">Your invites</div>
        <div className="rounded-xl border p-4">
          {loadingInv ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : !invites.length ? (
            <div className="text-sm text-gray-600">No invites yet.</div>
          ) : (
            <ul className="divide-y">
              {invites.map((r) => (
                <li key={r.inviteId} className="flex items-center justify-between py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{r.mentorName}</div>
                    <div className="text-gray-600">
                      Status: <span className="font-medium">{r.status || "invited"}</span>
                      {r.message ? <span className="ml-2 italic text-gray-500">“{r.message}”</span> : null}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(r.createdAt || r.updatedAt || Date.now()).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {openFor ? (
        <InviteForm
          openFor={openFor}
          studentDefaults={studentDefaults}
          onClose={() => setOpenFor(null)}
          onCreated={onCreated}
        />
      ) : null}
    </div>
  );
}
