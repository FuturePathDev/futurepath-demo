import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";

function App() {
    return (
        <Router>
            <DashboardLayout />
        </Router>
    );
}

export default App;
