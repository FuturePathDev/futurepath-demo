import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

const data = [
  { name: "Engineering", value: 120000 },
  { name: "Medicine", value: 110000 },
  { name: "Law", value: 90000 },
  { name: "Technology", value: 130000 },
];

const ChartsPage = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Lucrative Careers</h1>
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
    <h2 className="text-xl font-semibold mt-8 mb-4">Career Trends Over Time</h2>
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#82ca9d" />
    </LineChart>
  </div>
);

export default ChartsPage;
