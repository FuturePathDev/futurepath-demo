import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { career: "Software Engineer", salary: 120000 },
    { career: "Data Scientist", salary: 115000 },
    { career: "Nurse Practitioner", salary: 110000 },
    { career: "Product Manager", salary: 105000 },
    { career: "Financial Analyst", salary: 90000 },
];

const CareerCharts = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Top Lucrative Careers</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="career" type="category" />
                    <Tooltip />
                    <Bar dataKey="salary" fill="#14b8a6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CareerCharts;
