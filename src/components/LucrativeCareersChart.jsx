import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { career: "Software Engineer", salary: 120000 },
    { career: "Data Scientist", salary: 115000 },
    { career: "Cybersecurity Analyst", salary: 110000 },
    { career: "Product Manager", salary: 105000 },
];

const LucrativeCareersChart = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top Lucrative Careers</h2>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <XAxis dataKey="career" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="salary" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default LucrativeCareersChart;

