import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/student/dashboard"
          element={
            <StudentDashboard
              student={{
                name: "Test Student",
                profile: {
                  grade: "11",
                  school: "FuturePath High",
                  district: "FuturePath District",
                  careerInterest: ["Engineering", "Design"],
                },
                dashboard: {
                  nextStep: "Complete Career Assessment",
                  completedSteps: ["Signed Up", "Set Goals"],
                },
              }}
            />
          }
        />
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center text-center p-10 bg-blue-100">
              <div>
                <h1 className="text-3xl font-bold text-blue-800">FuturePath App</h1>
                <p className="mt-4 text-blue-600">Welcome! Use the student dashboard route to begin.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

fetch("https://your-api-id.execute-api.us-east-2.amazonaws.com/student/profile")

