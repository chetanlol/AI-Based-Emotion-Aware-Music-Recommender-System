import React, { useState } from 'react';
import './ResetPasswordPage.css';

export default function ResetPasswordPage({ onResetSubmit, onSwitchToLogin, error, info, isLoading }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!newPassword || !confirmPassword) {
      setLocalError("Please fill out both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    onResetSubmit(newPassword);
  };

  const displayError = error || localError;

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h1 className="reset-password-title">
          Set New Password
        </h1>
        <p className="reset-password-subtitle">
          Please enter your new password to secure your account
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="new-password"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="new-password"
              aria-label="Enter new password"
              minLength="6"
            />
          </div>
          
          <div className="input-group">
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="new-password"
              aria-label="Confirm new password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            aria-label={isLoading ? 'Setting new password...' : 'Set new password'}
          >
            <span>
              {isLoading ? 'Setting Password...' : 'Set New Password'}
            </span>
          </button>
          
          {displayError && (
            <p className="error" role="alert">
              {displayError}
            </p>
          )}
          
          {info && (
            <p className="info" role="status">
              {info}
            </p>
          )}
        </form>
        
        <div className="login-links">
          <p className="login-text">
            Remember your password?
          </p>
          <button 
            onClick={onSwitchToLogin}
            type="button"
            aria-label="Go back to login page"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}