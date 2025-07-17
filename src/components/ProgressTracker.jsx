import React from "react";

const progressData = [
    { task: "Create Profile", progress: 100 },
    { task: "Complete Career Assessment", progress: 80 },
    { task: "Explore Career Options", progress: 60 },
    { task: "Attend 2 Workshops", progress: 50 },
    { task: "Submit 5 Scholarship Applications", progress: 30 },
];

const ProgressTracker = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Your Progress Tracker</h2>
        <div className="space-y-4">
            {progressData.map((item, index) => (
                <div key={index}>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-700 font-medium">{item.task}</span>
                        <span className="text-sm text-gray-500">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                                width: `${item.progress}%`,
                                background: `linear-gradient(90deg, #1E3A8A, #3B82F6)`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ProgressTracker;
