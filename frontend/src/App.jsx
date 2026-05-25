import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import AdvocatePage from './pages/AdvocatePage';
import VictimPage from './pages/VictimPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { useAuth } from './auth/AuthContext.js';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import './index.css';

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
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/advocate"
                  element={
                    <ProtectedRoute>
                      <AdvocatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/victim"
                  element={
                    <ProtectedRoute>
                      <VictimPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="app-footer">
            High Court of Chhattisgarh &mdash; VC Hearing Registry &copy; 2026
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

const NavigationLinks = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <ul className="nav-links">
      <li>
        {isAuthenticated && (
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        )}
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
      {isAuthenticated ? (
        <li>
          <button type="button" className="nav-link logout-btn" onClick={logout}>
            Logout {user?.username ? `(${user.username})` : ''}
          </button>
        </li>
      ) : !isLoginPage ? (
        <li>
          <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
            Login
          </NavLink>
        </li>
      ) : null}
    </ul>
  );
};

export default App;
