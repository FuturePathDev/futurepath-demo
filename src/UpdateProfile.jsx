// src/UpdateProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileProvider } from './context/ProfileContext.jsx';
const UpdateProfile = () => {
  const navigate = useNavigate();

  // Use context email if available; otherwise fall back to demo/local
  let ctx = null;
  try {
    ctx = useProfile();
  } catch (_) {
    // context not mounted somewhere; fine—use fallback below
  }
  const contextEmail = ctx?.profile?.email;
  const fallbackEmail =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("demoEmail") || "student@example.com")) ||
    "student@example.com";
  const email = contextEmail || fallbackEmail;

  const [formData, setFormData] = useState({
    name: ctx?.profile?.name || "Jordan Taylor",
    grade: ctx?.profile?.grade || "",
    school: ctx?.profile?.school || "",
    district: ctx?.profile?.district || "",
    careerInterest: Array.isArray(ctx?.profile?.careerInterest)
      ? ctx.profile.careerInterest.join(", ")
      : "",
  });

  const [loading, setLoading] = useState(false);

  // Load existing profile from /user
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/user?email=${encodeURIComponent(email)}`);
        if (!res.ok) return;
        const json = await res.json();
        const p = json?.profile || {};
        if (!alive) return;
        setFormData({
          name: p.name || "Jordan Taylor",
          grade: p.grade || "",
          school: p.school || "",
          district: p.district || "",
          careerInterest: Array.isArray(p.careerInterest)
            ? p.careerInterest.join(", ")
            : "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email, // key used by /user table
      name: formData.name,
      grade: formData.grade,
      school: formData.school,
      district: formData.district,
      careerInterest: formData.careerInterest
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Update failed:", res.status, await res.text());
        alert("Failed to update profile.");
        setLoading(false);
        return;
      }

      // If ProfileContext is present, reflect the change immediately
      if (ctx?.saveProfile) {
        await ctx.saveProfile(payload);
      }

      alert("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Update failed:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
      <div className="max-w-xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Update Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
          </div>

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
            <label className="block text-gray-700">
              Career Interests (comma-separated):
            </label>
            <input
              type="text"
              name="careerInterest"
              value={formData.careerInterest}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UpdateProfile;
