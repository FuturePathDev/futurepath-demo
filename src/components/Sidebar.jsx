import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-blue-900 text-white fixed top-0 left-0 flex flex-col">
            <h2 className="text-2xl font-bold p-6">FuturePath</h2>
            <nav className="flex flex-col p-6 space-y-4">
                <Link to="/" className="hover:text-blue-300">Dashboard</Link>
                <Link to="/careers" className="hover:text-blue-300">Careers</Link>
                <Link to="/goals" className="hover:text-blue-300">Goals</Link>
                <Link to="/schools" className="hover:text-blue-300">Schools</Link>
                <Link to="/resources" className="hover:text-blue-300">Resources</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
