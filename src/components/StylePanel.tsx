import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Type,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Pipette,
  Zap,
} from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  loadGoogleFont,
  useLiveGoogleFonts,
} from '../services/fontService';
import { CaptionPreset, CAPTION_PRESETS, ANIMATION_EFFECTS } from '../services/captionPresetService';
import { CaptionPresetModal } from './CaptionPresetModal';
import { AnimationEffectsModal } from './AnimationEffectsModal';
import { GoogleFontModal } from './GoogleFontModal';

// Caption Color Presets
export const CAPTION_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Cyber Yellow', hex: '#fde047' },
  { name: 'Electric Cyan', hex: '#38bdf8' },
  { name: 'Lime Green', hex: '#4ade80' },
  { name: 'Hot Pink', hex: '#f43f5e' },
  { name: 'Warm Amber', hex: '#fbbf24' },
  { name: 'Bright Orange', hex: '#fb923c' },
  { name: 'Royal Purple', hex: '#c084fc' },
  { name: 'Emerald Mint', hex: '#6ee7b7' },
  { name: 'Rose Red', hex: '#f87171' },
  { name: 'Pure Black', hex: '#000000' },
];

// Caption Box Background Color Presets
export const CAPTION_BG_COLORS = [
  { name: 'Transparent (No BG)', hex: 'transparent' },
  { name: 'Dark Glass (85%)', hex: 'rgba(0, 0, 0, 0.85)' },
  { name: 'Solid Black', hex: '#000000' },
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Solid White', hex: '#ffffff' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Cyber Blue', hex: '#0284c7' },
  { name: 'Sunset Coral', hex: '#ea580c' },
];

// Caption Style Presets 
export const CAPTION_STYLES = [
  { id: 'glass', label: 'Glass' },
  { id: 'box', label: 'Dark Box' },
  { id: 'clean', label: 'Shadow' },
];

interface StylePanelProps {
  onOpenAddCustomText: () => void;
  captionFontSize: number;
  onFontSizeChange: (size: number) => void;
  captionColor: string;
  onColorChange: (color: string) => void;
  captionBgColor?: string;
  onBgColorChange?: (color: string) => void;
  captionStyle: 'glass' | 'box' | 'neon' | 'clean' | 'pill' | 'outline' | 'gradient';
  onStyleChange: (style: any) => void;
  captionFontFamily: string;
  onFontChange: (font: string) => void;
  captionOpacity?: number;
  onOpacityChange?: (opacity: number) => void;
  captionAnimation?: string;
  onAnimationChange?: (anim: any) => void;
  onSetPresetPosition: (x: number, y: number) => void;
  currentSubtitleText?: string;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
  customTextFontSize?: number;
  onCustomTextFontSizeChange?: (size: number) => void;
  customTextOpacity?: number;
  onCustomTextOpacityChange?: (opacity: number) => void;
  onSetCustomTextPosition?: (x: number, y: number) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  onOpenAddCustomText,
  captionFontSize,
  onFontSizeChange,
  captionColor,
  onColorChange,
  captionBgColor = 'transparent',
  onBgColorChange,
  captionStyle,
  onStyleChange,
  captionFontFamily,
  onFontChange,
  captionOpacity = 1,
  onOpacityChange,
  captionAnimation = 'none',
  onAnimationChange,
  onSetPresetPosition,
  currentSubtitleText,
  customText = '',
  onCustomTextChange,
  customTextFontSize = 20,
  onCustomTextFontSizeChange,
  customTextOpacity = 1,
  onCustomTextOpacityChange,
  onSetCustomTextPosition,
}) => {
  const { isDark, theme } = useAppTheme();
  const { hindiFonts, englishFonts } = useLiveGoogleFonts();

  // Screen Tab State for quick 4-font view
  const [fontTab, setFontTab] = useState<'hi' | 'en'>('hi');

  // Modal Visibility States
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isAnimationModalOpen, setIsAnimationModalOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);

  // Hidden Color Input Refs
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);

  // Dynamically load font on selection
  useEffect(() => {
    if (captionFontFamily && captionFontFamily !== 'default') {
      loadGoogleFont(captionFontFamily);
    }
  }, [captionFontFamily]);

  // Preload quick 8 fonts for instant UI render
  useEffect(() => {
    const quick = [...hindiFonts.slice(0, 4), ...englishFonts.slice(0, 4)];
    quick.forEach((f) => {
      loadGoogleFont(f.family);
    });
  }, [hindiFonts, englishFonts]);

  const handleFontSelect = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onFontChange(fontFamily);
  };

  const handleApplyPreset = (preset: CaptionPreset) => {
    loadGoogleFont(preset.fontFamily);
    onFontChange(preset.fontFamily);
    onColorChange(preset.color);
    onStyleChange(preset.boxStyle);
    if (onBgColorChange && preset.boxBgColor) onBgColorChange(preset.boxBgColor);
    if (onOpacityChange) onOpacityChange(preset.opacity ?? 1);
    if (onAnimationChange) onAnimationChange(preset.animationType ?? 'none');
  };

  const isCustomColor = !CAPTION_COLORS.some((c) => c.hex.toLowerCase() === captionColor.toLowerCase());

  // Top Quick Animations for main screen
  const quickAnimations = [
    { id: 'none', name: 'Static', icon: '🚫' },
    { id: 'single-word', name: '1-Word Solo', icon: '⚡' },
    { id: 'typewriter', name: 'Typewriter', icon: '⌨️' },
    { id: 'word-pop', name: 'Word Pop', icon: '💥' },
  ];

  const currentAnimationName =
    ANIMATION_EFFECTS.find((a) => a.id === captionAnimation)?.name || 'Static';

  const displayedFonts = (fontTab === 'hi' ? hindiFonts : englishFonts).slice(0, 4);

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '14px',
        padding: '14px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wand2 size={18} color="#818cf8" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
            Style & Typography
          </h2>
        </div>

        <button
          onClick={() => setIsPresetModalOpen(true)}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={13} />
          <span>Top Presets ({CAPTION_PRESETS.length}+)</span>
        </button>
      </div>

      {/* Custom Text Overlay Section */}
      {customText && customText.trim().length > 0 ? (
        <div
          style={{
            width: '100%',
            borderRadius: '10px',
            padding: '12px',
            border: '1.5px solid rgba(99, 102, 241, 0.4)',
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Type size={13} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
                Custom Text Overlay
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={onOpenAddCustomText}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Edit Text
              </button>
              {onCustomTextChange && (
                <button
                  onClick={() => onCustomTextChange('')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : '#ffffff',
              padding: '8px 10px',
              borderRadius: '6px',
              marginBottom: '10px',
              fontSize: '12px',
              fontWeight: 600,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            "{customText}"
          </div>

          {/* Custom Text Independent Size Slider */}
          {onCustomTextFontSizeChange && (
            <div style={{ marginTop: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 600, color: theme.textSecondary }}>
                  Overlay Text Size
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#818cf8' }}>
                  {customTextFontSize}px
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => onCustomTextFontSizeChange(Math.max(10, customTextFontSize - 2))}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.innerBg,
                    color: theme.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="range"
                  min="10"
                  max="44"
                  value={customTextFontSize}
                  onChange={(e) => onCustomTextFontSizeChange(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#6366f1',
                    height: '4px',
                    cursor: 'pointer',
                  }}
                />
                <button
                  onClick={() => onCustomTextFontSizeChange(Math.min(44, customTextFontSize + 2))}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.innerBg,
                    color: theme.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Custom Text Independent Opacity Slider */}
          {onCustomTextOpacityChange && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 600, color: theme.textSecondary }}>
                  Overlay Text Opacity
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#818cf8' }}>
                  {Math.round(customTextOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={customTextOpacity}
                onChange={(e) => onCustomTextOpacityChange(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#6366f1',
                  height: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenAddCustomText}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '10px',
            padding: '10px 12px',
            border: `1.5px dashed ${theme.border}`,
            backgroundColor: theme.innerBg,
            marginBottom: '14px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Type size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
              + Add Text
            </p>
          </div>
          <ChevronRight size={16} color="#818cf8" />
        </button>
      )}

      {/* Font Size Slider */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
            Font Size
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>
            {captionFontSize}px
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onFontSizeChange(Math.max(12, captionFontSize - 2))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Minus size={14} />
          </button>

          <input
            type="range"
            min={12}
            max={42}
            step={1}
            value={captionFontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            style={{
              flex: 1,
              height: '6px',
              accentColor: '#6366f1',
              cursor: 'pointer',
            }}
          />

          <button
            onClick={() => onFontSizeChange(Math.min(42, captionFontSize + 2))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Font Opacity Slider */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
            Caption Opacity
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>
            {Math.round(captionOpacity * 100)}%
          </span>
        </div>

        <input
          type="range"
          min={0.1}
          max={1.0}
          step={0.05}
          value={captionOpacity}
          onChange={(e) => onOpacityChange && onOpacityChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#6366f1',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Font Color Palette + Custom Color Picker */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
            Color & Custom Palette
          </span>
          <span style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: 'monospace' }}>
            {captionColor.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {CAPTION_COLORS.map((c) => {
            const isSelected = captionColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => onColorChange(c.hex)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: c.hex,
                  border: isSelected ? '2px solid #6366f1' : '1.5px solid #334155',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  boxShadow: isSelected ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none',
                }}
                title={c.name}
              >
                {isSelected && <Check size={14} color="#000000" />}
              </button>
            );
          })}

          {/* Custom Color Picker Button */}
          <div style={{ position: 'relative' }}>
            <input
              type="color"
              ref={colorInputRef}
              value={captionColor.startsWith('#') && captionColor.length === 7 ? captionColor : '#ffffff'}
              onChange={(e) => onColorChange(e.target.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                left: 0,
                top: 0,
              }}
            />
            <button
              onClick={() => colorInputRef.current?.click()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: isCustomColor
                  ? captionColor
                  : 'conic-gradient(from 180deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                border: isCustomColor ? '2px solid #6366f1' : '1.5px solid #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: isCustomColor ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isCustomColor ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none',
              }}
              title="Pick Custom Text Color"
            >
              <Pipette size={14} color={isCustomColor ? '#000000' : '#ffffff'} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Background Color Palette */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
            Text Background Color (Video)
          </span>
          <span style={{ fontSize: '10px', color: theme.textSecondary, fontFamily: 'monospace' }}>
            {captionBgColor === 'transparent' ? 'NONE' : captionBgColor}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {CAPTION_BG_COLORS.map((bg) => {
            const isSelected = captionBgColor.toLowerCase() === bg.hex.toLowerCase();
            const isTransparent = bg.hex === 'transparent';
            return (
              <button
                key={bg.hex}
                onClick={() => onBgColorChange && onBgColorChange(bg.hex)}
                style={{
                  minWidth: isTransparent ? '54px' : '32px',
                  height: '32px',
                  borderRadius: isTransparent ? '8px' : '16px',
                  padding: isTransparent ? '0 6px' : '0',
                  backgroundColor: isTransparent ? 'transparent' : bg.hex,
                  border: isSelected ? '2px solid #6366f1' : '1.5px solid #475569',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isTransparent ? theme.textPrimary : '#ffffff',
                  boxShadow: isSelected ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none',
                }}
                title={bg.name}
              >
                {isTransparent ? 'None' : isSelected && <Check size={14} color="#ffffff" />}
              </button>
            );
          })}

          {/* Custom BG Color Picker Button */}
          <div style={{ position: 'relative' }}>
            <input
              type="color"
              ref={bgColorInputRef}
              value={captionBgColor.startsWith('#') && captionBgColor.length === 7 ? captionBgColor : '#000000'}
              onChange={(e) => onBgColorChange && onBgColorChange(e.target.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                left: 0,
                top: 0,
              }}
            />
            <button
              onClick={() => bgColorInputRef.current?.click()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: 'conic-gradient(from 0deg, #6366f1, #ec4899, #f59e0b, #10b981, #6366f1)',
                border: '1.5px solid #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Pick Custom Background Color"
            >
              <Pipette size={14} color="#ffffff" />
            </button>
          </div>
        </div>
      </div>

      {/* Caption Box Style (3 options + 4th: View All Presets) */}
      <div style={{ marginBottom: '14px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: theme.textSecondary,
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Box Style & Presets
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {CAPTION_STYLES.map((st) => {
            const isSelected = captionStyle === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onStyleChange(st.id as any)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '7px',
                  border: `1px solid ${isSelected ? '#6366f1' : theme.border}`,
                  backgroundColor: isSelected ? '#312e81' : theme.innerBg,
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {st.label}
              </button>
            );
          })}

          {/* 4th Button: View All (30+ Presets) */}
          <button
            onClick={() => setIsPresetModalOpen(true)}
            style={{
              flex: 1.3,
              padding: '7px 4px',
              borderRadius: '7px',
              border: '1.5px solid #6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={12} />
            <span>Presets (30+)</span>
          </button>
        </div>
      </div>

      {/* Animation Effects (Clean 3-item row + 4th "View All (35+)" button) */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
            Animation Effects
          </span>
          <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700 }}>
            Active: {currentAnimationName}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {quickAnimations.map((anim) => {
            const isSelected = captionAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => onAnimationChange && onAnimationChange(anim.id as any)}
                style={{
                  padding: '7px 4px',
                  borderRadius: '7px',
                  border: `1px solid ${isSelected ? '#6366f1' : theme.border}`,
                  backgroundColor: isSelected ? '#6366f1' : theme.innerBg,
                  color: isSelected ? '#ffffff' : theme.textSecondary,
                  fontSize: '10px',
                  fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: isSelected ? '0 0 8px rgba(99, 102, 241, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '13px' }}>{anim.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {anim.name}
                </span>
              </button>
            );
          })}

          {/* 4th Item: View All (35+) Animation Effects Modal Button */}
          <button
            onClick={() => setIsAnimationModalOpen(true)}
            style={{
              padding: '7px 4px',
              borderRadius: '7px',
              border: '1.5px solid #6366f1',
              backgroundColor: !quickAnimations.some((a) => a.id === captionAnimation)
                ? 'rgba(99, 102, 241, 0.35)'
                : 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: !quickAnimations.some((a) => a.id === captionAnimation)
                ? '0 0 10px rgba(99, 102, 241, 0.4)'
                : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={14} />
            <span>View All (35+)</span>
          </button>
        </div>
      </div>

      {/* Live Google Fonts Section (Clean 2-Tab + 4 Fonts + View All Modal) */}
      <div
        style={{
          marginBottom: '14px',
          borderTop: `1px solid ${theme.border}`,
          paddingTop: '12px',
        }}
      >
        {/* Section Header with Active Font Badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: theme.textPrimary }}>
            Google Fonts
          </span>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            {captionFontFamily === 'default' ? 'Inter' : captionFontFamily} ✓
          </span>
        </div>

        {/* 2 Simple Tabs: Hindi & English */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <button
            onClick={() => setFontTab('hi')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '7px',
              border: `1px solid ${fontTab === 'hi' ? '#6366f1' : theme.border}`,
              backgroundColor: fontTab === 'hi' ? '#6366f1' : theme.innerBg,
              color: fontTab === 'hi' ? '#ffffff' : theme.textSecondary,
              fontSize: '11px',
              fontWeight: fontTab === 'hi' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇮🇳 Hindi Fonts
          </button>

          <button
            onClick={() => setFontTab('en')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '7px',
              border: `1px solid ${fontTab === 'en' ? '#6366f1' : theme.border}`,
              backgroundColor: fontTab === 'en' ? '#6366f1' : theme.innerBg,
              color: fontTab === 'en' ? '#ffffff' : theme.textSecondary,
              fontSize: '11px',
              fontWeight: fontTab === 'en' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🇬🇧 English Fonts
          </button>
        </div>

        {/* 4 Clean Font Cards Grid (2x2) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          {displayedFonts.map((font) => {
            const isSelected = captionFontFamily === font.family;
            const previewSnippet =
              fontTab === 'hi' ? 'नमस्ते भारत' : 'Viral Reels';

            return (
              <div
                key={font.id}
                onClick={() => handleFontSelect(font.family)}
                style={{
                  borderRadius: '10px',
                  padding: '10px',
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
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isSelected ? '#818cf8' : theme.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {font.family}
                  </span>
                  {isSelected && <CheckCircle2 size={13} color="#6366f1" />}
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    margin: '4px 0',
                    textAlign: 'center',
                    color: isSelected ? (isDark ? '#ffffff' : '#4338ca') : theme.textPrimary,
                    fontFamily: `"${font.family}", sans-serif`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {previewSnippet}
                </p>

                <span style={{ fontSize: '8px', color: theme.textSecondary, fontWeight: 600 }}>
                  {font.styleName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* View All Live Google Fonts Button (Opens Modal) */}
        <button
          onClick={() => setIsFontModalOpen(true)}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: '8px',
            backgroundColor: theme.innerBg,
            border: `1.5px dashed #6366f1`,
            color: '#818cf8',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Type size={14} />
          <span>🔍 View All Google Fonts ({fontTab === 'hi' ? 'Hindi' : 'English'})</span>
        </button>
      </div>

      {/* Position Presets */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: theme.textSecondary,
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Position Presets
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onSetPresetPosition(0, -120)}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⬆️ Top</span>
          </button>

          <button
            onClick={() => onSetPresetPosition(0, 0)}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⏺️ Center</span>
          </button>

          <button
            onClick={() => onSetPresetPosition(0, 120)}
            style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⬇️ Bottom</span>
          </button>
        </div>
      </div>

      {/* 1. Top 30+ Trending Presets Modal */}
      <CaptionPresetModal
        isOpen={isPresetModalOpen}
        onApplyPreset={handleApplyPreset}
        onClose={() => setIsPresetModalOpen(false)}
        currentSubtitleText={currentSubtitleText}
      />

      {/* 2. Pro Animation Effects Modal (35+ Effects) */}
      <AnimationEffectsModal
        isOpen={isAnimationModalOpen}
        activeAnimation={captionAnimation}
        onSelectAnimation={(animId) => onAnimationChange && onAnimationChange(animId)}
        onClose={() => setIsAnimationModalOpen(false)}
        currentSubtitleText={currentSubtitleText}
      />

      {/* 3. Live Google Fonts Browser Modal */}
      <GoogleFontModal
        isOpen={isFontModalOpen}
        activeFont={captionFontFamily}
        onSelectFont={handleFontSelect}
        onClose={() => setIsFontModalOpen(false)}
        currentSubtitleText={currentSubtitleText}
      />
    </div>
  );
};
