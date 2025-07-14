import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/student/profile");
                const data = await response.json();
                setStudent(data);
            } catch (error) {
                console.error("Error fetching student profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentProfile();
    }, []);

    if (loading) {
        return <div className="p-8 font-raleway text-white">Loading...</div>;
    }

    if (!student || !student.profile) {
        return <div className="p-8 font-raleway text-white">Student profile not found.</div>;
    }

    const { name, profile, dashboard } = student;

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-4">Welcome, {name || "Student"}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                        <h2 className="font-semibold text-lg mb-2">Your Profile</h2>
                        <p><strong>Grade:</strong> {profile.grade || "Not set"}</p>
                        <p><strong>School:</strong> {profile.school || "Not set"}</p>
                        <p><strong>District:</strong> {profile.district || "Not set"}</p>
                        <p><strong>Career Interests:</strong> {profile.careerInterest?.join(", ") || "None yet"}</p>
                    </div>

                    <div className="bg-green-100 p-4 rounded-xl">
                        <h2 className="font-semibold text-lg mb-2">Dashboard Progress</h2>
                        <p><strong>Next Step:</strong> {dashboard.nextStep}</p>
                        <p><strong>Completed Steps:</strong></p>
                        <ul className="list-disc list-inside">
                            {dashboard.completedSteps?.length > 0 ? (
                                dashboard.completedSteps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))
                            ) : (
                                <li>None yet</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="mt-6">
                    <Link to="/update-profile">
                        <button className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition">
                            Update Profile
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
