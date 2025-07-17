import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import Careers from "./components/Careers";
import Schools from "./components/Schools";
import Goals from "./components/Goals";
import Progress from "./components/Progress";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/progress" element={<Progress />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
