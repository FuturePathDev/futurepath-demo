import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { career: "Software Engineer", students: 120 },
    { career: "Data Scientist", students: 90 },
    { career: "Nurse", students: 80 },
    { career: "Electrician", students: 70 },
    { career: "Marketing Manager", students: 65 },
];

const CareerCharts = () => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Lucrative Careers of Interest</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="career" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#1E3A8A" /> {/* Dark Blue */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CareerCharts;
