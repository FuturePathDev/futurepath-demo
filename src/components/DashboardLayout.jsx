import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./DashboardLayout.css"; // optional if you want separate styling here

const DashboardLayout = () => {
    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
            <aside style={{ width: "220px", backgroundColor: "#0a2a66", color: "white", padding: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>FuturePath</h2>
                <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Link style={{ color: "white", textDecoration: "none" }} to="/">Dashboard</Link>
                    <Link style={{ color: "white", textDecoration: "none" }} to="/careers">Careers</Link>
                    <Link style={{ color: "white", textDecoration: "none" }} to="/schools">Schools</Link>
                    <Link style={{ color: "white", textDecoration: "none" }} to="/goals">Goals</Link>
                    <Link style={{ color: "white", textDecoration: "none" }} to="/progress">Progress</Link>
                </nav>
            </aside>

            <main style={{
                flexGrow: 1,
                padding: "40px",
                background: "linear-gradient(to right, #b3e5fc, #81d4fa)",
                display: "flex",
                flexDirection: "column"
            }}>
                <div style={{ alignSelf: "flex-end", textAlign: "right", marginBottom: "20px", color: "#0a2a66" }}>
                    <p>Jordan Taylor</p>
                    <p>10th Grade</p>
                    <p>Jefferson High School</p>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
