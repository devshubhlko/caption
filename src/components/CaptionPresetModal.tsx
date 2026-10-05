import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  CheckCircle2,
  Flame,
  Wand2,
  Tv,
  Film,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { CaptionPreset, CAPTION_PRESETS } from '../services/captionPresetService';
import { loadGoogleFont } from '../services/fontService';

interface CaptionPresetModalProps {
  isOpen: boolean;
  activePresetId?: string;
  onApplyPreset: (preset: CaptionPreset) => void;
  onClose: () => void;
  currentSubtitleText?: string;
}

export const CaptionPresetModal: React.FC<CaptionPresetModalProps> = ({
  isOpen,
  activePresetId,
  onApplyPreset,
  onClose,
  currentSubtitleText,
}) => {
  const { theme, isDark } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sampleText = currentSubtitleText || 'नमस्ते भारत • Viral Reels Punch ⚡';

  const filteredPresets = CAPTION_PRESETS.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fontFamily.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });



  const handleSelect = (preset: CaptionPreset) => {
    loadGoogleFont(preset.fontFamily);
    onApplyPreset(preset);
    onClose();
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
        padding: '14px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          height: '90vh',
          maxHeight: '820px',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
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
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                Trending Caption & Typography Presets
              </h2>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '2px 0 0' }}>
                1-Click Viral Reels, Shorts, Typewriter & Kinetic Caption Styles
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div style={{ padding: '10px 18px', backgroundColor: theme.cardBg, borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search 100 presets (e.g. MrBeast, Royal, Cyberpunk, Netflix, Minimal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.innerBg,
                color: theme.textPrimary,
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <Sparkles size={14} color="#818cf8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>


        </div>

        {/* Presets Grid */}
        <div
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
          {filteredPresets.map((preset) => {
            const isSelected = activePresetId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelect(preset)}
                style={{
                  borderRadius: '14px',
                  padding: '14px',
                  border: `1.5px solid ${isSelected ? '#6366f1' : theme.border}`,
                  backgroundColor: isSelected ? (isDark ? 'rgba(99, 102, 241, 0.2)' : '#eef2ff') : theme.innerBg,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 16px rgba(99, 102, 241, 0.3)' : 'none',
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
                {/* Clean Preset Header: ONLY Preset Name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: theme.textPrimary }}>
                    {preset.name}
                  </h4>
                </div>

                {/* Visual Preview Box (How preset looks) */}
                <div
                  style={{
                    minHeight: '84px',
                    borderRadius: '10px',
                    background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: preset.boxStyle === 'pill' ? '20px' : '8px',
                      backgroundColor:
                        preset.boxStyle === 'box'
                          ? (preset.boxBgColor || '#000000')
                          : preset.boxStyle === 'glass'
                          ? (preset.boxBgColor || 'rgba(0, 0, 0, 0.75)')
                          : preset.boxStyle === 'neon'
                          ? 'rgba(15, 23, 42, 0.92)'
                          : preset.boxStyle === 'pill'
                          ? (preset.boxBgColor || 'rgba(15, 23, 42, 0.85)')
                          : preset.boxStyle === 'outline'
                          ? (preset.boxBgColor || 'rgba(6, 182, 212, 0.15)')
                          : 'transparent',
                      border:
                        preset.boxStyle === 'glass'
                          ? '1px solid rgba(255, 255, 255, 0.2)'
                          : preset.boxStyle === 'neon'
                          ? '1.5px solid #6366f1'
                          : preset.boxStyle === 'outline'
                          ? '1.5px solid #38bdf8'
                          : preset.boxStyle === 'box'
                          ? '1px solid #334155'
                          : 'none',
                      boxShadow:
                        preset.boxStyle === 'neon'
                          ? '0 0 12px rgba(99, 102, 241, 0.5)'
                          : preset.boxStyle === 'glass'
                          ? '0 4px 10px rgba(0,0,0,0.3)'
                          : 'none',
                      textAlign: 'center',
                      maxWidth: '94%',
                      opacity: preset.opacity ?? 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: preset.color,
                        fontFamily: `"${preset.fontFamily}", sans-serif`,
                        textTransform: preset.textTransform || 'none',
                        textShadow: preset.textShadow || 'rgba(0,0,0,0.9) 1px 1px 3px',
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                      }}
                    >
                      {sampleText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
          <span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 600 }}>
            {filteredPresets.length} Presets Available
          </span>

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
