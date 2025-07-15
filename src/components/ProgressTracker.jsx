import React from "react";

const ProgressTracker = ({ progress }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Progress Tracker</h2>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className="bg-teal-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{progress}% completed</p>
        </div>
    );
};

export default ProgressTracker;
