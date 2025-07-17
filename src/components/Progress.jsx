import React from 'react';

const Progress = () => {
    const progressData = [
        { milestone: "Create Profile", status: "Completed" },
        { milestone: "Choose Avatar", status: "Completed" },
        { milestone: "Set Grade Level", status: "Completed" },
        { milestone: "Complete Career Assessment", status: "In Progress" },
        { milestone: "Research Colleges", status: "Pending" },
        { milestone: "Plan Financial Aid", status: "Pending" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-3xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Progress Tracker</h1>
                <ul className="space-y-4">
                    {progressData.map((item, index) => (
                        <li key={index} className="flex justify-between p-4 bg-gray-100 rounded-lg shadow">
                            <span className="font-semibold">{item.milestone}</span>
                            <span className={`font-semibold ${item.status === "Completed" ? "text-green-500" : item.status === "In Progress" ? "text-yellow-500" : "text-gray-500"}`}>
                                {item.status}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Progress;
