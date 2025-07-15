import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ student, children }) => {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">FuturePath</h2>
                <nav className="flex flex-col space-y-2">
                    <Link to="/" className="hover:underline">Dashboard</Link>
                    <Link to="/update-profile" className="hover:underline">Update Profile</Link>
                    <Link to="/career-charts" className="hover:underline">Career Charts</Link>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                <header className="flex justify-end mb-4">
                    <div className="text-right">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-500">Grade: {student.profile.grade}</p>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
