import React, { useState, useEffect } from 'react';
import { useAppTheme } from '../services/projectState';
import { login, setRememberMe, getRememberMe } from '../services/authService';
import { Lock, User, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { theme } = useAppTheme();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMeState] = useState(true); // default to true as per request "remeber be ka option ho tab tak checked ho"
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = getRememberMe();
    if (saved) {
      setUserId(saved.userId);
      setPassword(saved.pass);
      setRememberMeState(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(userId, password)) {
      setRememberMe(userId, password, rememberMe);
      onLoginSuccess();
    } else {
      setError('Invalid User ID or Password');
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: theme.cardBg,
          borderRadius: '24px',
          padding: '32px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#312e81',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: theme.textPrimary, marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            Please sign in to access your projects
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>
              User ID
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '0 14px',
                gap: '10px',
              }}
            >
              <User size={18} color={theme.textSecondary} />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                required
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  padding: '14px 0',
                  border: 'none',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '0 14px',
                gap: '10px',
              }}
            >
              <Key size={18} color={theme.textSecondary} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  padding: '14px 0',
                  border: 'none',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  color: theme.textSecondary,
                }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMeState(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="remember" style={{ fontSize: '13px', color: theme.textSecondary, cursor: 'pointer', userSelect: 'none' }}>
              Remember me
            </label>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: '12px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <CheckCircle2 size={20} />
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
};
