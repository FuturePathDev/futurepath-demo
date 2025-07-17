import React from "react";

const Progress = () => {
    const progressPercentage = 60; // Example: 60% progress completed

    const milestones = [
        "Create Profile",
        "Complete Career Assessment",
        "Explore Careers",
        "Select School",
        "Prepare Financial Aid Plan",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 p-8 font-raleway">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-10">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Your Progress</h1>
                <p className="mb-8 text-gray-600">
                    Track your journey from exploration to enrollment. Keep going—you’re doing great!
                </p>

                <div className="mb-8">
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-700 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 text-right">{progressPercentage}% Complete</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {milestones.map((step, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg ${
                                index < progressPercentage / 20
                                    ? "bg-blue-100 border-l-4 border-blue-700"
                                    : "bg-gray-100 border-l-4 border-gray-300"
                            }`}
                        >
                            <h2 className="font-semibold text-blue-700">{step}</h2>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Progress;
