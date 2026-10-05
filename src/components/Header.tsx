import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Home } from 'lucide-react';
import { useAppTheme } from '../services/projectState';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction,
}) => {
  const navigate = useNavigate();
  const { isDark, theme, toggleTheme } = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.bg,
        minHeight: '56px',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showBack && (
          <button
            onClick={handleBack}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            title="Go Back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            color: theme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          title="Go Home"
        >
          <Home size={18} />
        </button>
        <h1
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: '-0.3px',
            marginLeft: '4px',
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
            color: isDark ? '#fde047' : '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {rightAction}
      </div>
    </header>
  );
};
