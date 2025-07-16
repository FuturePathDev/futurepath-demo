import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";
import CareerCharts from "./components/CareerCharts";
import DashboardLayout from "./components/DashboardLayout";

function App() {
    return (
        <Router>
            <DashboardLayout>
                <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/update-profile" element={<UpdateProfile />} />
                    <Route path="/career-charts" element={<CareerCharts />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DashboardLayout>
        </Router>
    );
}

export default App;
