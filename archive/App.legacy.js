import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AmplifyProvider, Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import SidebarLayout from "./components/SidebarLayout";
import Leaderboard from "./components/Leaderboard";
import Announcements from "./components/Announcements";

// Pages
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParentLeaderboard from "./components/ParentLeaderboard";
import SchoolLeaderboard from "./components/SchoolLeaderboard";

/**
 * App shell
 * - Authenticator gives you SignIn/SignUp out of the box
 * - After auth, we render a left sidebar layout and the app routes
 */
export default function App() {
  return (
    <AmplifyProvider>
      <Authenticator
        loginMechanisms={["email"]}
        signUpAttributes={["name"]}
        components={{
          Header() {
            return (
              <div style={{ padding: 16 }}>
                <h2 style={{ margin: 0 }}>FuturePath</h2>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Sign in to continue
                </div>
              </div>
            );
          },
        }}
      >
        {({ signOut, user }) => (
          <BrowserRouter>
            <SidebarLayout user={user} onSignOut={signOut}>
              <Routes>
                {/* Dashboards */}
                <Route path="/" element={<Navigate to="/student" replace />} />
                <Route path="/student" element={<StudentDashboard user={user} />} />
                <Route path="/parent" element={<ParentDashboard user={user} />} />
                <Route path="/admin" element={<AdminDashboard user={user} />} />

                {/* Data screens */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/leaderboard/parents" element={<ParentLeaderboard />} />
                <Route path="/leaderboard/schools" element={<SchoolLeaderboard />} />
                <Route path="/announcements" element={<Announcements />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/student" replace />} />
              </Routes>
            </SidebarLayout>
          </BrowserRouter>
        )}
      </Authenticator>
    </AmplifyProvider>
  );
}
