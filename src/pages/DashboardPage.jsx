import React from "react";
import { Link } from "react-router-dom";

function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Welcome to FuturePath</h1>
      <p className="mt-4">Select your dashboard below:</p>
      <div className="mt-6 space-x-4">
        <Link to="/student-dashboard" className="bg-blue-500 text-white px-4 py-2 rounded">
          Student Dashboard
        </Link>
        <Link to="/parent-dashboard" className="bg-green-500 text-white px-4 py-2 rounded">
          Parent Dashboard
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;
