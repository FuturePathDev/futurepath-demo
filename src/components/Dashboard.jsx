import React from "react";
import DashboardLayout from "./DashboardLayout";
import CareerCharts from "./CareerCharts";
import EsteemedSchoolsChart from "./EsteemedSchoolsChart";
import SuggestedGoalsChart from "./SuggestedGoalsChart";
import ProgressTracker from "./ProgressTracker";

const Dashboard = () => {
    const studentInfo = {
        name: "Jordan Taylor",
        grade: "10th Grade",
        school: "Jefferson High School",
    };

    return (
        <DashboardLayout studentInfo={studentInfo}>
            <h1 className="text-4xl font-bold text-blue-900 mb-8">Welcome to Your Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Lucrative Careers</h2>
                    <CareerCharts />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Esteemed Schools</h2>
                    <EsteemedSchoolsChart />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Suggested Goals</h2>
                    <SuggestedGoalsChart />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Your Progress</h2>
                    <ProgressTracker />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
