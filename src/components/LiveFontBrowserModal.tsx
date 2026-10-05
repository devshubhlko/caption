import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Type,
  CheckCircle2,
  Sparkles,
  Sliders,
  Languages,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  GoogleFontItem,
  ALL_GOOGLE_FONTS,
  HINDI_GOOGLE_FONTS,
  ENGLISH_GOOGLE_FONTS,
  loadGoogleFont,
} from '../services/fontService';

interface LiveFontBrowserModalProps {
  isOpen: boolean;
  activeFontFamily: string;
  onSelectFont: (fontFamily: string) => void;
  onClose: () => void;
  currentSubtitleText?: string;
}

const BATCH_SIZE = 24;

export const LiveFontBrowserModal: React.FC<LiveFontBrowserModalProps> = ({
  isOpen,
  activeFontFamily,
  onSelectFont,
  onClose,
  currentSubtitleText,
}) => {
  const { theme, isDark } = useAppTheme();

  // Filter & Search State
  const [langFilter, setLangFilter] = useState<'all' | 'hi' | 'en'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Preview Customizer
  const defaultSample = currentSubtitleText || 'नमस्ते भारत • Trending Reels';
  const [previewText, setPreviewText] = useState(defaultSample);
  const [previewSize, setPreviewSize] = useState<number>(24);
  const [previewWeight, setPreviewWeight] = useState<number>(700);

  // Lazy Infinite Batching State (same architecture as font.html)
  const [renderedCount, setRenderedCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update preview text if parent subtitle changes
  useEffect(() => {
    if (currentSubtitleText && currentSubtitleText.trim().length > 0) {
      setPreviewText(currentSubtitleText);
    }
  }, [currentSubtitleText]);

  // Compute filtered font list
  const filteredFonts = useMemo(() => {
    return ALL_GOOGLE_FONTS.filter((font) => {
      // Language filter
      if (langFilter === 'hi' && font.language !== 'hi' && font.language !== 'all') return false;
      if (langFilter === 'en' && font.language !== 'en' && font.language !== 'all') return false;



      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = font.family.toLowerCase().includes(query);
        const matchesStyle = font.styleName.toLowerCase().includes(query);
        if (!matchesName && !matchesStyle) return false;
      }

      return true;
    });
  }, [langFilter, searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setRenderedCount(BATCH_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [langFilter, searchQuery]);

  // Dynamic Lazy font loading for rendered batch
  useEffect(() => {
    if (!isOpen) return;
    const fontsToLoad = filteredFonts.slice(0, renderedCount);
    fontsToLoad.forEach((font) => {
      loadGoogleFont(font.family, [previewWeight]);
    });
  }, [isOpen, filteredFonts, renderedCount, previewWeight]);

  // Scroll listener for batch lazy loading (infinite scroll like font.html)
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      if (renderedCount < filteredFonts.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setRenderedCount((prev) => Math.min(prev + BATCH_SIZE, filteredFonts.length));
          setIsLoadingMore(false);
        }, 60);
      }
    }
  };

  if (!isOpen) return null;



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
        padding: '12px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '92vh',
          maxHeight: '850px',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.innerBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
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
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                Live Google Fonts Browser
              </h2>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '2px 0 0' }}>
                Instant dynamic loading for Hindi (Devanagari) & English fonts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
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

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Top Controls: Language Tabs + Search Input */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Language Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: theme.innerBg,
                padding: '3px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
              }}
            >
              <button
                onClick={() => setLangFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: langFilter === 'all' ? '#6366f1' : 'transparent',
                  color: langFilter === 'all' ? '#ffffff' : theme.textSecondary,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                All ({ALL_GOOGLE_FONTS.length})
              </button>
              <button
                onClick={() => setLangFilter('hi')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: langFilter === 'hi' ? '#6366f1' : 'transparent',
                  color: langFilter === 'hi' ? '#ffffff' : theme.textSecondary,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                 Hindi ({HINDI_GOOGLE_FONTS.length})
              </button>
              <button
                onClick={() => setLangFilter('en')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: langFilter === 'en' ? '#6366f1' : 'transparent',
                  color: langFilter === 'en' ? '#ffffff' : theme.textSecondary,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                 English ({ENGLISH_GOOGLE_FONTS.length})
              </button>
            </div>

            {/* Search Box */}
            <div
              style={{
                flex: 1,
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '0 10px',
              }}
            >
              <Search size={16} color={theme.textSecondary} style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search font by name (e.g. Poppins, Kalam, Bebas)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '8px 0',
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
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Controls: Live Preview Text & Style Chips */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '4px 10px',
              }}
            >
              <span style={{ fontSize: '11px', color: theme.textSecondary, marginRight: '8px', whiteSpace: 'nowrap' }}>
                Preview Text:
              </span>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: theme.textPrimary,
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Font Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: theme.textSecondary }}>Size:</span>
              <select
                value={previewSize}
                onChange={(e) => setPreviewSize(parseInt(e.target.value))}
                style={{
                  backgroundColor: theme.innerBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={18}>18px</option>
                <option value={22}>22px</option>
                <option value={26}>26px</option>
                <option value={32}>32px</option>
                <option value={40}>40px</option>
              </select>
            </div>

          </div>
        </div>

        {/* Status Header */}
        <div
          style={{
            padding: '8px 18px',
            backgroundColor: theme.innerBg,
            borderBottom: `1px solid ${theme.border}`,
            fontSize: '11px',
            color: theme.textSecondary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            Showing <strong>{Math.min(renderedCount, filteredFonts.length)}</strong> of <strong>{filteredFonts.length}</strong> live Google Fonts
          </span>
          {activeFontFamily && activeFontFamily !== 'default' && (
            <span style={{ color: '#818cf8', fontWeight: 700 }}>
              Active Selection: {activeFontFamily}
            </span>
          )}
        </div>

        {/* Infinite Grid Font Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="screen-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
            alignContent: 'start',
          }}
        >
          {filteredFonts.slice(0, renderedCount).map((font) => {
            const isSelected = activeFontFamily === font.family || (font.id === 'default' && activeFontFamily === 'default');
            const fontDisplayText = previewText || font.sampleText || 'नमस्ते भारत Reels';

            return (
              <div
                key={font.id}
                onClick={() => {
                  loadGoogleFont(font.family);
                  onSelectFont(font.family);
                }}
                style={{
                  borderRadius: '12px',
                  padding: '14px',
                  border: `1.5px solid ${isSelected ? '#6366f1' : theme.border}`,
                  backgroundColor: isSelected ? (isDark ? 'rgba(99, 102, 241, 0.18)' : '#eef2ff') : theme.innerBg,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Clean Font Header: ONLY Font Name & active indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: 800, 
                      color: isSelected ? '#818cf8' : theme.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {font.family}
                  </h4>

                  {isSelected && <CheckCircle2 size={15} color="#6366f1" />}
                </div>

                {/* Live Preview Box (How font looks) */}
                <div
                  style={{
                    minHeight: '76px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : '#ffffff',
                    border: `1px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontFamily: font.id !== 'default' ? `"${font.family}", sans-serif` : 'inherit',
                    fontSize: `${previewSize}px`,
                    fontWeight: previewWeight,
                    color: isSelected ? (isDark ? '#ffffff' : '#4338ca') : theme.textPrimary,
                    lineHeight: 1.35,
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                  }}
                >
                  {fontDisplayText}
                </div>
              </div>
            );
          })}

          {/* Load More Fonts Action Button */}
          {renderedCount < filteredFonts.length ? (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0 8px',
              }}
            >
              <button
                onClick={() => {
                  setIsLoadingMore(true);
                  setTimeout(() => {
                    setRenderedCount((prev) => Math.min(prev + BATCH_SIZE, filteredFonts.length));
                    setIsLoadingMore(false);
                  }, 60);
                }}
                disabled={isLoadingMore}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Loading Next Batch...</span>
                  </>
                ) : (
                  <>
                    <Type size={16} />
                    <span>
                      Load More Fonts (+{Math.min(BATCH_SIZE, filteredFonts.length - renderedCount)}) • Showing {renderedCount} of {filteredFonts.length}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '16px 0',
                fontSize: '12px',
                color: theme.textSecondary,
              }}
            >
              ✓ All {filteredFonts.length} Google Fonts loaded.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '11px', color: theme.textSecondary }}>
              Fonts are dynamically loaded from Google Fonts CDN in real-time.
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
