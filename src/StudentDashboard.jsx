import React from "react";
import LucrativeCareersChart from "./components/LucrativeCareersChart";
import EsteemedSchoolsChart from "./components/EsteemedSchoolsChart";
import SuggestedGoalsChart from "./components/SuggestedGoalsChart";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-5xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
                <h1 className="text-3xl font-bold">Student Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <LucrativeCareersChart />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <EsteemedSchoolsChart />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-xl">
                        <SuggestedGoalsChart />
                    </div>
                </div>

                <div className="mt-8">
                    <Link
                        to="/update-profile"
                        className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Update Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
