// src/components/MentorInvitePanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useProfile } from "../context/ProfileContext.jsx";
import {
  getMentors,
  listInvitesByStudent,
  createInvite,
} from "../lib/mentorsApi";

/** Small pill */
function Pill({ children }) {
  return (
    <span className="rounded-full border px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}

export default function MentorInvitePanel() {
  const { profile } = useProfile();

  // student identity
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

  // focus from holland code
  const focus = useMemo(() => {
    const hc = String(profile?.hollandCode || "")
      .toUpperCase()
      .replace(/[^RIASEC]/g, "");
    return hc.slice(0, 2);
  }, [profile?.hollandCode]);

  // recommended mentors
  const mentors = useMemo(() => getMentors({ focus }), [focus]);
  const top = mentors.slice(0, 3);

  // invites
  const [invites, setInvites] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingInv(true);
      try {
        const { invites: rows } = await listInvitesByStudent(studentDefaults.email, {
          limit: 10,
        });
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
  }, [studentDefaults.email]);

  // sending state
  const [busyId, setBusyId] = useState(null);
  async function sendInvite(m) {
    setBusyId(m.id);
    try {
      const { invite } = await createInvite({
        mentorId: m.id,
        mentorName: m.name,
        studentEmail: studentDefaults.email,
        studentName: studentDefaults.name,
        message: null,
      });
      setInvites((prev) => [invite, ...prev]);
    } catch {
      // swallow for demo
    } finally {
      setBusyId(null);
    }
  }

  return (
    <aside className="sticky top-4 rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold">Mentor matches</div>

      {!top.length ? (
        <div className="text-sm text-gray-600">
          No matches yet. Complete the{" "}
          <a href="/career" className="underline">
            Career Assessment
          </a>{" "}
          to personalize.
        </div>
      ) : (
        <ul className="grid gap-3">
          {top.map((m) => (
            <li key={m.id} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="truncate text-xs text-gray-600">{m.title}</div>
                </div>
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => sendInvite(m)}
                  className="rounded-md bg-black px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busyId === m.id ? "Sending…" : "Invite"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Pill>RIASEC: {m.riasec}</Pill>
                <Pill>Focus: {m.focus}</Pill>
                {m.tags.slice(0, 2).map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t pt-3">
        <div className="mb-1 text-xs font-semibold">Your invites</div>
        {loadingInv ? (
          <div className="text-xs text-gray-600">Loading…</div>
        ) : !invites.length ? (
          <div className="text-xs text-gray-600">No invites sent yet.</div>
        ) : (
          <ul className="grid gap-1">
            {invites.slice(0, 5).map((r) => (
              <li key={r.inviteId} className="flex items-center justify-between text-xs">
                <span className="truncate">{r.mentorName}</span>
                <span className="text-gray-500">{r.status || "invited"}</span>
              </li>
            ))}
          </ul>
        )}
        <a href="/mentors" className="mt-2 inline-block text-xs text-blue-600 underline">
          Browse all mentors →
        </a>
      </div>
    </aside>
  );
}
