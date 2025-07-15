import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Engineering', value: 120000 },
  { name: 'Medicine', value: 115000 },
  { name: 'Law', value: 105000 },
  { name: 'Tech', value: 130000 },
];

function CareerCharts() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lucrative Careers</h2>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default CareerCharts;
