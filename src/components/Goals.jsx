import React from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const Goals = () => (
    <div className="flex">
        <Sidebar />
        <div className="dashboard-content">
            <h1>Goals Page</h1>
            <p>Set and review your goals here.</p>
            <Link to="/" className="button-link">Back to Dashboard</Link>
        </div>
    </div>
);

export default Goals;

