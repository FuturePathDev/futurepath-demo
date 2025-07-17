import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Careers from './components/Careers';
import Schools from './components/Schools';
import Goals from './components/Goals';
import Resources from './components/Resources';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DashboardLayout />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
