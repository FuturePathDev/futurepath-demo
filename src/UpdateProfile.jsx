import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
    const [grade, setGrade] = useState("");
    const [school, setSchool] = useState("");
    const [district, setDistrict] = useState("");
    const [careerInterest, setCareerInterest] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("https://knntu7ft1l.execute-api.us-east-1.amazonaws.com/StudentProfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: "student123",
                    grade,
                    school,
                    district,
                    careerInterest: [careerInterest],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                navigate("/");
            } else {
                alert("An error occurred while updating your profile.");
                console.error(data);
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-lg mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-4">Update Your Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-semibold">Grade</label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">School</label>
                        <input
                            type="text"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">District</label>
                        <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Career Interests (comma separated)</label>
                        <input
                            type="text"
                            value={careerInterest}
                            onChange={(e) => setCareerInterest(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Save
                    </button>
                </form>

                <button
                    onClick={() => window.location.href = "/"}
                    className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default UpdateProfile;

