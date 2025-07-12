import React, { useEffect, useState } from "react";
import StudentDashboard from "./StudentDashboard";

const App = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch("https://your-api-id.execute-api.us-east-2.amazonaws.com/student/profile"); // Replace with your real API URL
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {student ? (
        <StudentDashboard student={student} />
      ) : (
        <div>Student profile not found.</div>
      )}
    </div>
  );
};

export default App;


