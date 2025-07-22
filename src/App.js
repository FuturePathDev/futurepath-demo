import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import ConfirmPage from "./pages/ConfirmPage";
import DashboardPage from "./pages/DashboardPage";
import StudentDashboard from "./StudentDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

