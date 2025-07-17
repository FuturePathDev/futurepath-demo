import React from "react";

const Schools = () => {
    return (
        <div className="p-8 text-gray-800">
            <h1 className="text-3xl font-bold mb-4">Esteemed Schools</h1>
            <p className="mb-4">A list of top educational institutions where you can pursue your academic goals:</p>
            <ul className="list-disc list-inside">
                <li>Massachusetts Institute of Technology (MIT)</li>
                <li>Stanford University</li>
                <li>Harvard University</li>
                <li>California Institute of Technology (Caltech)</li>
                <li>University of California, Berkeley</li>
            </ul>
        </div>
    );
};

export default Schools;

