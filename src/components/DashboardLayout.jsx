import React from 'react';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ studentInfo, children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 p-8 font-raleway">
                <div className="flex justify-end mb-8">
                    <div className="text-right text-blue-900">
                        <p className="font-bold">{studentInfo.name}</p>
                        <p>{studentInfo.grade}</p>
                        <p>{studentInfo.school}</p>
                    </div>
                </div>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
