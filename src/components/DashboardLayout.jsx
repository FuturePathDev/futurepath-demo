import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ studentInfo, children }) => {
    return (
        <div className="flex min-h-screen font-raleway">
            <Sidebar />
            <div className="flex-1 p-8 bg-gradient-to-r from-blue-100 to-teal-100">
                <div className="flex justify-end text-right text-blue-900 mb-6">
                    <div>
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
