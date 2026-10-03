import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppTheme } from '../services/projectState';
import { updateCredentials, verifyPin, logout } from '../services/authService';
import { X, Lock, Key, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { theme, isDark } = useAppTheme();
  const [pin, setPin] = useState('');
  const [userId, setUserId] = useState(''); // Need UserID to verify? Requirement says "secret pin aur new password user id dalne ka option ho"
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verifyPin(pin)) {
      setError('Invalid Secret PIN');
      return;
    }

    if (!userId.trim() || !newPassword.trim()) {
      setError('All fields are required');
      return;
    }

    // Success! Update password and logout
    updateCredentials(newPassword);
    logout();
    onSuccess();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: theme.cardBg,
          borderRadius: '20px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.textPrimary }}>
                Change Password
              </h3>
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                Requires Secret PIN verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: theme.innerBg,
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '6px' }}>
              Secret PIN
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '0 12px',
                gap: '8px',
              }}
            >
              <Lock size={16} color={theme.textSecondary} />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Secret PIN"
                required
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '6px' }}>
              User ID
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '0 12px',
                gap: '8px',
              }}
            >
              <Lock size={16} color={theme.textSecondary} />
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
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '6px' }}>
              New Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '0 12px',
                gap: '8px',
              }}
            >
              <Key size={16} color={theme.textSecondary} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                required
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '13px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '14px',
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
            <CheckCircle2 size={18} />
            <span>Update & Logout</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
