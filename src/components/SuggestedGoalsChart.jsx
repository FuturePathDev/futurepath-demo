import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { step: "Explore Careers", progress: 20 },
    { step: "Set Academic Goals", progress: 40 },
    { step: "Extracurriculars", progress: 60 },
    { step: "Financial Planning", progress: 80 },
    { step: "College Apps", progress: 100 },
];

const SuggestedGoalsChart = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Suggested Goals</h2>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default SuggestedGoalsChart;

