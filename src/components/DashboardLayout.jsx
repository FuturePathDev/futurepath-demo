import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen font-raleway bg-gradient-to-r from-blue-300 to-teal-200 text-gray-800">
            <aside className="w-64 bg-white shadow-md flex flex-col p-6">
                <h2 className="text-2xl font-bold mb-8">FuturePath</h2>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="hover:text-blue-600">Dashboard</Link>
                    <Link to="/update-profile" className="hover:text-blue-600">Update Profile</Link>
                    <Link to="/career-charts" className="hover:text-blue-600">Career Charts</Link>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col p-10">
                <div className="flex justify-end mb-8 text-right">
                    <div>
                        <p className="font-semibold">Jordan Taylor</p>
                        <p>10th Grade</p>
                        <p>Jefferson High School</p>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
