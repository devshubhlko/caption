import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Image as ImageIcon,
  Type,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Moon,
  Layers,
  Palette,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  ImageRatioType,
  IMAGE_RATIO_CONFIGS,
  CURATED_BACKGROUNDS,
  ImageLayoutPreset,
  wrapTextLines,
} from '../services/imageService';
import { loadGoogleFont } from '../services/fontService';
import { ChangeImageModal } from '../components/ChangeImageModal';
import { MagicLayoutsModal } from '../components/MagicLayoutsModal';
import { ImageExportModal } from '../components/ImageExportModal';
import { LiveFontBrowserModal } from '../components/LiveFontBrowserModal';

export const ImageStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark, theme, toggleTheme } = useAppTheme();

  const ratioParam = (searchParams.get('ratio') as ImageRatioType) || '4:5';
  const initialImageUri = searchParams.get('imageUri') || CURATED_BACKGROUNDS[0].url;

  const [aspectRatio, setAspectRatio] = useState<ImageRatioType>(ratioParam);
  const ratioConfig = IMAGE_RATIO_CONFIGS[aspectRatio] || IMAGE_RATIO_CONFIGS['4:5'];

  // Canvas elements and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImageUri, setBgImageUri] = useState<string>(initialImageUri);
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null);

  // Typography & Content State
  const [quoteText, setQuoteText] = useState<string>(
    'तजुर्बा खामोशी से मिलता है'
  );
  const [fontFamily, setFontFamily] = useState<string>('Noto Sans Devanagari');
  const [fontSize, setFontSize] = useState<number>(54);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [textX, setTextX] = useState<number>(ratioConfig.width / 2);
  const [textY, setTextY] = useState<number>(ratioConfig.height / 2);
  const [maxTextWidth, setMaxTextWidth] = useState<number>(Math.round(ratioConfig.width * 0.85));

  // Visual Effects & Overlay
  const [isDarkOverlayEnabled, setIsDarkOverlayEnabled] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(45); // percent
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [shadowColor, setShadowColor] = useState<string>('#000000');
  const [shadowOpacity, setShadowOpacity] = useState<number>(85); // percent
  const [shadowBlur, setShadowBlur] = useState<number>(14);
  const [shadowOffsetX, setShadowOffsetX] = useState<number>(0);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(4);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'text' | 'font' | 'style' | 'shadow' | 'image'>('text');

  // Modal Controls
  const [isChangeImageOpen, setIsChangeImageOpen] = useState<boolean>(false);
  const [isMagicLayoutsOpen, setIsMagicLayoutsOpen] = useState<boolean>(false);
  const [isFontBrowserOpen, setIsFontBrowserOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Drag & Resize Interactive State
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isResizingRef = useRef<boolean>(false);
  const isWrappingRef = useRef<boolean>(false);
  const activeSideHandleRef = useRef<any>(null);

  const startDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startResizeRef = useRef<{ x: number; y: number; initialFontSize: number }>({
    x: 0,
    y: 0,
    initialFontSize: 54,
  });
  const startWrapRef = useRef<{ x: number; initialWidth: number }>({ x: 0, initialWidth: 800 });

  const textBoundsRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number } | null>(null);
  const resizeCornersRef = useRef<any[]>([]);
  const sideHandlesRef = useRef<any[]>([]);

  // Load Background Image
  useEffect(() => {
    if (!bgImageUri) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = bgImageUri;
    img.onload = () => {
      setBgImageElement(img);
    };
  }, [bgImageUri]);

  // Load Font
  useEffect(() => {
    loadGoogleFont(fontFamily, [400, 700]);
  }, [fontFamily]);

  // Adjust text boundaries if aspect ratio changes
  useEffect(() => {
    setTextX(ratioConfig.width / 2);
    setTextY(ratioConfig.height / 2);
    setMaxTextWidth(Math.round(ratioConfig.width * 0.85));
  }, [aspectRatio]);

  // Draw Canvas
  const drawCanvas = useCallback(
    (
      targetCanvas: HTMLCanvasElement | null,
      targetWidth: number,
      targetHeight: number,
      isExport: boolean = false
    ) => {
      if (!targetCanvas) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      const scaleFactor = targetWidth / ratioConfig.width;

      // 1. Draw Background Image
      if (bgImageElement && bgImageElement.complete) {
        const img = bgImageElement;
        const imgRatio = img.width / img.height;
        const canvasRatio = targetWidth / targetHeight;

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

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0b0f19');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // 2. Dark Overlay
      if (isDarkOverlayEnabled && overlayOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity / 100})`;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // 3. Draw Typography
      const text = quoteText.trim();
      if (!text) return;

      const scaledFontSize = fontSize * scaleFactor;
      const scaledShadowBlur = shadowBlur * scaleFactor;
      const scaledShadowOffsetX = shadowOffsetX * scaleFactor;
      const scaledShadowOffsetY = shadowOffsetY * scaleFactor;

      // Convert hex color to rgba
      const hex = shadowColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2) || '0', 16);
      const g = parseInt(hex.substring(2, 4) || '0', 16);
      const b = parseInt(hex.substring(4, 6) || '0', 16);
      const shadowColorRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacity / 100})`;

      ctx.font = `bold ${scaledFontSize}px '${fontFamily}', sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = textAlignment;
      ctx.textBaseline = 'middle';

      if (scaledShadowBlur > 0 || Math.abs(scaledShadowOffsetX) > 0 || Math.abs(scaledShadowOffsetY) > 0) {
        ctx.shadowColor = shadowColorRgba;
        ctx.shadowBlur = scaledShadowBlur;
        ctx.shadowOffsetX = scaledShadowOffsetX;
        ctx.shadowOffsetY = scaledShadowOffsetY;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      const scaledMaxWidth = maxTextWidth * scaleFactor;
      const lines = wrapTextLines(ctx, text, scaledMaxWidth);
      const lineSpacing = scaledFontSize * 1.45;
      const totalTextHeight = (lines.length - 1) * lineSpacing;

      const posX = textX * scaleFactor;
      const centerY = textY * scaleFactor;
      let startY = centerY - totalTextHeight / 2;

      lines.forEach((line) => {
        ctx.fillText(line, posX, startY);
        startY += lineSpacing;
      });

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 4. Interactive Selection & Resize Handles (Preview Only)
      if (!isExport) {
        const textHeightTotal = (lines.length - 1) * lineSpacing + scaledFontSize;
        const startYPos = centerY - scaledFontSize / 2 - ((lines.length - 1) * lineSpacing) / 2;

        let minXPos, maxXPos;
        if (textAlignment === 'left') {
          minXPos = posX;
          maxXPos = posX + scaledMaxWidth;
        } else if (textAlignment === 'right') {
          minXPos = posX - scaledMaxWidth;
          maxXPos = posX;
        } else {
          minXPos = posX - scaledMaxWidth / 2;
          maxXPos = posX + scaledMaxWidth / 2;
        }

        textBoundsRef.current = {
          minX: minXPos,
          maxX: maxXPos,
          minY: startYPos,
          maxY: startYPos + textHeightTotal,
        };

        if (isTextSelected) {
          const pad = 12 * scaleFactor;
          const outlineX = textBoundsRef.current.minX - pad;
          const outlineY = textBoundsRef.current.minY - pad;
          const outlineW = textBoundsRef.current.maxX - textBoundsRef.current.minX + 2 * pad;
          const outlineH = textBoundsRef.current.maxY - textBoundsRef.current.minY + 2 * pad;

          // Dotted Box
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(outlineX, outlineY, outlineW, outlineH);
          ctx.setLineDash([]);

          // 4 Corner Circles
          const corners = [
            { x: outlineX, y: outlineY, cursor: 'nwse-resize' },
            { x: outlineX + outlineW, y: outlineY, cursor: 'nesw-resize' },
            { x: outlineX, y: outlineY + outlineH, cursor: 'nesw-resize' },
            { x: outlineX + outlineW, y: outlineY + outlineH, cursor: 'nwse-resize' },
          ];

          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          corners.forEach((c) => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
          resizeCornersRef.current = corners;

          // 2 Side Handles
          const sides = [
            { x: outlineX, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'left' },
            { x: outlineX + outlineW, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'right' },
          ];

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          sides.forEach((s) => {
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(s.x - 3, s.y - 8, 6, 16, 3);
            } else {
              ctx.rect(s.x - 3, s.y - 8, 6, 16);
            }
            ctx.fill();
            ctx.stroke();
          });
          sideHandlesRef.current = sides;
        } else {
          resizeCornersRef.current = [];
          sideHandlesRef.current = [];
        }
      }
    },
    [
      ratioConfig,
      bgImageElement,
      isDarkOverlayEnabled,
      overlayOpacity,
      quoteText,
      fontSize,
      fontFamily,
      textAlignment,
      shadowColor,
      shadowOpacity,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      maxTextWidth,
      textX,
      textY,
      isTextSelected,
    ]
  );

  // Redraw preview whenever any visual state changes
  useEffect(() => {
    drawCanvas(canvasRef.current, ratioConfig.width, ratioConfig.height, false);
  }, [drawCanvas, ratioConfig]);

  // Handle Drag & Drop / Resize interactions
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const clickX = (clientX - rect.left) * (ratioConfig.width / rect.width);
    const clickY = (clientY - rect.top) * (ratioConfig.height / rect.height);

    // 1. Check side handles (for text wrap width)
    if (sideHandlesRef.current.length > 0 && isTextSelected) {
      for (const side of sideHandlesRef.current) {
        if (Math.hypot(clickX - side.x, clickY - side.y) <= 14) {
          isWrappingRef.current = true;
          activeSideHandleRef.current = side;
          startWrapRef.current = { x: clickX, initialWidth: maxTextWidth };
          return;
        }
      }
    }

    // 2. Check 4 corner resize handles
    if (resizeCornersRef.current.length > 0 && isTextSelected) {
      for (const corner of resizeCornersRef.current) {
        if (Math.hypot(clickX - corner.x, clickY - corner.y) <= 12) {
          isResizingRef.current = true;
          startResizeRef.current = { x: clickX, y: clickY, initialFontSize: fontSize };
          return;
        }
      }
    }

    // 3. Check inside text bounds (move drag)
    if (
      textBoundsRef.current &&
      clickX >= textBoundsRef.current.minX &&
      clickX <= textBoundsRef.current.maxX &&
      clickY >= textBoundsRef.current.minY &&
      clickY <= textBoundsRef.current.maxY
    ) {
      setIsTextSelected(true);
      isDraggingRef.current = true;
      startDragOffsetRef.current = {
        x: clickX - textX,
        y: clickY - textY,
      };
    } else {
      setIsTextSelected(false);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentX = (clientX - rect.left) * (ratioConfig.width / rect.width);
    const currentY = (clientY - rect.top) * (ratioConfig.height / rect.height);

    // A. Wrapping drag
    if (isWrappingRef.current && activeSideHandleRef.current) {
      let newWidth = startWrapRef.current.initialWidth;
      if (textAlignment === 'center') {
        newWidth = Math.abs(currentX - textX) * 2;
      } else if (textAlignment === 'left') {
        newWidth = currentX - textX;
      } else {
        newWidth = textX - currentX;
      }
      setMaxTextWidth(Math.max(200, Math.min(ratioConfig.width - 60, Math.round(newWidth))));
      return;
    }

    // B. Proportional font resizing drag
    if (isResizingRef.current) {
      const dx = currentX - startResizeRef.current.x;
      const dy = currentY - startResizeRef.current.y;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      const newSize = Math.max(24, Math.min(130, Math.round(startResizeRef.current.initialFontSize + delta * 0.3)));
      setFontSize(newSize);
      return;
    }

    // C. Position moving drag
    if (isDraggingRef.current) {
      const newX = Math.max(40, Math.min(ratioConfig.width - 40, currentX - startDragOffsetRef.current.x));
      const newY = Math.max(60, Math.min(ratioConfig.height - 60, currentY - startDragOffsetRef.current.y));
      setTextX(newX);
      setTextY(newY);
      return;
    }

    // D. Hover cursor feedback
    if (isTextSelected) {
      if (sideHandlesRef.current.some((s) => Math.hypot(currentX - s.x, currentY - s.y) <= 12)) {
        canvas.style.cursor = 'ew-resize';
        return;
      }
      if (resizeCornersRef.current.some((c) => Math.hypot(currentX - c.x, currentY - c.y) <= 10)) {
        canvas.style.cursor = 'nwse-resize';
        return;
      }
    }

    if (
      textBoundsRef.current &&
      currentX >= textBoundsRef.current.minX &&
      currentX <= textBoundsRef.current.maxX &&
      currentY >= textBoundsRef.current.minY &&
      currentY <= textBoundsRef.current.maxY
    ) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    isWrappingRef.current = false;
    activeSideHandleRef.current = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  // Apply Magic Layout Preset
  const handleApplyPreset = (preset: ImageLayoutPreset) => {
    setFontFamily(preset.fontFamilyName);
    setFontSize(preset.fontSize);
    setTextAlignment(preset.textAlignment);
    setOverlayOpacity(Math.round(preset.overlayOpacity * 100));
    setShadowColor(preset.shadowColorHex);
    setShadowOpacity(preset.shadowOpacityPercent);
    setShadowBlur(preset.shadowSoftness);
    setShadowOffsetX(preset.shadowOffsetX);
    setShadowOffsetY(preset.shadowOffsetY);
    setTextY(ratioConfig.height * (preset.positionPercent / 100));
    if (preset.textAlignment === 'left') {
      setTextX(ratioConfig.width * 0.1);
    } else if (preset.textAlignment === 'right') {
      setTextX(ratioConfig.width * 0.9);
    } else {
      setTextX(ratioConfig.width / 2);
    }
    setMaxTextWidth(preset.maxTextWidth);
  };

  // Render HD Canvas for Export Modal
  const renderHdCanvas = async (scale: number): Promise<Blob | null> => {
    const exportWidth = ratioConfig.width * scale;
    const exportHeight = ratioConfig.height * scale;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    // Draw full resolution without UI handles
    drawCanvas(exportCanvas, exportWidth, exportHeight, true);

    return new Promise((resolve) => {
      exportCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  return (
    <div
      style={{
        height: '100%',
        minHeight: '100vh',
        backgroundColor: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      {/* Top Header Bar */}
      <header
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: theme.innerBg,
              color: theme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: theme.textPrimary }}>
              Image Studio
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#312e81',
                  color: '#a5b4fc',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                {ratioConfig.ratioLabel}
              </span>
              <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                {ratioConfig.name} ({ratioConfig.width}×{ratioConfig.height})
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: theme.innerBg,
              color: isDark ? '#fde047' : '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Magic Styles */}
          <button
            onClick={() => setIsMagicLayoutsOpen(true)}
            style={{
              backgroundColor: isDark ? '#312e81' : '#e0e7ff',
              color: '#818cf8',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            <span>Magic Styles</span>
          </button>

          {/* Export HD */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Download size={15} />
            <span>Export HD</span>
          </button>
        </div>
      </header>

      {/* Studio Split Layout Container */}
      <div className="studio-split-wrapper">
        {/* LEFT COLUMN: Settings, Typography, Sliders & Tools */}
        <div className="studio-left-settings">
          {/* Tool Tabs Bar (5-column crisp responsive grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              backgroundColor: theme.innerBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
              marginBottom: '16px',
              flexShrink: 0,
            }}
          >
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'font', label: 'Font', icon: Layers },
              { id: 'style', label: 'Style', icon: Sliders },
              { id: 'shadow', label: 'Shadow', icon: Palette },
              { id: 'image', label: 'Image', icon: ImageIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 2px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#6366f1' : 'transparent',
                    color: isActive ? '#ffffff' : theme.textSecondary,
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tool Control Panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
        {/* TAB 1: QUOTE TEXT INPUT */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                Quote / Caption Text
              </label>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Enter your Hindi or English quote..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: theme.innerBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  lineHeight: '20px',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY & GOOGLE FONTS */}
        {activeTab === 'font' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: theme.textPrimary }}>
                  Active Font
                </label>
                <p style={{ fontSize: '11px', color: theme.textSecondary }}>
                  {fontFamily}
                </p>
              </div>

              <button
                onClick={() => setIsFontBrowserOpen(true)}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Layers size={14} />
                <span>Browse All Google Fonts</span>
              </button>
            </div>

            {/* Quick Popular Fonts Carousel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                'Noto Sans Devanagari',
                'Yatra One',
                'Rozha One',
                'Kalam',
                'Modak',
                'Teko',
                'Outfit',
                'Playfair Display',
                'Pacifico',
              ].map((fontName) => {
                const isSelected = fontFamily === fontName;
                return (
                  <button
                    key={fontName}
                    onClick={() => setFontFamily(fontName)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? (isDark ? '#312e81' : '#e0e7ff') : theme.innerBg,
                      border: `1.5px solid ${isSelected ? '#6366f1' : theme.border}`,
                      color: isSelected ? '#6366f1' : theme.textPrimary,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {fontName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TEXT STYLE & ALIGNMENT */}
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Alignment */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: theme.textPrimary, marginBottom: '6px', display: 'block' }}>
                Text Alignment
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'left', icon: AlignLeft, label: 'Left' },
                  { id: 'center', icon: AlignCenter, label: 'Center' },
                  { id: 'right', icon: AlignRight, label: 'Right' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = textAlignment === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTextAlignment(item.id as any);
                        if (item.id === 'left') setTextX(ratioConfig.width * 0.1);
                        else if (item.id === 'right') setTextX(ratioConfig.width * 0.9);
                        else setTextX(ratioConfig.width / 2);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#6366f1' : theme.innerBg,
                        color: isSelected ? '#ffffff' : theme.textSecondary,
                        border: `1px solid ${isSelected ? '#6366f1' : theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, display: 'block', marginBottom: '4px' }}>
                  Text Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {textColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>Font Size</span>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="110"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {/* Position Y Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>Vertical Position</span>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>
                  {Math.round((textY / ratioConfig.height) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={Math.round((textY / ratioConfig.height) * 100)}
                onChange={(e) => setTextY(ratioConfig.height * (parseInt(e.target.value) / 100))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: SHADOW & GLOW */}
        {activeTab === 'shadow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Shadow Color & Opacity */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, display: 'block', marginBottom: '4px' }}>
                  Shadow Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {shadowColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>Opacity</span>
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{shadowOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>
            </div>

            {/* Shadow Blur */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>Blur / Softness</span>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={shadowBlur}
                onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {/* Shadow Offset Y */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary }}>Vertical Offset</span>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>{shadowOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                value={shadowOffsetY}
                onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: IMAGE & FILTER */}
        {activeTab === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Change Image Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#1e293b',
                  }}
                >
                  <img
                    src={bgImageUri}
                    alt="Current Background"
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, display: 'block' }}>
                    Background Photo
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                    Live Pexels or Uploaded
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsChangeImageOpen(true)}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Change Photo
              </button>
            </div>

            {/* Dark Overlay Toggle Switch & Opacity Slider */}
            <div
              style={{
                borderRadius: '12px',
                padding: '12px 14px',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, display: 'block' }}>
                    Dark Overlay
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                    Improves text contrast on bright photos
                  </span>
                </div>

                {/* Toggle Switch Button */}
                <button
                  onClick={() => setIsDarkOverlayEnabled((prev) => !prev)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: isDarkOverlayEnabled ? '#6366f1' : (isDark ? '#334155' : '#cbd5e1'),
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isDarkOverlayEnabled ? 'flex-end' : 'flex-start',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                  />
                </button>
              </div>

              {/* Slider (Visible only when toggle is enabled) */}
              {isDarkOverlayEnabled && (
                <div style={{ paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
                      Overlay Intensity
                    </span>
                    <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>
                      {overlayOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>

        {/* RIGHT COLUMN: Output Image Canvas Preview Viewport */}
        <div className="studio-right-output">
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Canvas Stage Viewport */}
            <div
              style={{
                position: 'relative',
                width:
                  aspectRatio === '9:16'
                    ? 'min(330px, 80vw)'
                    : aspectRatio === '4:5'
                    ? 'min(420px, 80vw)'
                    : aspectRatio === '1:1'
                    ? 'min(440px, 80vw)'
                    : 'min(580px, 88vw)',
                maxHeight: 'calc(100vh - 150px)',
                aspectRatio: ratioConfig.aspectRatioCss,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)',
                border: `2.5px solid ${isTextSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)'}`,
                backgroundColor: '#0f172a',
                transition: 'border-color 0.2s ease',
              }}
            >
              <canvas
                ref={canvasRef}
                width={ratioConfig.width}
                height={ratioConfig.height}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  touchAction: 'none',
                  cursor: isTextSelected ? 'move' : 'default',
                }}
              />
            </div>

            {/* Stage Helper Badge */}
            <div
              style={{
                marginTop: '14px',
                padding: '6px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <span style={{ color: '#f59e0b' }}>💡</span>
              <span>Click & drag text to position • Drag corner dots to resize font</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Image Modal */}
      <ChangeImageModal
        isOpen={isChangeImageOpen}
        currentImageUrl={bgImageUri}
        onSelectImage={(newUrl) => setBgImageUri(newUrl)}
        onClose={() => setIsChangeImageOpen(false)}
      />

      {/* Magic Layouts Modal */}
      <MagicLayoutsModal
        isOpen={isMagicLayoutsOpen}
        currentText={quoteText}
        currentImageElement={bgImageElement}
        canvasWidth={ratioConfig.width}
        canvasHeight={ratioConfig.height}
        onApplyPreset={handleApplyPreset}
        onClose={() => setIsMagicLayoutsOpen(false)}
      />

      {/* Live Google Fonts Modal */}
      <LiveFontBrowserModal
        isOpen={isFontBrowserOpen}
        activeFontFamily={fontFamily}
        onSelectFont={(font) => setFontFamily(font)}
        onClose={() => setIsFontBrowserOpen(false)}
        currentSubtitleText={quoteText}
      />

      {/* HD Image Export Modal */}
      <ImageExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        aspectRatio={aspectRatio}
        renderHdCanvas={renderHdCanvas}
      />
    </div>
  );
};
