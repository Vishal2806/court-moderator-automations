import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AdvocatePage from './pages/AdvocatePage';
import VictimPage from './pages/VictimPage';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Court Moderator Automations</h1>
        </header>
        <nav className="nav">
          <Link to="/advocate">Advocate</Link> | <Link to="/victim">Victim</Link>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/advocate" element={<AdvocatePage />} />
            <Route path="/victim" element={<VictimPage />} />
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