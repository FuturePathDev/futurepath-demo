import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
    { career: "Software Engineer", salary: 120000 },
    { career: "Data Scientist", salary: 115000 },
    { career: "Product Manager", salary: 110000 },
    { career: "UX Designer", salary: 95000 },
    { career: "Digital Marketer", salary: 85000 },
];

const CareerCharts = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Top Lucrative Careers</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="career" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="salary" fill="#1E3A8A" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default CareerCharts;
