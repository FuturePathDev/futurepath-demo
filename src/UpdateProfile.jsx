import React, { useState } from "react";
console.log("UpdateProfile component is loaded.");

const UpdateProfile = () => {
    const [formData, setFormData] = useState({
        grade: "",
        school: "",
        district: "",
        careerInterest: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form with data:", formData);

        try {
            const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/dev/StudentProfile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log("Profile updated successfully.");
                window.location.href = "/student-dashboard";
            } else {
                console.error("Failed to update profile:", await response.text());
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold">Update Your Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="grade"
                        placeholder="Grade"
                        value={formData.grade}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                    <input
                        type="text"
                        name="school"
                        placeholder="School"
                        value={formData.school}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                    <input
                        type="text"
                        name="district"
                        placeholder="District"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                    <input
                        type="text"
                        name="careerInterest"
                        placeholder="Career Interests (comma separated)"
                        value={formData.careerInterest}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                    <button
                        type="submit"
                        className="w-full bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
