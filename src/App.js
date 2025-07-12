import React, { useEffect, useState } from "react";
import StudentDashboard from "./StudentDashboard";
import { Auth } from "aws-amplify";

function App() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();

        const res = await fetch("https://your-api-id.execute-api.us-east-2.amazonaws.com/student/profile", {
          headers: {
            Authorization: token
          }
        });

        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    fetchStudentProfile();
  }, []);

  if (!student) return <div>Loading...</div>;

  return <StudentDashboard student={student} />;
}

export default App;
