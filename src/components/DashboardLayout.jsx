import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-6">
                <h2 className="text-xl font-bold mb-6 text-blue-900">FuturePath</h2>
                <nav className="space-y-4">
                    <Link to="/" className="block text-gray-700 hover:text-blue-500">Dashboard</Link>
                    <Link to="/update-profile" className="block text-gray-700 hover:text-blue-500">Update Profile</Link>
                    <Link to="#" className="block text-gray-700 hover:text-blue-500">Career Charts</Link>
                    <Link to="#" className="block text-gray-700 hover:text-blue-500">Progress Tracker</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">
                <header className="flex justify-end mb-6">
                    <div className="text-right">
                        <p className="font-semibold text-gray-800">Jordan Taylor</p>
                        <p className="text-sm text-gray-500">10th Grade, Jefferson High School</p>
                    </div>
                </header>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

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



