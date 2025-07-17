import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-white shadow-lg p-6 flex flex-col space-y-4">
            <h2 className="text-2xl font-bold text-blue-900">FuturePath</h2>
            <nav className="flex flex-col space-y-4 mt-8">
                <Link to="/" className="text-blue-800 hover:underline">Dashboard</Link>
                <Link to="/careers" className="text-blue-800 hover:underline">Careers</Link>
                <Link to="/goals" className="text-blue-800 hover:underline">Goals</Link>
                <Link to="/schools" className="text-blue-800 hover:underline">Schools</Link>
                <Link to="/resources" className="text-blue-800 hover:underline">Resources</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
