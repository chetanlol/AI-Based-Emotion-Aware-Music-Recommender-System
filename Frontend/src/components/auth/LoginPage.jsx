import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({
  onLogin,
  onSwitchToRegister,
  onSwitchToForgot,
  error,
  info,
  isLoading,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password, rememberMe);
  };

  return (
    <div className="login-page">
      {/* Full screen floating bubbles */}
      <div className="bubble1"></div>
      <div className="bubble2"></div>
      <div className="bubble3"></div>
      <div className="bubble4"></div>
      <div className="bubble5"></div>
      <div className="bubble6"></div>
      <div className="bubble7"></div>
      <div className="bubble8"></div>
      <div className="bubble9"></div>
      <div className="bubble10"></div>
      <div className="bubble11"></div>
      <div className="bubble12"></div>
      <div className="bubble13"></div>
      <div className="bubble14"></div>
      <div className="bubble15"></div>
      
      <div className="login-card">
        <h2 className="login-title">Welcome Back 🎧</h2>
        <p className="login-subtitle">
          Experience music that understands your emotions
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="remember-me-container">
            <label className="remember-me-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="remember-me-text">Remember me</span>
            </label>
            <div className="forgot-password-link">
              <button type="button" onClick={onSwitchToForgot}>Forgot Password?</button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {info && <p className="info">{info}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? "loading" : ""}
          >
            <span>{isLoading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="login-links">
          <span className="signup-text">New here?</span>
          <button onClick={onSwitchToRegister}>Create Account</button>
        </div>
      </div>
    </div>
  );
}
