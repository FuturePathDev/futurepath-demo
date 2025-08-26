// src/pages/StudentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";
import { saveProfile, mergeLocalProfile } from "../lib/userApi";
import MentorInvitePanel from "../components/MentorInvitePanel.jsx";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function firstOr(arr, fallback = null) {
  return Array.isArray(arr) && arr.length ? arr[0] : fallback;
}

/** Demo-friendly default career set if user has none yet */
const DEFAULT_CAREERS = [
  "Software Developer",
  "Data Analyst",
  "Nurse",
  "Graphic Designer",
  "Electrician",
  "Product Manager",
  "Teacher",
  "Operations Analyst",
  "Marketing Manager",
  "Construction Manager",
];

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                 */
/* ------------------------------------------------------------------ */
function SectionCard({ title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-gray-600">{subtitle}</div> : null}
        </div>
        {right || null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}
function ActionButton({ children, onClick, variant = "solid", disabled }) {
  const base =
    "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  const theme =
    variant === "solid"
      ? "bg-black text-white"
      : "border hover:bg-gray-50";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${theme}`}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export default function StudentDashboard() {
  const { profile, setProfile } = useProfile();

  // Personalized basics
  const name = profile?.name || "Student";
  const district = profile?.district || "—";
  const grade = profile?.grade ? `Grade ${profile.grade}` : "—";

  // Careers (from assessment results) or demo defaults
  const focusCareers = useMemo(() => {
    const list = Array.isArray(profile?.focusCareers) ? profile.focusCareers : [];
    return list.length ? list : DEFAULT_CAREERS;
  }, [profile?.focusCareers]);

  const primaryFocus = useMemo(() => firstOr(focusCareers, "Choose a track"), [focusCareers]);

  // Local “selected focus” lets student set one main focus career
  const [selectedFocus, setSelectedFocus] = useState(() => {
    try {
      const raw = localStorage.getItem("fp_selected_focus");
      return raw ? JSON.parse(raw) : firstOr(focusCareers, null);
    } catch {
      return firstOr(focusCareers, null);
    }
  });

  useEffect(() => {
    // Keep local selection in sync if profile’s focus list changes
    if (!selectedFocus && focusCareers.length) {
      setSelectedFocus(focusCareers[0]);
    }
  }, [focusCareers, selectedFocus]);

  async function makePrimary(career) {
    setSelectedFocus(career);
    try {
      localStorage.setItem("fp_selected_focus", JSON.stringify(career));
    } catch {}
    // Persist a UX hint (optional)
    try {
      const next = mergeLocalProfile(profile, { primaryFocusCareer: career });
      setProfile(next);
      await saveProfile({ email: next?.email, primaryFocusCareer: career });
    } catch {
      // non-fatal in demo
    }
  }

  // Quick “Daily Tasks” stub based on primary focus
  const dailyTasks = useMemo(() => {
    const pf = String(selectedFocus || primaryFocus);
    const base = [
      { id: "task-1", text: `Watch a 5-min video about ${pf}`, done: false },
      { id: "task-2", text: `Find 2 local programs related to ${pf}`, done: false },
      { id: "task-3", text: `Add one mentor question for ${pf}`, done: false },
    ];
    return base;
  }, [selectedFocus, primaryFocus]);

  // Announcements stub
  const announcements = [
    {
      id: "ann-1",
      title: "Career Fair next Friday",
      body: "Meet local employers and programs. Bring a resume!",
    },
    {
      id: "ann-2",
      title: "CTE Info Night",
      body: "Parents & students welcome. Explore pathway options.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Top greeting + quick links */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {name.split(" ")[0]}</h1>
          <div className="text-sm text-gray-600">
            {district} • {grade}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/career" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Career Assessment
          </Link>
          <Link to="/leaderboard" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Students LB
          </Link>
          <Link to="/leaderboard/schools" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Schools LB
          </Link>
        </div>
      </div>

      {/* Grid: main + sticky sidebar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="grid gap-4">
          {/* Focus Hero */}
          <section className="rounded-2xl border bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-5 text-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide opacity-90">Focus Career</div>
                <div className="truncate text-2xl font-extrabold">
                  {selectedFocus || primaryFocus}
                </div>
                <div className="mt-1 text-sm opacity-95">
                  Personalized tasks and opportunities for your selected pathway.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/career"
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700"
                  >
                    Retake Assessment
                  </Link>
                  <Link
                    to="/career/results"
                    className="rounded-full border border-white/60 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    View Results
                  </Link>
                </div>
              </div>

              {/* Simple avatar cluster placeholder */}
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid h-9 w-9 -ml-2 place-items-center rounded-full bg-white/90 font-bold text-cyan-700 shadow"
                    style={{ transform: `translateX(${i * -8}px)` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recommended careers */}
          <SectionCard
            title="Recommended careers"
            subtitle="Based on your assessment results"
            right={
              <Link to="/career/results" className="text-sm text-blue-600 underline">
                Manage list
              </Link>
            }
          >
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {focusCareers.slice(0, 9).map((c) => (
                <li key={c} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="truncate text-sm font-medium">{c}</div>
                  <ActionButton
                    variant={selectedFocus === c ? "solid" : "outline"}
                    onClick={() => makePrimary(c)}
                  >
                    {selectedFocus === c ? "Selected" : "Set focus"}
                  </ActionButton>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Daily tasks */}
          <SectionCard
            title="Daily tasks"
            subtitle="Small steps toward your focus"
            right={<Link to="/leaderboard" className="text-sm text-blue-600 underline">View leaderboard</Link>}
          >
            <ul className="grid gap-2">
              {dailyTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="text-sm">{t.text}</div>
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    onClick={() => {/* future: mark complete */}}
                  >
                    Mark done
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Announcements preview */}
          <SectionCard
            title="Announcements"
            subtitle="What’s new in your district"
            right={<Link to="/announcements" className="text-sm text-blue-600 underline">See all</Link>}
          >
            <ul className="grid gap-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-xl border p-3">
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-sm text-gray-700">{a.body}</div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Open positions nearby (stub) */}
          <SectionCard title="Open positions nearby" subtitle="Map module placeholder">
            <div className="grid place-items-center rounded-xl border bg-gray-50 p-10 text-sm text-gray-600">
              Map / cards coming soon
            </div>
          </SectionCard>
        </div>

        {/* Sticky right sidebar */}
        <div className="grid gap-4">
          <MentorInvitePanel />

          <section className="sticky top-4 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold">Quick links</div>
            <ul className="grid gap-2 text-sm">
              <li>
                <Link to="/career" className="text-blue-600 underline">
                  Take / Retake Career Assessment
                </Link>
              </li>
              <li>
                <Link to="/career/results" className="text-blue-600 underline">
                  View Assessment Results
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-blue-600 underline">
                  Students Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/leaderboard/parents" className="text-blue-600 underline">
                  Parents Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/leaderboard/schools" className="text-blue-600 underline">
                  Schools Leaderboard
                </Link>
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-1">
              <Pill>{profile?.hollandCode || "RIASEC"}</Pill>
              {profile?.primaryFocusCareer ? <Pill>{profile.primaryFocusCareer}</Pill> : null}
              {profile?.district ? <Pill>{profile.district}</Pill> : null}
              {profile?.grade ? <Pill>Grade {profile.grade}</Pill> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



