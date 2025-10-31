import React, { useState } from 'react';

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

  return (
    <>
      <div className="login-background"></div>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Set New Password</h2>
          <p>Please enter your new password.</p>
          <div className="input-group">
            <label htmlFor="new-password">New Password</label>
            <input id="new-password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          </div>
          <div className="error-message">{error || localError}</div>
          <div className="info-message">{info}</div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="button-loader-container"><div className="loader" /><span>Resetting...</span></div> : 'Set New Password'}
          </button>
          <p className="form-switcher">
            <span onClick={onSwitchToLogin}>Back to Login</span>
          </p>
        </form>
      </div>
    </>
  );
}
