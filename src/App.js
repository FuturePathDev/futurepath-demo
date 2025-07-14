import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="/update-profile" element={<UpdateProfile />} />
            </Routes>
        </Router>
    );
}

export default App;

