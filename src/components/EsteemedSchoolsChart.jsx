import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
    { school: "Harvard", rank: 1 },
    { school: "Stanford", rank: 2 },
    { school: "MIT", rank: 3 },
    { school: "UC Berkeley", rank: 4 },
    { school: "UCLA", rank: 5 },
];

const EsteemedSchoolsChart = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Esteemed Universities (Rank)</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis reversed />
                <Tooltip />
                <Bar dataKey="rank" fill="#1E3A8A" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default EsteemedSchoolsChart;
