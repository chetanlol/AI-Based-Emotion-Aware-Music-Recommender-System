import React, { useState } from 'react';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = ({ onResetRequest, onSwitchToLogin, onSwitchToRegister, error, info, isLoading }) => {
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');
  const [localMessage, setLocalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    
    if (!username.trim()) {
      setLocalError('Please enter your username or email address');
      return;
    }

    if (onResetRequest) {
      onResetRequest(username);
    } else {
      // Fallback for standalone usage
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLocalMessage('If an account with that username exists, you will receive a password reset email shortly.');
        setUsername('');
      } catch (error) {
        setLocalError('An error occurred. Please try again later.');
      }
    }
  };

  const displayError = error || localError;
  const displayMessage = info || localMessage;

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">
          Reset Password
        </h1>
        <p className="forgot-password-subtitle">
          Enter your username or email address and we'll send you a link to reset your password
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="reset-username"
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="username email"
              aria-label="Username or Email Address"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            aria-label={isLoading ? 'Sending reset link...' : 'Send reset link'}
          >
            <span>
              {isLoading ? 'Requesting...' : 'Send Reset Link'}
            </span>
          </button>
          
          {displayError && (
            <p className="error" role="alert">
              {displayError}
            </p>
          )}
          
          {displayMessage && (
            <p className="info" role="alert">
              {displayMessage}
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
            Sign In
          </button>
        </div>
        
        {onSwitchToRegister && (
          <div className="login-links">
            <p className="login-text">
              Don't have an account?
            </p>
            <button 
              onClick={onSwitchToRegister}
              type="button"
              aria-label="Go to registration page"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;