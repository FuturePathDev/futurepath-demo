import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100 font-raleway">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-teal-500 to-blue-700 text-white p-6 space-y-6">
                <div className="text-2xl font-bold">FuturePath</div>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="hover:bg-teal-600 p-2 rounded">Dashboard</Link>
                    <Link to="/update-profile" className="hover:bg-teal-600 p-2 rounded">Update Profile</Link>
                    <Link to="/charts" className="hover:bg-teal-600 p-2 rounded">Career Charts</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="flex justify-end items-center bg-white p-4 shadow-md">
                    <div className="text-sm text-gray-600">
                        <div>Jordan Taylor</div>
                        <div>10th Grade</div>
                        <div>Jefferson High School</div>
                    </div>
                </header>

                {/* Main Section */}
                <main className="p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;



