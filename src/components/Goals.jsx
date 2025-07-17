import React from 'react';

const Goals = () => {
    const goals = [
        "Complete Career Assessment",
        "Research Top 3 College Choices",
        "Attend 2 College Fairs This Year",
        "Join a Career-Focused Club or Program",
        "Schedule 1-on-1 Session with Mentor",
        "Draft a Scholarship Application Plan",
        "Volunteer in a Field Related to Your Career Interest",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-3xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Suggested Goals for Your Future</h1>
                <ul className="list-disc pl-5 space-y-4">
                    {goals.map((goal, index) => (
                        <li key={index} className="text-lg">{goal}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Goals;
