import React from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const Schools = () => (
    <div className="flex">
        <Sidebar />
        <div className="dashboard-content">
            <h1>Schools Page</h1>
            <p>Find schools that align with your goals.</p>
            <Link to="/" className="button-link">Back to Dashboard</Link>
        </div>
    </div>
);

export default Schools;
