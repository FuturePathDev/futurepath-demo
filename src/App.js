import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";
import CareerCharts from "./components/CareerCharts";
import DashboardLayout from "./components/DashboardLayout";

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <DashboardLayout>
                            <StudentDashboard />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/update-profile"
                    element={
                        <DashboardLayout>
                            <UpdateProfile />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/career-charts"
                    element={
                        <DashboardLayout>
                            <CareerCharts />
                        </DashboardLayout>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
