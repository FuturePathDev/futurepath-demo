import React from "react";

const ProgressTracker = ({ progress }) => {
    const progressPercentage = progress || 50; // Example default

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{progressPercentage}% Complete</p>
        </div>
    );
};

export default ProgressTracker;
