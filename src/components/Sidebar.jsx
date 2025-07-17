import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-8">FuturePath</h2>
            <nav className="space-y-4">
                <Link to="/" className="block hover:bg-blue-700 p-2 rounded">Dashboard</Link>
                <Link to="/careers" className="block hover:bg-blue-700 p-2 rounded">Careers</Link>
                <Link to="/goals" className="block hover:bg-blue-700 p-2 rounded">Goals</Link>
                <Link to="/schools" className="block hover:bg-blue-700 p-2 rounded">Schools</Link>
                <Link to="/resources" className="block hover:bg-blue-700 p-2 rounded">Resources</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
