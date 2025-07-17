import React from "react";

const Progress = () => {
    return (
        <div className="p-8 text-gray-800">
            <h1 className="text-3xl font-bold mb-4">Progress Tracker</h1>
            <p className="mb-4">Your current progress towards achieving your goals:</p>
            <ul className="list-disc list-inside">
                <li>Profile Completion: 90%</li>
                <li>Career Assessment: Completed</li>
                <li>Educational Goals Set: In Progress</li>
                <li>Scholarship Research: Planned</li>
            </ul>
        </div>
    );
};

export default Progress;

