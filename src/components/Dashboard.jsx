import React from 'react';
import Sidebar from './Sidebar';

const Dashboard = () => (
    <div className="flex">
        <Sidebar />
        <div className="dashboard-content">
            <h1>Welcome to Your Dashboard</h1>
            <p>This is your starting point for tracking your journey.</p>
        </div>
    </div>
);

export default Dashboard;

