import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
    { goal: "Complete Career Assessment", progress: 80 },
    { goal: "Explore 5 Careers", progress: 60 },
    { goal: "Visit 3 Colleges", progress: 40 },
    { goal: "Apply for 5 Scholarships", progress: 20 },
];

const SuggestedGoalsChart = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Suggested Goals Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="goal" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1E3A8A" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default SuggestedGoalsChart;
