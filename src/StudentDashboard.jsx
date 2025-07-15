import React from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    const student = {
        name: "Jordan Taylor",
        profile: {
            grade: "10th",
            school: "Jefferson High School",
            district: "Salem-Keizer SD",
            careerInterest: ["Software Developer", "Data Analyst"]
        },
        dashboard: {
            nextStep: "Complete career assessment",
            completedSteps: ["Create profile", "Choose avatar", "Set grade level"]
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-white to-gray-100 p-8 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Welcome, {student.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
                        <p><strong>Grade:</strong> {student.profile.grade}</p>
                        <p><strong>School:</strong> {student.profile.school}</p>
                        <p><strong>District:</strong> {student.profile.district}</p>
                        <p><strong>Career Interests:</strong> {student.profile.careerInterest.join(", ")}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-2">Progress Tracker</h2>
                        <p><strong>Next Step:</strong> {student.dashboard.nextStep}</p>
                        <ul className="list-disc pl-5">
                            {student.dashboard.completedSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>
                        <Link to="/update-profile" className="bg-teal-500 text-white px-4 py-2 rounded text-center hover:bg-teal-600 transition">
                            Update Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
