// src/components/UserProfileBanner.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";
import { fetchProfileByEmail, mergeLocalProfile } from "../lib/userApi";

/**
 * Simple, resilient profile banner:
 * - Shows name, district, grade
 * - Shows primary focus career if available
 * - Provides "Refresh" to pull latest profile by email
 * - Never references globalThis
 */
export default function UserProfileBanner() {
  const { profile, status } = useProfile() || { profile: null, status: "idle" };
  const [view, setView] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // keep local view in sync with context profile
  useEffect(() => {
    setView(profile);
  }, [profile]);

  const email =
    (view && view.email) ||
    (() => {
      try {
        return localStorage.getItem("demoEmail") || "student@example.com";
      } catch {
        return "student@example.com";
      }
    })();

  async function onRefresh() {
    try {
      setLoading(true);
      setErr("");
      const next = await fetchProfileByEmail(email);
      setView(next || {});
      // also merge into local cached profile so other parts of the app benefit
      mergeLocalProfile(next || {});
    } catch (e) {
      setErr(e?.message || "Failed to refresh profile");
    } finally {
      setLoading(false);
    }
  }

  const name =
    (view && view.name) ||
    (email ? email.split("@")[0] : "Student");
  const district = (view && view.district) || "—";
  const grade = (view && view.grade) || "—";
  const focus =
    Array.isArray(view?.focusCareers) && view.focusCareers.length
      ? view.focusCareers[0]
      : (view && view.focus) || null;

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-gray-600">Welcome</div>
          <h2 className="truncate text-xl font-semibold">{name}</h2>
          <div className="mt-1 text-sm text-gray-600">
            {district !== "—" ? `${district} • ` : ""}
            {grade !== "—" ? `Grade ${grade}` : ""}
          </div>
          {focus ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <span className="font-medium">Focus:</span>
              <span>{focus}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Edit Profile
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || status === "loading"}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            title="Refresh profile from server"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}
    </div>
  );
}
