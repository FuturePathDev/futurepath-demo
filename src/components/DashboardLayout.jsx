import React from "react";
import CareerCharts from "./CareerCharts";
import LucrativeCareersChart from "./LucrativeCareersChart";
import EsteemedSchoolsChart from "./EsteemedSchoolsChart";
import SuggestedGoalsChart from "./SuggestedGoalsChart";
import ProgressTracker from "./ProgressTracker";

const DashboardLayout = () => {
    return (
        <div>
            <div className="sidebar">
                <h2>Menu</h2>
                <ul>
                    <li>Dashboard</li>
                    <li>Career Charts</li>
                    <li>Schools</li>
                    <li>Goals</li>
                    <li>Progress</li>
                </ul>
            </div>
            <div className="content">
                <div className="top-right-info">
                    Jordan Taylor | 10th Grade | Jefferson High School
                </div>
                <h1>FuturePath Dashboard</h1>
                <CareerCharts />
                <LucrativeCareersChart />
                <EsteemedSchoolsChart />
                <SuggestedGoalsChart />
                <ProgressTracker />
            </div>
        </div>
    );
};

export default DashboardLayout;
