import React from "react";
import CareerCharts from "./CareerCharts";
import ProgressTracker from "./ProgressTracker";
import EsteemedSchoolsChart from "./EsteemedSchoolsChart";
import LucrativeCareersChart from "./LucrativeCareersChart";
import SuggestedGoalsChart from "./SuggestedGoalsChart";

const DashboardLayout = () => {
    return (
        <div style={{ display: "flex", height: "100vh", background: "linear-gradient(to right, #a1c4fd, #c2e9fb)" }}>
            <aside className="sidebar">
                <h2>FuturePath</h2>
                <nav>
                    <a href="#" className="menu-item">Dashboard</a>
                    <a href="#" className="menu-item">Careers</a>
                    <a href="#" className="menu-item">Schools</a>
                    <a href="#" className="menu-item">Goals</a>
                    <a href="#" className="menu-item">Progress</a>
                </nav>
            </aside>
            <main className="main-content" style={{ flex: 1, padding: "20px" }}>
                <div className="student-info">
                    <p>Jordan Taylor</p>
                    <p>10th Grade</p>
                    <p>Jefferson High School</p>
                </div>
                <h1>Career Dashboard</h1>
                <CareerCharts />
                <EsteemedSchoolsChart />
                <SuggestedGoalsChart />
                <LucrativeCareersChart />
                <ProgressTracker />
            </main>
        </div>
    );
};

export default DashboardLayout;
