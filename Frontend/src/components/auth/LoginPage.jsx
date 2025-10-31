import React, { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister, onSwitchToForgot, error, info, isLoading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      onLogin("", "");
      return;
    }
    onLogin(username, password);
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome Back!</h2>
          <p>Log in to get your music recommendations.</p>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <div className="forgot-password-link">
            <span onClick={onSwitchToForgot}>Forgot Password?</span>
          </div>
          <div className="error-message">{error}</div>
          <div className="info-message">{info}</div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="button-loader-container"><div className="loader" /><span>Logging in...</span></div> : 'Login'}
          </button>
          <p className="form-switcher">
            Don't have an account? <span onClick={onSwitchToRegister}>Register here</span>
          </p>
        </form>
      </div>
    </>
  );
}
