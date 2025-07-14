import React, { useState } from "react";

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Updated Profile Data:", formData);
        // Later: send this to DynamoDB through API
        alert("Profile updated successfully!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold">Update Your Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="grade" placeholder="Grade" value={formData.grade} onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border" />
                    <input type="text" name="school" placeholder="School" value={formData.school} onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border" />
                    <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border" />
                    <input type="text" name="careerInterest" placeholder="Career Interests (comma separated)" value={formData.careerInterest} onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border" />
                    <button type="submit" className="w-full bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
