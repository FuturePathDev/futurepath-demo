import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children, student }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col p-4">
                <h1 className="text-xl font-bold mb-8">FuturePath</h1>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="hover:text-gray-300">Dashboard</Link>
                    <Link to="/update-profile" className="hover:text-gray-300">Update Profile</Link>
                    <Link to="/career-charts" className="hover:text-gray-300">Career Charts</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex justify-end items-center bg-white shadow p-4">
                    <div className="text-right">
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-gray-600">Grade: {student.profile.grade}</div>
                    </div>
                </header>
                <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
