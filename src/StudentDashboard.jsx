import React, { useEffect, useState } from 'react';
import { getUserData } from '../api/userApi';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Replace 'Janet-Test-311' with dynamic userId once ready
        const data = await getUserData('Janet-Test-311');
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading user data...</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">User not found or API error.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-200 font-raleway text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 bg-blue-200 rounded-full mb-4 flex items-center justify-center text-4xl font-bold text-white">
            {user.name?.S?.charAt(0) || 'S'}
          </div>
          <h1 className="text-3xl font-semibold">{user.name?.S || 'Student'}</h1>
          <p className="text-lg text-gray-600">{user.email?.S || 'No email found'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold">School</h2>
            <p>{user.school?.S || 'N/A'}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold">Grade</h2>
            <p>{user.grade?.S || 'N/A'}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl shadow-sm col-span-full">
            <h2 className="text-lg font-semibold">Next Step</h2>
            <p>{user.dashboard?.M?.nextStep?.S || 'Not assigned yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
