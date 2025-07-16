import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Engineering", students: 400 },
    { name: "Healthcare", students: 300 },
    { name: "Technology", students: 500 },
    { name: "Finance", students: 200 },
];

const CareerCharts = () => (
    <div style={{ marginBottom: "2rem" }}>
        <h2>Career Interest by Field</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#001f3f" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default CareerCharts;
