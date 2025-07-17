import React from "react";
import { Link, useLocation } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Careers", path: "/careers" },
        { name: "Goals", path: "/goals" },
        { name: "Schools", path: "/schools" },
        { name: "Resources", path: "/resources" },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 font-raleway">
            <aside className="w-64 bg-white shadow-lg p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">FuturePath</h1>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`block px-4 py-2 rounded-lg font-medium transition ${
                                location.pathname === item.path
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <div className="flex justify-end mb-6">
                    <div className="text-right text-gray-700">
                        <p className="font-semibold">Jordan Taylor</p>
                        <p>10th Grade</p>
                        <p>Jefferson High School</p>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
