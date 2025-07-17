import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-blue-900 text-white p-6 fixed left-0 top-0">
            <h2 className="text-3xl font-bold mb-10">FuturePath</h2>
            <nav className="flex flex-col space-y-4">
                <Link to="/" className="hover:text-blue-200 transition">Dashboard</Link>
                <Link to="/careers" className="hover:text-blue-200 transition">Careers</Link>
                <Link to="/goals" className="hover:text-blue-200 transition">Goals</Link>
                <Link to="/schools" className="hover:text-blue-200 transition">Schools</Link>
                <Link to="/resources" className="hover:text-blue-200 transition">Resources</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
