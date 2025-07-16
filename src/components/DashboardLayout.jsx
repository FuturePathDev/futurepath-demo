import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen font-raleway bg-gradient-to-r from-teal-400 to-blue-300 text-gray-800">
            <aside className="w-64 bg-white shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">FuturePath</h2>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="hover:underline">Dashboard</Link>
                    <Link to="/update-profile" className="hover:underline">Update Profile</Link>
                    <Link to="/career-charts" className="hover:underline">Career Charts</Link>
                </nav>
            </aside>
            <main className="flex-1 p-10">
                <div className="flex justify-end mb-4">
                    <div className="text-right">
                        <p className="font-bold">Jordan Taylor</p>
                        <p>10th Grade</p>
                        <p>Jefferson High School</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
