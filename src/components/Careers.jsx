import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const careerData = [
    { career: "Software Engineer", salary: 120000 },
    { career: "Data Scientist", salary: 115000 },
    { career: "Cybersecurity Analyst", salary: 105000 },
    { career: "Project Manager", salary: 95000 },
    { career: "UX Designer", salary: 90000 },
];

const Careers = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 p-8 font-raleway">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-10">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Explore Lucrative Careers</h1>
                <p className="mb-8 text-gray-600">
                    These are some of the most in-demand and high-paying careers you may want to explore.
                    Consider how your skills and interests align with these fields.
                </p>

                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={careerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="career" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="salary" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Careers;
