import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import CareerCharts from "./components/CareerCharts";
import UpdateProfile from "./UpdateProfile";

const student = {
    name: "Jordan Taylor",
    profile: {
        grade: "10th",
    },
};

function App() {
    return (
        <Router>
            <DashboardLayout student={student}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/career-charts" element={<CareerCharts />} />
                    <Route path="/update-profile" element={<UpdateProfile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DashboardLayout>
        </Router>
    );
}

export default App;

