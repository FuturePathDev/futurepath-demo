// src/components/MentorStickyCard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";
import { saveProfile, mergeLocalProfile } from "../lib/userApi";

const RIASEC_NAMES = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

function initialsOf(name) {
  return String(name || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() || "")
    .join("");
}

function chipsFromFocus(focus) {
  return String(focus || "")
    .replace(/[^RIASEC]/gi, "")
    .toUpperCase()
    .split("")
    .filter(Boolean)
    .slice(0, 6);
}

function statusBadgeClasses(s) {
  const v = String(s || "").toLowerCase();
  if (v === "available") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v === "busy") return "bg-amber-50 text-amber-700 border-amber-200";
  if (v === "on leave" || v === "onleave") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function MentorStickyCard() {
  const { profile, setProfile, refresh } = useProfile();
  const mentor = profile?.mentor || null;

  const email = useMemo(() => {
    if (profile?.email) return profile.email;
    try {
      return localStorage.getItem("demoEmail") || "student@example.com";
    } catch {
      return "student@example.com";
    }
  }, [profile?.email]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function unlinkMentor() {
    if (!mentor || saving) return;
    setSaving(true);
    setMsg("");

    // optimistic clear
    if (typeof setProfile === "function") {
      setProfile((prev) => ({ ...(prev || {}), mentor: null }));
    }

    try {
      await saveProfile({ email, mentor: null });
      try {
        mergeLocalProfile({ mentor: null });
      } catch {}
      setMsg("Mentor unlinked.");
      try {
        if (typeof refresh === "function") refresh();
      } catch {}
    } catch (e) {
      // rollback on error
      if (typeof setProfile === "function") {
        setProfile((prev) => ({ ...(prev || {}), mentor }));
      }
      setMsg(e?.message || "Failed to unlink. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="sticky top-4">
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Mentor</h3>
          <Link
            to="/mentors"
            className="text-sm text-blue-600 underline"
            title="Browse mentors"
          >
            Change
          </Link>
        </div>

        {!mentor ? (
          <div className="text-sm text-gray-700">
            You haven’t selected a mentor yet.
            <div className="mt-3">
              <Link
                to="/mentors"
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Find a Mentor
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-900 text-white font-bold">
                  {initialsOf(mentor.name)}
                </div>
                <div>
                  <div className="font-semibold">{mentor.name}</div>
                  <div className="text-sm text-gray-600">{mentor.title}</div>
                </div>
              </div>
              <span
                className={
                  "rounded-full border px-2 py-0.5 text-xs font-medium " +
                  statusBadgeClasses(mentor.status)
                }
                title={`Status: ${mentor.status || "—"}`}
              >
                {mentor.status || "—"}
              </span>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              {mentor.school ? `${mentor.school} • ` : ""}
              {mentor.district || "—"}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {chipsFromFocus(mentor.focus).map((k, i) => (
                <span
                  key={`mf-${i}`}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs"
                  title={RIASEC_NAMES[k] || k}
                >
                  {k}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                to="/mentors"
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                title="Message or view details"
              >
                Message
              </Link>

              <button
                type="button"
                onClick={unlinkMentor}
                disabled={saving}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                title="Remove mentor from your profile"
              >
                {saving ? "Unlinking…" : "Unlink mentor"}
              </button>
            </div>

            {msg ? (
              <div className="mt-2 text-xs text-gray-600">{msg}</div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
