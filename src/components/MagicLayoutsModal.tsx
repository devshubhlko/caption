import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, RefreshCw, Check } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  ImageLayoutPreset,
  generateMagicLayoutPresets,
  wrapTextLines,
} from '../services/imageService';
import { loadGoogleFont } from '../services/fontService';

interface MagicLayoutsModalProps {
  isOpen: boolean;
  currentText: string;
  currentImageElement: HTMLImageElement | null;
  canvasWidth: number;
  canvasHeight: number;
  onApplyPreset: (preset: ImageLayoutPreset) => void;
  onClose: () => void;
}

export const MagicLayoutsModal: React.FC<MagicLayoutsModalProps> = ({
  isOpen,
  currentText,
  currentImageElement,
  canvasWidth,
  canvasHeight,
  onApplyPreset,
  onClose,
}) => {
  const { theme, isDark } = useAppTheme();
  const [presets, setPresets] = useState<ImageLayoutPreset[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const refreshPresets = () => {
    const quote = currentText.trim() || 'तजुर्बा खामोशी';
    const newPresets = generateMagicLayoutPresets(quote, canvasWidth, 9);
    setPresets(newPresets);

    // Preload web fonts
    newPresets.forEach((p) => {
      loadGoogleFont(p.fontFamilyName, [700]);
    });
  };

  useEffect(() => {
    if (isOpen) {
      refreshPresets();
    }
  }, [isOpen, currentText]);

  // Draw mini canvas previews once presets are set
  useEffect(() => {
    if (!isOpen || presets.length === 0) return;

    const timer = setTimeout(() => {
      presets.forEach((preset, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const previewW = canvas.width;
        const previewH = canvas.height;
        const scaleFactor = previewW / canvasWidth;

        ctx.clearRect(0, 0, previewW, previewH);

        // 1. Draw Background
        if (currentImageElement && currentImageElement.complete) {
          const img = currentImageElement;
          const imgRatio = img.width / img.height;
          const canvasRatio = previewW / previewH;

          let sx, sy, sWidth, sHeight;
          if (imgRatio > canvasRatio) {
            sHeight = img.height;
            sWidth = img.height * canvasRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            sWidth = img.width;
            sHeight = img.width / canvasRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, previewW, previewH);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, previewH);
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, previewW, previewH);
        }

        // 2. Draw Dark Overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${preset.overlayOpacity})`;
        ctx.fillRect(0, 0, previewW, previewH);

        // 3. Draw Typography
        const quote = currentText.trim() || 'तजुर्बा खामोशी';
        const fontSize = preset.fontSize * scaleFactor;
        const shadowSoftness = preset.shadowSoftness * scaleFactor;
        const shadowOffsetX = preset.shadowOffsetX * scaleFactor;
        const shadowOffsetY = preset.shadowOffsetY * scaleFactor;

        ctx.font = `bold ${fontSize}px ${preset.fontFamily}`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = preset.textAlignment;
        ctx.textBaseline = 'middle';

        // Apply shadow
        ctx.shadowColor = `rgba(0, 0, 0, ${preset.shadowOpacityPercent / 100})`;
        ctx.shadowBlur = shadowSoftness;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        const maxTextWidth = preset.maxTextWidth * scaleFactor;
        const lines = wrapTextLines(ctx, quote, maxTextWidth);
        const lineSpacing = fontSize * 1.4;
        const totalHeight = (lines.length - 1) * lineSpacing;

        const centerY = previewH * (preset.positionPercent / 100);
        let startY = centerY - totalHeight / 2;

        let posX = previewW / 2;
        if (preset.textAlignment === 'left') posX = previewW * 0.1;
        if (preset.textAlignment === 'right') posX = previewW * 0.9;

        lines.forEach((line) => {
          ctx.fillText(line, posX, startY);
          startY += lineSpacing;
        });

        // Clear shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, presets, currentImageElement, currentText, canvasWidth, canvasHeight]);

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
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
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
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: theme.textPrimary }}>
                Magic Styles & Layouts
              </h3>
              <p style={{ fontSize: '11px', color: theme.textSecondary }}>
                Choose ready-to-use professional typographic designs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={refreshPresets}
              title="Shuffle / Generate New Styles"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: theme.innerBg,
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
            </button>

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
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {presets.map((preset, index) => {
            const aspect = canvasWidth / canvasHeight;
            const previewHeight = Math.round(120 / aspect);

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onApplyPreset(preset);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: theme.innerBg,
                  border: `1.5px solid ${theme.border}`,
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                  }}
                >
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[index] = el;
                    }}
                    width={180}
                    height={Math.round(180 / aspect)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div style={{ padding: '8px 10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: theme.textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {preset.fontFamilyName}
                  </div>
                  <div style={{ fontSize: '9px', color: theme.textSecondary, marginTop: '2px' }}>
                    {preset.textAlignment.toUpperCase()} • {preset.fontSize}px
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
