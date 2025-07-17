import React from "react";

const Resources = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 p-8 font-raleway">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-10">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Educational Resources</h1>
                <p className="mb-8 text-gray-600">
                    Access trusted tools and programs to help guide your educational and career journey.
                </p>

                <div className="space-y-8">
                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Scholarships & Grants</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Fastweb</li>
                            <li>Scholarships.com</li>
                            <li>College Board Scholarship Search</li>
                            <li>UNCF Scholarships</li>
                            <li>Thurgood Marshall College Fund</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Internships & Programs</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>LinkedIn Internships</li>
                            <li>Handshake</li>
                            <li>INROADS</li>
                            <li>Google STEP & Engineering Practicum</li>
                            <li>Microsoft LEAP Program</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Mentorship Programs</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Big Brothers Big Sisters</li>
                            <li>College Mentoring Network</li>
                            <li>Girls Who Code Mentorship</li>
                            <li>iMentor</li>
                            <li>America Needs You (ANY)</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Financial Aid Resources</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>FAFSA: Free Application for Federal Student Aid</li>
                            <li>Federal Student Aid (studentaid.gov)</li>
                            <li>CSS Profile (College Board)</li>
                            <li>California Student Aid Commission (CSAC)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
