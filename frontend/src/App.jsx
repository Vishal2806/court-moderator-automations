import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdvocatePage from './pages/AdvocatePage';
import VictimPage from './pages/VictimPage';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="app-shell">
        <nav className="top-nav">
          <NavLink className="nav-brand" to="/">⚖ Court Hearing Records</NavLink>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/advocate" className={({ isActive }) => isActive ? 'active' : ''}>
                Advocates
              </NavLink>
            </li>
            <li>
              <NavLink to="/victim" className={({ isActive }) => isActive ? 'active' : ''}>
                Victims
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/advocate" element={<AdvocatePage />} />
              <Route path="/victim" element={<VictimPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>

        <footer className="app-footer">
          High Court of Delhi &mdash; VC Hearing Registry &copy; 2026
        </footer>
      </div>
    </Router>
  );
};

export default App;