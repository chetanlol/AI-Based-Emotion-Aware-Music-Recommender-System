import React, { useState } from 'react';
import axios from 'axios';
import GlobalStyles from './components/GlobalStyles';
import FloatingEmojis from './components/FloatingEmojis';
import EmotionApp from './components/EmotionApp';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // central API URL (change to your backend)
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  const navigate = (view) => {
    setCurrentView(view);
    setAuthError('');
    setAuthInfo('');
  };

  const handleLogin = async (username, password) => {
    setAuthError('');
    setAuthInfo('');
    if (!username || !password) {
      setAuthError("Please enter a username and password.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      setUser({ userId: response.data.userId, username });
    } catch (error) {
      setAuthError(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username, password) => {
    setAuthError('');
    setAuthInfo('');
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/register`, { username, password });
      setAuthInfo('Registration successful! Please log in.');
      navigate('login');
    } catch (error) {
      setAuthError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (username) => {
    setAuthError('');
    setAuthInfo('');
    if (!username) {
      setAuthError("Please enter a username.");
      return;
    }
    setIsLoading(true);
    setAuthInfo('Requesting reset token...');
    try {
      const response = await axios.post(`${API_URL}/request-reset`, { username });
      setResetToken(response.data.reset_token);
      setAuthInfo("Reset token received! Please enter your new password.");
      navigate('reset');
    } catch (error) {
      setAuthInfo('');
      setAuthError(error.response?.data?.error || "Failed to request reset. If an account exists, a token would be sent.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    setAuthError('');
    setAuthInfo('');
    setIsLoading(true);
    setAuthInfo('Resetting password...');
    try {
      await axios.post(`${API_URL}/reset-password`, {
        token: resetToken,
        new_password: newPassword
      });
      setAuthInfo('Password reset successfully! Please log in.');
      setResetToken(null);
      navigate('login');
    } catch (error) {
      setAuthInfo('');
      setAuthError(error.response?.data?.error || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('login');
  };

  const renderContent = () => {
    if (user) {
      return <EmotionApp user={user} onLogout={handleLogout} apiUrl={API_URL} />;
    }

    switch (currentView) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => navigate('register')} onSwitchToForgot={() => navigate('forgot')} error={authError} info={authInfo} isLoading={isLoading} />;
      case 'register':
        return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => navigate('login')} error={authError} isLoading={isLoading} />;
      case 'forgot':
        return <ForgotPasswordPage onResetRequest={handleRequestReset} onSwitchToLogin={() => navigate('login')} error={authError} info={authInfo} isLoading={isLoading} />;
      case 'reset':
        return <ResetPasswordPage onResetSubmit={handleResetPassword} onSwitchToLogin={() => navigate('login')} error={authError} info={authInfo} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <GlobalStyles />
      {user && <FloatingEmojis />}   
      <div className="app">{renderContent()}</div>
    </div>
  );
}

export default App;
