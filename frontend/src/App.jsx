import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdvocatePage from './pages/AdvocatePage';
import VictimPage from './pages/VictimPage';
import HomePage from './pages/HomePage';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Court Moderator Automations</h1>
        </header>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/advocate" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Advocate
          </NavLink>
          <NavLink to="/victim" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Victim
          </NavLink>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/advocate" element={<AdvocatePage />} />
            <Route path="/victim" element={<VictimPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2026 Court Moderator System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;