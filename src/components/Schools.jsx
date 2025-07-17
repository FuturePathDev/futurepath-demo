import React from 'react';

const schoolsData = [
    {
        name: 'Massachusetts Institute of Technology (MIT)',
        location: 'Cambridge, MA',
        specialty: 'Engineering & Computer Science',
    },
    {
        name: 'Stanford University',
        location: 'Stanford, CA',
        specialty: 'Entrepreneurship & Technology',
    },
    {
        name: 'Harvard University',
        location: 'Cambridge, MA',
        specialty: 'Law & Business',
    },
    {
        name: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        specialty: 'Engineering & Environmental Sciences',
    },
    {
        name: 'Georgia Institute of Technology',
        location: 'Atlanta, GA',
        specialty: 'STEM & Research',
    },
];

const Schools = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-10 font-raleway text-gray-800">
            <h1 className="text-4xl font-bold text-center mb-10 text-white">Esteemed Schools</h1>
            <div className="max-w-4xl mx-auto grid gap-6">
                {schoolsData.map((school, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
                    >
                        <h2 className="text-2xl font-semibold text-blue-900">{school.name}</h2>
                        <p className="mt-2 text-gray-700"> Location: {school.location}</p>
                        <p className="text-gray-700"> Specialty: {school.specialty}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schools;

