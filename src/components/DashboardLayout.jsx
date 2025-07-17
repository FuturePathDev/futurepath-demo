import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children, studentInfo }) => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 font-raleway">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-xl flex flex-col justify-between">
                <div>
                    <div className="p-6 text-blue-900 font-extrabold text-2xl border-b border-gray-200">
                        FuturePath
                    </div>
                    <nav className="mt-6 flex flex-col gap-4 px-4">
                        <Link
                            to="/"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/careers"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Careers
                        </Link>
                        <Link
                            to="/schools"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Schools
                        </Link>
                        <Link
                            to="/goals"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Goals
                        </Link>
                        <Link
                            to="/resources"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Resources
                        </Link>
                        <Link
                            to="/progress"
                            className="text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition"
                        >
                            Progress
                        </Link>
                    </nav>
                </div>
                <div className="p-4 text-xs text-gray-500">
                    © 2025 FuturePath. All rights reserved.
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex justify-end items-center bg-white shadow-md p-4">
                    <div className="text-right">
                        <div className="font-bold text-blue-900">{studentInfo.name}</div>
                        <div className="text-sm text-gray-600">{studentInfo.grade} • {studentInfo.school}</div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
