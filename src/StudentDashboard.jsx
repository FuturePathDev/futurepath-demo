import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: "student123",
        name: "Jordan Taylor",
        grade: "",
        school: "",
        district: "",
        careerInterest: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/StudentProfile");
                const data = await response.json();
                setFormData({
                    id: data.id || "student123",
                    name: data.name || "Jordan Taylor",
                    grade: data.profile.grade || "",
                    school: data.profile.school || "",
                    district: data.profile.district || "",
                    careerInterest: (data.profile.careerInterest || []).join(", "),
                });
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            id: formData.id,
            name: formData.name,
            profile: {
                grade: formData.grade,
                school: formData.school,
                district: formData.district,
                careerInterest: formData.careerInterest.split(",").map(item => item.trim()),
            },
            dashboard: {
                nextStep: "Continue exploring career options",
                completedSteps: ["Create profile", "Update profile"],
            }
        };

        try {
            const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/StudentProfile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                alert("Profile updated successfully!");
                navigate("/");
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("An error occurred while updating your profile.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-4">Update Your Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Grade:</label>
                        <input
                            type="text"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="w-full p-2 rounded border"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">School:</label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            className="w-full p-2 rounded border"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">District:</label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full p-2 rounded border"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Career Interests (comma-separated):</label>
                        <input
                            type="text"
                            name="careerInterest"
                            value={formData.careerInterest}
                            onChange={handleChange}
                            className="w-full p-2 rounded border"
                        />
                    </div>
                    <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
