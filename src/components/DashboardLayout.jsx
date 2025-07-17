import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, studentInfo }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-200 to-teal-200 font-raleway">
            <Sidebar />
            <main className="flex-1 p-10">
                <div className="flex justify-end mb-8">
                    <div className="text-right">
                        <p className="font-bold text-blue-900">{studentInfo.name}</p>
                        <p className="text-blue-800">{studentInfo.grade}</p>
                        <p className="text-blue-800">{studentInfo.school}</p>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
