import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
    <div className="sidebar">
        <h1>FuturePath</h1>
        <Link to="/">Dashboard</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/schools">Schools</Link>
        <Link to="/resources">Resources</Link>
    </div>
);

export default Sidebar;
