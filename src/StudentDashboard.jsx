import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/dev/student/profile");
                const data = await response.json();
                setStudent(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    if (!student || !student.name) {
        return <div className="p-8 text-center text-white font-raleway">Student profile not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-4">Welcome, {student.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                        <h2 className="font-semibold text-lg mb-2">Your Profile</h2>
                        <p><strong>Grade:</strong> {student.profile.grade || "Not set"}</p>
                        <p><strong>School:</strong> {student.profile.school || "Not set"}</p>
                        <p><strong>District:</strong> {student.profile.district || "Not set"}</p>
                        <p><strong>Career Interests:</strong> {student.profile.careerInterest?.join(", ") || "None yet"}</p>
                    </div>

                    <div className="bg-green-100 p-4 rounded-xl">
                        <h2 className="font-semibold text-lg mb-2">Dashboard Progress</h2>
                        <p><strong>Next Step:</strong> {student.dashboard.nextStep}</p>
                        <p><strong>Complete
