import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-200 via-teal-200 to-blue-100 font-raleway">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">FuturePath</h2>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="text-blue-700 font-semibold hover:underline">
                        Dashboard
                    </Link>
                    <Link to="/update-profile" className="text-blue-700 font-semibold hover:underline">
                        Update Profile
                    </Link>
                    <Link to="/career-charts" className="text-blue-700 font-semibold hover:underline">
                        Career Charts
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Info Bar */}
                <header className="flex justify-end bg-white p-4 shadow-md">
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">Jordan Taylor</p>
                        <p className="text-sm text-gray-500">10th Grade</p>
                        <p className="text-sm text-gray-500">Jefferson High School</p>
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
