import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

<Link to="/update-profile">
    <button className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">
        Update Your Profile
    </button>
</Link>

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/dev/StudentProfile")
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched student data:", data);
                setStudent(data);
            });
    }, []);

    if (!student) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
                <h1 className="text-4xl font-bold text-center">Welcome, {student.name || "Student"}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-100 p-6 rounded-xl shadow">
                        <h2 className="font-semibold text-xl mb-4">Your Profile</h2>
                        <p><strong>Grade:</strong> {student.profile.grade || "Not set"}</p>
                        <p><strong>School:</strong> {student.profile.school || "Not set"}</p>
                        <p><strong>District:</strong> {student.profile.district || "Not set"}</p>
                        <p><strong>Career Interests:</strong> {student.profile.careerInterest?.join(", ") || "None yet"}</p>
                        <Link to="/update-profile">
                            <button className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">
                                Update Profile
                            </button>
                        </Link>
                    </div>

                    <div className="bg-green-100 p-6 rounded-xl shadow">
                        <h2 className="font-semibold text-xl mb-4">Dashboard Progress</h2>
                        <p><strong>Next Step:</strong> {student.dashboard.nextStep}</p>
                        <p className="mt-4"><strong>Completed Steps:</strong></p>
                        <ul className="list-disc list-inside ml-4">
                            {student.dashboard.completedSteps?.length > 0 ? (
                                student.dashboard.completedSteps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))
                            ) : (
                                <li>None yet</li>
                            )}
                        </ul>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">
                            Complete Career Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
