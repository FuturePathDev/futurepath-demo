import React from 'react';
import './App.css';
import logo from './assets/futurepath-logo.png';
function App() {
  return (
    <div>
      <header className="app-header">
        <img src={logo} alt="FuturePath Logo" className="logo" />
        <h1>Welcome to FuturePath</h1>
        <p>Your College & Career Planning Guide</p>
      </header>
    </div>
  );
}
export default App;
