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

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Login failed."
      );
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        username,
        password,
      });

      setSuccess(response.data.message || "Account created successfully.");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <h1>{isRegistering ? "Register" : "Login"}</h1>
        <p>
          {isRegistering
            ? "Create a user account to access the court hearing registry."
            : "Sign in to access the court hearing registry."}
        </p>

        {error && <div className="msg-bar error">{error}</div>}
        {success && <div className="msg-bar success">{success}</div>}

        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="login-form"
          noValidate
        >
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {isRegistering ? "Create Account" : "Login"}
            </button>
          </div>
        </form>

        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            setSuccess("");
          }}
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
