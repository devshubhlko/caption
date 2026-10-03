import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Type, Search, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  GoogleFontItem,
  useLiveGoogleFonts,
  loadGoogleFont,
} from '../services/fontService';

interface GoogleFontModalProps {
  isOpen: boolean;
  activeFont: string;
  onSelectFont: (fontFamily: string) => void;
  onClose: () => void;
  currentSubtitleText?: string;
}

export const GoogleFontModal: React.FC<GoogleFontModalProps> = ({
  isOpen,
  activeFont,
  onSelectFont,
  onClose,
  currentSubtitleText,
}) => {
  const { isDark, theme } = useAppTheme();
  const { hindiFonts, englishFonts, isLoading } = useLiveGoogleFonts();
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [searchQuery, setSearchQuery] = useState('');

  // Active font source based on tab
  const currentList = selectedLanguage === 'hi' ? hindiFonts : englishFonts;

  // Filtered fonts with instant search across all live fonts
  const filteredFonts = useMemo(() => {
    if (!searchQuery.trim()) return currentList;

    const query = searchQuery.toLowerCase().trim();
    return currentList.filter((font) => {
      const matchesName = font.family.toLowerCase().includes(query);
      const matchesStyle = font.styleName ? font.styleName.toLowerCase().includes(query) : false;
      const matchesCategory = font.category ? font.category.toLowerCase().includes(query) : false;
      return matchesName || matchesStyle || matchesCategory;
    });
  }, [currentList, searchQuery]);

  // Lazy load visible fonts in DOM
  useEffect(() => {
    if (isOpen && filteredFonts.length > 0) {
      // Preload the first 30 visible fonts immediately
      const initialBatch = filteredFonts.slice(0, 30);
      initialBatch.forEach((font) => {
        loadGoogleFont(font.family);
      });
    }
  }, [isOpen, filteredFonts]);

  if (!isOpen) return null;

  const handleSelect = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onSelectFont(fontFamily);
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
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
          maxWidth: '660px',
          height: '88vh',
          maxHeight: '780px',
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
            marginBottom: '12px',
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
              <Type size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                  Live Google Fonts Directory
                </h3>
                {isLoading ? (
                  <span
                    style={{
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#818cf8',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    <Loader2 size={11} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Live Fetching...
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#22c55e',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    ● Live API Connected ({hindiFonts.length + englishFonts.length} Fonts)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '2px 0 0' }}>
                Browse all live Google Fonts directly with live CDN sync
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

        {/* Live Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.innerBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '10px',
            padding: '0 12px',
            marginBottom: '10px',
          }}
        >
          <Search size={16} color={theme.textSecondary} style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search any Google Font (e.g. Poppins, Kalam, Anton, Bebas, Roboto, Noto)..."
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

        {/* Custom Font Quick Loader */}
        {searchQuery.trim().length > 1 && !filteredFonts.some((f) => f.family.toLowerCase() === searchQuery.toLowerCase().trim()) && (
          <div
            onClick={() => handleSelect(searchQuery.trim())}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1.5px dashed #6366f1',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            <span>+ Load Live Google Font: "{searchQuery.trim()}"</span>
            <span style={{ fontSize: '11px', backgroundColor: '#6366f1', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>
              Load Live
            </span>
          </div>
        )}

        {/* Strictly 2 Tabs: Hindi Fonts & English Fonts with live counts */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={() => setSelectedLanguage('hi')}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: '8px',
              border: `1.5px solid ${selectedLanguage === 'hi' ? '#6366f1' : theme.border}`,
              backgroundColor: selectedLanguage === 'hi' ? '#6366f1' : theme.innerBg,
              color: selectedLanguage === 'hi' ? '#ffffff' : theme.textSecondary,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇮🇳 Hindi Fonts ({hindiFonts.length})
          </button>

          <button
            onClick={() => setSelectedLanguage('en')}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: '8px',
              border: `1.5px solid ${selectedLanguage === 'en' ? '#6366f1' : theme.border}`,
              backgroundColor: selectedLanguage === 'en' ? '#6366f1' : theme.innerBg,
              color: selectedLanguage === 'en' ? '#ffffff' : theme.textSecondary,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇬🇧 English Fonts ({englishFonts.length})
          </button>
        </div>

        {/* Scrollable Font Cards Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: '10px',
            paddingRight: '4px',
            paddingBottom: '8px',
            alignContent: 'start',
          }}
        >
          {filteredFonts.map((font) => {
            const isSelected =
              activeFont === font.family ||
              (activeFont === 'default' && font.id === 'default');

            const previewText =
              selectedLanguage === 'hi'
                ? 'नमस्ते भारत / Reels'
                : 'Viral Captions ⚡';

            return (
              <div
                key={font.family}
                onClick={() => handleSelect(font.family)}
                onMouseEnter={() => loadGoogleFont(font.family)}
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
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isSelected ? '#818cf8' : theme.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {font.family}
                  </span>
                  {isSelected && <CheckCircle2 size={14} color="#6366f1" />}
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    margin: '6px 0 2px',
                    textAlign: 'center',
                    color: isSelected ? (isDark ? '#ffffff' : '#4338ca') : theme.textPrimary,
                    fontFamily: `"${font.family}", sans-serif`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}
                >
                  {previewText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
            paddingTop: '10px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: theme.textSecondary }}>
            {filteredFonts.length} fonts loaded live
          </span>

          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
