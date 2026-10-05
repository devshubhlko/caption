import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Check, Search, Zap } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { ANIMATION_EFFECTS, CaptionAnimationEffect } from '../services/captionPresetService';

interface AnimationEffectsModalProps {
  isOpen: boolean;
  activeAnimation: string[];
  onSelectAnimation: (animIds: string[]) => void;
  onClose: () => void;
  currentSubtitleText?: string;
}

export const AnimationEffectsModal: React.FC<AnimationEffectsModalProps> = ({
  isOpen,
  activeAnimation,
  onSelectAnimation,
  onClose,
  currentSubtitleText,
}) => {
  const { isDark, theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;



  const filteredAnimations = ANIMATION_EFFECTS.filter((anim) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        anim.name.toLowerCase().includes(q) ||
        anim.description.toLowerCase().includes(q) ||
        anim.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const previewSnippet = currentSubtitleText && currentSubtitleText.trim()
    ? currentSubtitleText.length > 20
      ? currentSubtitleText.slice(0, 20) + '...'
      : currentSubtitleText
    : 'Viral Captions 🔥';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          borderRadius: '16px',
          padding: '20px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                Animation Effects (20 Pro)
              </h3>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '2px 0 0' }}>
                Select kinetic typography, typewriter, or dynamic viral animations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: theme.innerBg,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.innerBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '10px',
            padding: '0 12px',
            marginBottom: '12px',
          }}
        >
          <Search size={16} color={theme.textSecondary} style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search 20 animations (e.g. Typewriter, Hormozi, Wave, Glitch)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '10px 0',
              color: theme.textPrimary,
              fontSize: '13px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>



        {/* Scrollable Grid of 35+ Animation Cards */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
            paddingRight: '4px',
            paddingBottom: '8px',
          }}
        >
          {filteredAnimations.map((anim) => {
            const isSelected = activeAnimation.includes(anim.id);
            const animClass = anim.id !== 'none' ? `caption-anim-${anim.id}` : '';

            return (
              <div
                key={anim.id}
                onClick={() => {
                  if (anim.id === 'none') {
                    onSelectAnimation(['none']);
                  } else {
                    let newAnims = activeAnimation.filter(a => a !== 'none');
                    if (newAnims.includes(anim.id)) {
                      newAnims = newAnims.filter(a => a !== anim.id);
                      if (newAnims.length === 0) newAnims = ['none'];
                    } else {
                      if (newAnims.length >= 3) {
                        newAnims.shift();
                      }
                      newAnims.push(anim.id);
                    }
                    onSelectAnimation(newAnims);
                  }
                }}
                style={{
                  borderRadius: '12px',
                  padding: '12px',
                  border: `1.5px solid ${isSelected ? '#6366f1' : theme.border}`,
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(99, 102, 241, 0.22)'
                      : '#eef2ff'
                    : theme.innerBg,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.35)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '15px' }}>{anim.icon}</span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isSelected ? '#818cf8' : theme.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {anim.name}
                    </span>
                  </div>
                  {isSelected && <Check size={14} color="#6366f1" />}
                </div>

                {/* Live Animation Preview Box */}
                <div
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#090d16' : '#ffffff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '6px 8px',
                  }}
                >
                  <span
                    className={animClass}
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isSelected ? '#818cf8' : (isDark ? '#f8fafc' : '#0f172a'),
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {previewSnippet}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
            paddingTop: '12px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: theme.textSecondary }}>
            {filteredAnimations.length} effects available
          </span>

          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
