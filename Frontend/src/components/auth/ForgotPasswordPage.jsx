import React, { useState } from 'react';


export default function ForgotPasswordPage({ onResetRequest, onSwitchToLogin, error, info, isLoading }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      onResetRequest("");
      return;
    }
    onResetRequest(username);
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <p>Enter your username to request a reset token.</p>
          <div className="input-group">
            <label htmlFor="reset-username">Username</label>
            <input id="reset-username" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter your username" />
          </div>
          <div className="error-message">{error}</div>
          <div className="info-message">{info}</div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="button-loader-container"><div className="loader" /><span>Requesting...</span></div> : 'Request Reset Token'}
          </button>
          <p className="form-switcher">
            Remembered your password? <span onClick={onSwitchToLogin}>Login here</span>
          </p>
        </form>
      </div>
    </>
  );
}
