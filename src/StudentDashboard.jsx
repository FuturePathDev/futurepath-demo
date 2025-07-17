import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import ProgressTracker from "./ProgressTracker";
import CareerCharts from "./CareerCharts";

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        // Mocking student data fetch
        const fetchData = async () => {
            const data = {
                name: "Jordan Taylor",
                grade: "10th",
                school: "Jefferson High School",
                district: "Salem-Keizer SD",
                careerInterest: ["Software Developer", "Data Analyst"],
            };
            setStudentData(data);
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-6 space-y-8">
                {studentData && (
                    <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Student Profile</h2>
                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                            <div>
                                <p className="font-semibold">Name:</p>
                                <p>{studentData.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Grade:</p>
                                <p>{studentData.grade}</p>
                            </div>
                            <div>
                                <p className="font-semibold">School:</p>
                                <p>{studentData.school}</p>
                            </div>
                            <div>
                                <p className="font-semibold">District:</p>
                                <p>{studentData.district}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="font-semibold">Career Interests:</p>
                                <p>{studentData.careerInterest.join(", ")}</p>
                            </div>
                        </div>
                    </div>
                )}

                <ProgressTracker />
                <CareerCharts />
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
