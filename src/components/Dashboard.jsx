import React from "react";
import ProgressTracker from "./ProgressTracker";
import CareerCharts from "./CareerCharts";

const DashboardOverview = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <CareerCharts />
                    <ProgressTracker progress={65} />
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
