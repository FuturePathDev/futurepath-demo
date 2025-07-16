import React from "react";

const ProgressTracker = () => (
    <div style={{ marginBottom: "2rem" }}>
        <h2>Progress Tracker</h2>
        <p>50% Completed</p>
        <progress value="50" max="100"></progress>
    </div>
);

export default ProgressTracker;
