import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route
          path="*"
          element={
            <div className="p-8 text-center text-gray-800">
              <h1 className="text-3xl font-bold">FuturePath App</h1>
              <p className="mt-4">Welcome! Use the student dashboard route to begin.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

