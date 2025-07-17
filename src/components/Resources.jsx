import React from 'react';

const Resources = () => {
    const resources = [
        { title: "FAFSA Application", link: "https://studentaid.gov/h/apply-for-aid/fafsa" },
        { title: "Scholarship Search Tool", link: "https://www.fastweb.com/" },
        { title: "CareerOneStop", link: "https://www.careeronestop.org/" },
        { title: "College Board - Big Future", link: "https://bigfuture.collegeboard.org/" },
        { title: "Trade Schools Directory", link: "https://www.trade-schools.net/" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-300 p-8 font-raleway text-white">
            <div className="max-w-3xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Helpful Resources</h1>
                <ul className="space-y-4">
                    {resources.map((resource, index) => (
                        <li key={index} className="p-4 bg-gray-100 rounded-lg shadow">
                            <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                {resource.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Resources;
