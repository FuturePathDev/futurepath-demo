import React from 'react';
import { Link } from 'react-router-dom';
import CareerCharts from './CareerCharts';
import ProgressTracker from './ProgressTracker';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
                <h2 className="text-2xl font-bold mb-6">FuturePath</h2>
                <nav className="flex flex-col space-y-4">
                    <Link to="/" className="hover:text-gray-300">Dashboard</Link>
                    <Link to="/update-profile" className="hover:text-gray-300">Update Profile</Link>
                    <Link to="/" className="hover:text-gray-300">Career Charts</Link>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 bg-gray-100 p-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                    <div className="text-right">
                        <p className="text-lg font-semibold">Jordan Taylor</p>
                        <p className="text-sm">Grade: 10th</p>
                        <p className="text-sm">School: Jefferson High School</p>
                    </div>
                </div>

                <CareerCharts />
                <ProgressTracker />
            </div>
        </div>
    );
};

export default DashboardLayout;
