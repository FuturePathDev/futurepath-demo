import React from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const Careers = () => (
    <div className="flex">
        <Sidebar />
        <div className="dashboard-content">
            <h1>Careers Page</h1>
            <p>Explore various career options and opportunities.</p>
            <Link to="/" className="button-link">Back to Dashboard</Link>
        </div>
    </div>
);

export default Careers;
