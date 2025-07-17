import React from "react";

const Schools = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 p-8 font-raleway">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-10">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Top Schools & Programs</h1>
                <p className="mb-8 text-gray-600">
                    Explore some of the most esteemed colleges, universities, and trade programs to help guide your educational journey.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Top Universities</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Harvard University</li>
                            <li>Stanford University</li>
                            <li>Massachusetts Institute of Technology (MIT)</li>
                            <li>University of California, Berkeley</li>
                            <li>University of California, Los Angeles (UCLA)</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Top HBCUs</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Howard University</li>
                            <li>Spelman College</li>
                            <li>Morehouse College</li>
                            <li>Florida A&M University</li>
                            <li>North Carolina A&T State University</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Leading Trade Schools</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Universal Technical Institute (UTI)</li>
                            <li>Lincoln Tech</li>
                            <li>Los Angeles Trade Technical College (LATTC)</li>
                            <li>Southern Careers Institute (SCI)</li>
                            <li>Pittsburgh Institute of Aeronautics</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">California Colleges</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>University of Southern California (USC)</li>
                            <li>California Institute of Technology (Caltech)</li>
                            <li>UC San Diego</li>
                            <li>UC Irvine</li>
                            <li>California Polytechnic State University (Cal Poly)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schools;
