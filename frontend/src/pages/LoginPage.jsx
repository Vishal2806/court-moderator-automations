import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthProvider.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/auth/register", { username, password });
      setSuccess("Account created successfully. You may now log in.");
      setIsRegistering(false);
      // Keep username pre-filled for convenience, but clear password
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
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

        <h2 className="login-heading">
          {isRegistering ? "Create Account" : "Sign In"}
        </h2>
        <p className="login-desc">
          {isRegistering
            ? "Register a new user account to access the registry."
            : "Enter your credentials to continue."}
        </p>

        {error && <div className="msg-bar error">{error}</div>}
        {success && <div className="msg-bar success">{success}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form" noValidate>
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
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
            />
          </div>
          <button type="submit" className="primary-btn login-submit" disabled={loading}>
            {loading ? "Please wait…" : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="login-switch">
          {isRegistering ? "Already have an account?" : "Need an account?"}
          {" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => { setIsRegistering(!isRegistering); setError(""); setSuccess(""); }}
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;