// src/App.jsx
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";

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


// Resources feature
import ResourcesPage from "./pages/ResourcesPage.jsx";
import ResourceDetail from "./pages/ResourceDetail.jsx";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-4">
          <NavLink to="/" className="font-semibold">FuturePath</NavLink>

          <NavLink to="/student" className="text-sm">Student</NavLink>
          <NavLink to="/parent" className="text-sm">Parent</NavLink>

          <NavLink to="/leaders/students" className="text-sm">Student Leaderboard</NavLink>
          <NavLink to="/leaders/parents" className="text-sm">Parent Leaderboard</NavLink>
          <NavLink to="/leaders/schools" className="text-sm">School Leaderboard</NavLink>

          <NavLink to="/mentors" className="text-sm">Mentors</NavLink>
          <NavLink to="/tutors" className="text-sm">Tutors</NavLink>
          <NavLink to="/resources" className="text-sm">Resources</NavLink>
          <NavLink to="/bookmarks" className="text-sm">Bookmarks</NavLink>


          <NavLink to="/announcements" className="text-sm">Announcements</NavLink>
          <NavLink to="/assessment" className="text-sm">Assessment</NavLink>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

function Home() {
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-3">
      <h1 className="text-2xl font-bold">FuturePath App</h1>
      <p className="text-gray-700">
        Welcome. Use the navigation to explore dashboards, resources, and tools.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Dashboards */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />

        {/* Leaderboards */}
        <Route path="/leaders/students" element={<Leaderboard />} />
        <Route path="/leaders/parents" element={<ParentsLeaderboard />} />
        <Route path="/leaders/schools" element={<SchoolsLeaderboard />} />

        {/* Assessment */}
        <Route path="/assessment" element={<CareerAssessment />} />
        <Route path="/assessment/results" element={<AssessmentResults />} />

        {/* Mentors & Tutors */}
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/tutors" element={<TutorsPage />} />

        {/* Resources */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />


        {/* Announcements & Profile */}
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/profile" element={<UpdateProfileForm />} />

        {/* Optional 404: */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Layout>
  );
}
