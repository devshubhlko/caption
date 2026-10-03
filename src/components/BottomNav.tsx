import React from 'react';
import { AlignLeft, Wand2, Music2 } from 'lucide-react';
import { useAppTheme } from '../services/projectState';

export type StudioTab = 'captions' | 'style' | 'audio';

interface BottomNavProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { isDark, theme } = useAppTheme();

  return (
    <nav
      style={{
        display: 'flex',
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
        padding: '6px 12px calc(6px + env(safe-area-inset-bottom, 0px))',
        zIndex: 40,
      }}
    >
      {/* Captions Tab */}
      <button
        onClick={() => onTabChange('captions')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 0',
          gap: '3px',
          borderRadius: '8px',
          backgroundColor:
            activeTab === 'captions'
              ? isDark
                ? 'rgba(99, 102, 241, 0.18)'
                : 'rgba(99, 102, 241, 0.12)'
              : 'transparent',
          color: activeTab === 'captions' ? '#6366f1' : theme.textSecondary,
          transition: 'all 0.2s ease',
        }}
      >
        <AlignLeft size={19} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: activeTab === 'captions' ? 700 : 500,
          }}
        >
          Captions
        </span>
      </button>

      {/* Style Tab */}
      <button
        onClick={() => onTabChange('style')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 0',
          gap: '3px',
          borderRadius: '8px',
          backgroundColor:
            activeTab === 'style'
              ? isDark
                ? 'rgba(99, 102, 241, 0.18)'
                : 'rgba(99, 102, 241, 0.12)'
              : 'transparent',
          color: activeTab === 'style' ? '#6366f1' : theme.textSecondary,
          transition: 'all 0.2s ease',
        }}
      >
        <Wand2 size={19} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: activeTab === 'style' ? 700 : 500,
          }}
        >
          Style
        </span>
      </button>

      {/* Audio Tab */}
      <button
        onClick={() => onTabChange('audio')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 0',
          gap: '3px',
          borderRadius: '8px',
          backgroundColor:
            activeTab === 'audio'
              ? isDark
                ? 'rgba(99, 102, 241, 0.18)'
                : 'rgba(99, 102, 241, 0.12)'
              : 'transparent',
          color: activeTab === 'audio' ? '#6366f1' : theme.textSecondary,
          transition: 'all 0.2s ease',
        }}
      >
        <Music2 size={19} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: activeTab === 'audio' ? 700 : 500,
          }}
        >
          Audio
        </span>
      </button>
    </nav>
  );
};
