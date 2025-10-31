import React, { useState } from 'react';

export default function RegisterPage({ onRegister, onSwitchToLogin, error, isLoading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!username || !password || !confirmPassword) {
      setLocalError("Please fill out all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    onRegister(username, password);
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p>Sign up to start your musical journey.</p>
          <div className="input-group">
            <label htmlFor="new-username">Username</label>
            <input id="new-username" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Choose a username" />
          </div>
          <div className="input-group">
            <label htmlFor="new-password">Password</label>
            <input id="new-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Choose a password" />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm your password" />
          </div>
          <div className="error-message">{error || localError}</div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="button-loader-container"><div className="loader" /><span>Registering...</span></div> : 'Register'}
          </button>
          <p className="form-switcher">
            Already have an account? <span onClick={onSwitchToLogin}>Login here</span>
          </p>
        </form>
      </div>
    </>
  );
}
