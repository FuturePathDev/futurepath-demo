import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Careers from './components/Careers';
import Goals from './components/Goals';
import Schools from './components/Schools';
import Resources from './components/Resources';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

