import React from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const Resources = () => (
    <div className="flex">
        <Sidebar />
        <div className="dashboard-content">
            <h1>Resources Page</h1>
            <p>Access useful resources for your journey.</p>
            <Link to="/" className="button-link">Back to Dashboard</Link>
        </div>
    </div>
);

export default Resources;
