import React from 'react';

const careersData = [
    {
        title: 'Software Engineer',
        salary: '$110,000',
        growth: '22%',
        education: 'Bachelor’s Degree',
    },
    {
        title: 'Data Scientist',
        salary: '$120,000',
        growth: '31%',
        education: 'Bachelor’s or Master’s Degree',
    },
    {
        title: 'Healthcare Administrator',
        salary: '$99,000',
        growth: '28%',
        education: 'Bachelor’s Degree',
    },
    {
        title: 'Cybersecurity Analyst',
        salary: '$105,000',
        growth: '35%',
        education: 'Bachelor’s Degree',
    },
    {
        title: 'AI/ML Specialist',
        salary: '$130,000',
        growth: '40%',
        education: 'Master’s Degree Preferred',
    },
];

const Careers = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-10 font-raleway text-gray-800">
            <h1 className="text-4xl font-bold text-center mb-10 text-white">Lucrative Careers</h1>
            <div className="max-w-4xl mx-auto grid gap-6">
                {careersData.map((career, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
                    >
                        <h2 className="text-2xl font-semibold text-blue-900">{career.title}</h2>
                        <p className="mt-2 text-gray-700">💼 Median Salary: {career.salary}</p>
                        <p className="text-gray-700">📈 Projected Growth: {career.growth}</p>
                        <p className="text-gray-700">🎓 Education Required: {career.education}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Careers;

