import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gradient-to-b from-teal-400 to-blue-300 text-white h-screen fixed left-0 top-0 flex flex-col p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-6">FuturePath</h2>
            <nav className="flex flex-col space-y-2">
                <Link to="/" className="hover:underline">Dashboard</Link>
                <Link to="/careers" className="hover:underline">Careers</Link>
                <Link to="/goals" className="hover:underline">Goals</Link>
                <Link to="/schools" className="hover:underline">Schools</Link>
                <Link to="/resources" className="hover:underline">Resources</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
