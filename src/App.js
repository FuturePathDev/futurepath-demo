import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

const App = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch("arn:aws:apigateway:us-east-1::/apis/knntu7ft1l/routes/emx0yhp");
        const result = await response.json();

        if (response.ok) {
          setStudent(result); // Expecting your API to return full student object
        } else {
          throw new Error(result.error || "Failed to load profile");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/student/dashboard"
          element={
            loading ? (
              <div className="text-center p-10">Loading student profile...</div>
            ) : error ? (
              <div className="text-center p-10 text-red-600">Error: {error}</div>
            ) : (
              <StudentDashboard student={student} />
            )
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

