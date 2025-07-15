import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";
import CareerCharts from "./components/CareerCharts";

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
            </Routes>
        </Router>
    );
}

export default App;
