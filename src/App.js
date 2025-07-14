import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="/update-profile" element={<UpdateProfile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
