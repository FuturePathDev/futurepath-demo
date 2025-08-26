// src/App.jsx
import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import "./index.css";

// Context + avatar
import { useProfile } from "./context/ProfileContext.jsx";
import { Avatar } from "./components/Avatar.jsx";

// Components
import Leaderboard from "./components/Leaderboard.jsx";
import Announcements from "./components/Announcements.jsx";
import UpdateProfileForm from "./components/UpdateProfileForm.jsx";

// Pages
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import ParentsLeaderboard from "./pages/ParentsLeaderboard.jsx";
import SchoolsLeaderboard from "./pages/SchoolsLeaderboard.jsx";
import CareerAssessment from "./pages/CareerAssessment.jsx";
import AssessmentResults from "./pages/AssessmentResults.jsx";
import Mentors from "./pages/Mentors.jsx";
import TutorsPage from "./pages/TutorsPage.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import DailyTasks from "./pages/DailyTasks.jsx";
import Journal from "./pages/Journal.jsx";

// Resources feature
import ResourcesPage from "./pages/ResourcesPage.jsx";
import ResourceDetail from "./pages/ResourceDetail.jsx";

/* ---------------- Icons ---------------- */
const IconDashboard = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 13h8V3H3zM13 21h8v-8h-8zM13 3h8v6h-8zM3 21h8v-6H3z" />
  </svg>
);
const IconTasks = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 11l3 3L22 4" /><path d="M2 20h20"/><path d="M2 14h6"/><path d="M2 8h10"/>
  </svg>
);
const IconPeers = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/><path d="M2 21v-1a6 6 0 0 1 6-6h1"/><path d="M22 3v1a6 6 0 0 1-6 6h-1"/>
  </svg>
);
const IconMessages = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
  </svg>
);
const IconJournal = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/><path d="M20 2H6.5A2.5 2.5 0 0 0 4 4.5v15"/><path d="M8 6h8M8 10h8M8 14h6"/>
  </svg>
);
const IconResources = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 19.5V6a2 2 0 0 1 2-2h9l5 5v10.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"/>
    <path d="M14 4v5h5"/>
  </svg>
);
const IconBookmarks = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconSettings = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1z"/>
  </svg>
);
const IconSignout = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>
  </svg>
);

/* ---------------- Layout ---------------- */
function SidebarLayout({ children }) {
  const navigate = useNavigate();

  function signOut() {
    try { localStorage.removeItem("demoEmail"); } catch {}
    navigate("/");
  }

  const linkClasses = (isActive) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium",
      "border shadow-sm transition-colors",
      isActive
        ? "bg-white border-sky-200 text-sky-800"
        : "bg-white/90 border-slate-200 text-slate-800 hover:bg-white"
    ].join(" ");

  return (
    <div className="relative min-h-screen" data-layout="fp-new">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50" />
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(40rem_40rem_at_20%_10%,rgba(14,165,233,0.12),transparent),radial-gradient(40rem_40rem_at_80%_90%,rgba(99,102,241,0.12),transparent)]" />
      </div>

      {/* LEFT: fixed sidebar */}
      <aside
        className="fixed left-0 top-0 z-20 h-screen w-64 border-r bg-white/70 p-4 backdrop-blur"
        aria-label="Primary"
      >
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img src="/logo.svg" alt="FuturePath" className="h-10 w-auto" />
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="search"
            placeholder="Search here"
            className="w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = e.currentTarget.value.trim();
                if (q) navigate(`/resources?query=${encodeURIComponent(q)}`);
              }
            }}
          />
        </div>

        {/* Vertical menu (button-like links) */}
        <nav className="flex flex-col gap-2" data-nav="fp-vertical">
          <NavLink to="/student" className={({isActive}) => linkClasses(isActive)}>
            <IconDashboard /> <span className="truncate">Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={({isActive}) => linkClasses(isActive)}>
            <IconTasks /> <span className="truncate">Tasks</span>
          </NavLink>
          <NavLink to="/mentors" className={({isActive}) => linkClasses(isActive)}>
            <IconPeers /> <span className="truncate">Peer Check-In</span>
          </NavLink>
          <NavLink to="/announcements" className={({isActive}) => linkClasses(isActive)}>
            <IconMessages /> <span className="truncate">Messages</span>
          </NavLink>
          <NavLink to="/journal" className={({isActive}) => linkClasses(isActive)}>
            <IconJournal /> <span className="truncate">Student Journal</span>
          </NavLink>

          <div className="my-2 h-px bg-slate-200/80" />

          <NavLink to="/resources" className={({isActive}) => linkClasses(isActive)}>
            <IconResources /> <span className="truncate">Resources</span>
          </NavLink>
          <NavLink to="/bookmarks" className={({isActive}) => linkClasses(isActive)}>
            <IconBookmarks /> <span className="truncate">Bookmarks</span>
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => linkClasses(isActive)}>
            <IconSettings /> <span className="truncate">Settings</span>
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => linkClasses(isActive)}>
            <IconJournal /> <span className="truncate">My Account</span>
          </NavLink>

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-3 rounded-xl border border-rose-200 bg-white/90 px-3 py-2 text-[13px] font-medium text-rose-700 shadow-sm hover:bg-white"
            onClick={signOut}
            aria-label="Sign out"
          >
            <IconSignout />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* TOP-RIGHT: compact user card (fixed) */}
      <div
        className="fixed right-4 top-4 z-10 w-80 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur"
        data-rail="fp-user-right-card"
      >
        <UserRail />
      </div>

      {/* CENTER content — keep right padding to avoid overlap with the user card */}
      <div className="pl-64 pr-[22rem]">
        <div className="mx-auto max-w-6xl p-4">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- UserRail ---------------- */
function UserRail() {
  const { profile } = useProfile();
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <Avatar size={56} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{profile?.name || "Student"}</div>
          <div className="truncate text-xs text-slate-600">{profile?.email || "demo@futurepath"}</div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-slate-500">Grade</div>
          <div className="text-sm font-semibold">{profile?.grade || "—"}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-slate-500">District</div>
          <div className="text-sm font-semibold">{profile?.district || "—"}</div>
        </div>
        {profile?.primaryFocusCareer ? (
          <div className="rounded-xl border p-3">
            <div className="text-xs text-slate-500">Focus Career</div>
            <div className="text-sm font-semibold">{profile.primaryFocusCareer}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        <NavLink to="/bookmarks" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
          View Bookmarks
        </NavLink>
        <NavLink to="/career/results" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
          View Assessment Results
        </NavLink>
      </div>
    </div>
  );
}

/* ---------------- Simple home ---------------- */
function Home() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">FuturePath App</h1>
      <p className="text-gray-700">
        Welcome. Use the navigation to explore dashboards, resources, and tools.
      </p>
    </div>
  );
}

/* ---------------- Routes ---------------- */
export default function App() {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />

        {/* Leaderboards */}
        <Route path="/leaders/students" element={<Leaderboard />} />
        <Route path="/leaders/parents" element={<ParentsLeaderboard />} />
        <Route path="/leaders/schools" element={<SchoolsLeaderboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/leaderboard/parents" element={<ParentsLeaderboard />} />
        <Route path="/leaderboard/schools" element={<SchoolsLeaderboard />} />

        {/* Journal */}
        <Route path="/journal" element={<Journal />} />

        {/* Assessment */}
        <Route path="/assessment" element={<CareerAssessment />} />
        <Route path="/assessment/results" element={<AssessmentResults />} />
        <Route path="/career" element={<CareerAssessment />} />
        <Route path="/career/results" element={<AssessmentResults />} />

        {/* Mentors & Tutors */}
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/tutors" element={<TutorsPage />} />

        {/* Resources */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />

        {/* Bookmarks, Tasks, Settings, Profile */}
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/tasks" element={<DailyTasks />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/profile" element={<UpdateProfileForm />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </SidebarLayout>
  );
}




