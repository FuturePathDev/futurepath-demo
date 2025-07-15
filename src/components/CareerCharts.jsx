import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Software Engineer", salary: 120000 },
    { name: "Data Scientist", salary: 115000 },
    { name: "Product Manager", salary: 110000 },
    { name: "Cybersecurity Analyst", salary: 105000 },
    { name: "AI Specialist", salary: 130000 },
];

const CareerCharts = () => {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Lucrative Careers</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="salary" fill="#1E3A8A" /> {/* Dark Blue */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CareerCharts;
