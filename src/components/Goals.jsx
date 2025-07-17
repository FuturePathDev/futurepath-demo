import React from "react";

const Goals = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-blue-200 p-8 font-raleway">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-10">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Suggested Academic & Career Goals</h1>
                <p className="mb-8 text-gray-600">
                    Setting clear goals can help you stay on track and motivated. Here are some recommended goals for students pursuing competitive careers:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Academic Goals</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Maintain a GPA of 3.5 or higher</li>
                            <li>Complete AP or Honors courses in core subjects</li>
                            <li>Score above 1200 on SAT or 24 on ACT</li>
                            <li>Build strong relationships with teachers for recommendations</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Career Preparation Goals</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Complete 100+ volunteer hours</li>
                            <li>Secure 2-3 internships in desired field</li>
                            <li>Attend 5+ college or industry workshops annually</li>
                            <li>Develop a professional LinkedIn profile</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Extracurricular Goals</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Join 2-3 clubs or organizations aligned with career interests</li>
                            <li>Take on leadership roles within school or community</li>
                            <li>Participate in competitions related to career path</li>
                            <li>Develop a unique project or portfolio</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-blue-700 mb-2">Personal Growth Goals</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Practice time management and organization daily</li>
                            <li>Read 12+ books per year related to personal growth or career field</li>
                            <li>Seek mentorship from professionals in desired industry</li>
                            <li>Set short-term and long-term SMART goals annually</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Goals;
