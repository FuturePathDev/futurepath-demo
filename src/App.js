import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import UpdateProfile from "./UpdateProfile";
import CareerCharts from "./components/CareerCharts";
import DashboardLayout from "./components/DashboardLayout";

const student = {
    name: "Jordan Taylor",
    profile: {
        grade: "10th",
        school: "Jefferson High School",
        district: "Salem-Keizer SD",
        careerInterest: ["Software Developer", "Data Analyst"]
    }
};

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <DashboardLayout student={student}>
                            <StudentDashboard />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/update-profile"
                    element={
                        <DashboardLayout student={student}>
                            <UpdateProfile />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/career-charts"
                    element={
                        <DashboardLayout student={student}>
                            <CareerCharts />
                        </DashboardLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

