import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdvocatePage from './pages/AdvocatePage';
import VictimPage from './pages/VictimPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx';
import './index.css';

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell">
          <nav className="top-nav">
            <NavLink className="nav-brand" to="/">⚖ Court Hearing Records</NavLink>
            <NavigationLinks />
          </nav>

          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/advocate"
                  element={
                    <RequireAuth>
                      <AdvocatePage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/victim"
                  element={
                    <RequireAuth>
                      <VictimPage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="app-footer">
            High Court of Delhi &mdash; VC Hearing Registry &copy; 2026
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

const NavigationLinks = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Home
        </NavLink>
      </li>
      {isAuthenticated && (
        <>
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
        </>
      )}
      <li>
        {isAuthenticated ? (
          <button type="button" className="nav-link logout-btn" onClick={logout}>
            Logout {user?.username ? `(${user.username})` : ''}
          </button>
        ) : (
          <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
            Login
          </NavLink>
        )}
      </li>
    </ul>
  );
};

export default App;