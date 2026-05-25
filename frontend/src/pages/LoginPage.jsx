import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Emblem / branding */}
        <div className="login-emblem">⚖</div>
        <h1 className="login-title">Court Hearing Records</h1>
        <p className="login-subtitle">High Court of Chhattisgarh &mdash; VC Hearing Registry</p>

        <div className="login-divider" />

        <h2 className="login-heading">Login</h2>
        <p className="login-desc">
          Enter your assigned credentials to continue.
        </p>

        {error && <div className="msg-bar error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="field">
            <label>Username <span className="req">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="primary-btn login-submit" disabled={loading}>
            {loading ? "Please wait…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
