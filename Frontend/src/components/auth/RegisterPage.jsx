import React, { useState } from 'react';
import './RegisterPage.css';

const RegisterPage = ({ onRegister, onSwitchToLogin, onSwitchToForgotPassword, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const getPasswordStrength = (password) => {
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10 && !/[A-Z]/.test(password)) return 'medium';
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!username.trim() || !password || !confirmPassword) {
      setLocalError('Please fill out all fields');
      return;
    }
    
    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (onRegister) {
      onRegister(username, password);
    } else {
      // Fallback for standalone usage
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Registration successful for:', username);
      } catch (error) {
        setLocalError('Registration failed. Please try again.');
      }
    }
  };

  const displayError = error || localError;
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">
          Create Account
        </h1>
        <p className="register-subtitle">
          Join us and start your amazing journey today
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="new-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="username"
              aria-label="Choose a username"
              minLength="3"
            />
          </div>
          
          <div className="input-group">
            <input
              id="new-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="new-password"
              aria-label="Choose a password"
              minLength="6"
            />
            {password && (
              <div className={`password-strength strength-${passwordStrength}`}>
                Password strength: {passwordStrength}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
              required
              autoComplete="new-password"
              aria-label="Confirm your password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            aria-label={isLoading ? 'Creating account...' : 'Create account'}
          >
            <span>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </span>
          </button>
          
          {displayError && (
            <p className="error" role="alert">
              {displayError}
            </p>
          )}
        </form>
        
        <div className="login-links">
          <p className="login-text">
            Already have an account?
          </p>
          <button 
            onClick={onSwitchToLogin}
            type="button"
            aria-label="Go to login page"
          >
            Sign In
          </button>
        </div>
        
        {onSwitchToForgotPassword && (
          <div className="login-links">
            <p className="login-text">
              Forgot your password?
            </p>
            <button 
              onClick={onSwitchToForgotPassword}
              type="button"
              aria-label="Go to forgot password page"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;