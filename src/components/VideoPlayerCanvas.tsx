import React, { useRef, useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { SubtitleCue } from '../services/transcriptionService';
import { loadGoogleFont } from '../services/fontService';

interface VideoPlayerCanvasProps {
  projectType: 'canvas' | 'image';
  aspectRatio: '9:16' | '16:9';
  canvasBgColor: string;
  imageUri: string | null;
  activeSubtitle: SubtitleCue | null;
  captionFontSize: number;
  captionColor: string;
  captionBgColor?: string;
  captionStyle: 'glass' | 'box' | 'neon' | 'clean' | 'pill' | 'outline' | 'gradient';
  captionFontFamily: string;
  captionPosition: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onPickImage?: () => void;
  captionOpacity?: number;
  captionAnimation?: string[];
  currentTime?: number;
  customText?: string;
  customTextPosition?: { x: number; y: number };
  onCustomTextPositionChange?: (pos: { x: number; y: number }) => void;
  customTextFontSize?: number;
  customTextOpacity?: number;
}

export const VideoPlayerCanvas: React.FC<VideoPlayerCanvasProps> = ({
  projectType,
  aspectRatio,
  canvasBgColor,
  imageUri,
  activeSubtitle,
  captionFontSize,
  captionColor,
  captionBgColor,
  captionStyle,
  captionFontFamily,
  captionPosition,
  onPositionChange,
  onTogglePlayPause,
  onPickImage,
  captionOpacity = 1,
  captionAnimation = ['none'],
  currentTime = 0,
  customText = '',
  customTextPosition = { x: 0, y: -70 },
  onCustomTextPositionChange,
  customTextFontSize = 20,
  customTextOpacity = 1,
}) => {
  const isPortrait = aspectRatio === '9:16';
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Google Font Loader
  useEffect(() => {
    if (captionFontFamily && captionFontFamily !== 'default') {
      loadGoogleFont(captionFontFamily);
    }
  }, [captionFontFamily]);

  // Dragging state for Subtitle Captions
  const [isDraggingSubtitle, setIsDraggingSubtitle] = useState(false);
  const dragStartSubtitleRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });

  const handleSubtitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingSubtitle(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragStartSubtitleRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: captionPosition.x,
      initPosY: captionPosition.y,
    };
  };

  const handleSubtitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSubtitle) return;
    const deltaX = e.clientX - dragStartSubtitleRef.current.startX;
    const deltaY = e.clientY - dragStartSubtitleRef.current.startY;
    onPositionChange({
      x: Math.round(dragStartSubtitleRef.current.initPosX + deltaX),
      y: Math.round(dragStartSubtitleRef.current.initPosY + deltaY),
    });
  };

  const handleSubtitlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSubtitle) {
      setIsDraggingSubtitle(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Dragging state for Custom Text Overlay
  const [isDraggingCustomText, setIsDraggingCustomText] = useState(false);
  const dragStartCustomTextRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 0,
    initPosY: 0,
  });

  const handleCustomTextPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingCustomText(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragStartCustomTextRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: customTextPosition.x,
      initPosY: customTextPosition.y,
    };
  };

  const handleCustomTextPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCustomText || !onCustomTextPositionChange) return;
    const deltaX = e.clientX - dragStartCustomTextRef.current.startX;
    const deltaY = e.clientY - dragStartCustomTextRef.current.startY;
    onCustomTextPositionChange({
      x: Math.round(dragStartCustomTextRef.current.initPosX + deltaX),
      y: Math.round(dragStartCustomTextRef.current.initPosY + deltaY),
    });
  };

  const handleCustomTextPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingCustomText) {
      setIsDraggingCustomText(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Compute text rendering for typewriter / kinetic animations
  let displaySubtitleText = activeSubtitle?.text || '';
  if (activeSubtitle && activeSubtitle.text) {
    if (captionAnimation.includes('typewriter')) {
      const cueDuration = Math.max(0.4, activeSubtitle.end - activeSubtitle.start);
      const elapsed = Math.max(0, currentTime - activeSubtitle.start);
      const progress = Math.min(1, elapsed / cueDuration);
      const charCount = Math.max(1, Math.floor(progress * activeSubtitle.text.length));
      displaySubtitleText = activeSubtitle.text.slice(0, charCount) + (progress < 1 ? '▍' : '');
    } else if (captionAnimation.includes('typewriter-word')) {
      const words = activeSubtitle.text.split(' ');
      const cueDuration = Math.max(0.4, activeSubtitle.end - activeSubtitle.start);
      const elapsed = Math.max(0, currentTime - activeSubtitle.start);
      const progress = Math.min(1, elapsed / cueDuration);
      const wordCount = Math.max(1, Math.ceil(progress * words.length));
      displaySubtitleText = words.slice(0, wordCount).join(' ');
    } else if (
      captionAnimation.includes('single-word') ||
      captionAnimation.includes('word-flash') ||
      captionAnimation.includes('one-word-pop')
    ) {
      const words = activeSubtitle.text.trim().split(/\s+/);
      const cueDuration = Math.max(0.3, activeSubtitle.end - activeSubtitle.start);
      const elapsed = Math.max(0, currentTime - activeSubtitle.start);
      const progress = Math.min(0.999, Math.max(0, elapsed / cueDuration));
      const activeWordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
      displaySubtitleText = words[activeWordIndex] || words[0] || '';
    }
  }
  
  // Universal "Halka sa" entry polish (Subtle fade, scale, float up)
  let entryAlpha = 1;
  let entryScale = 1;
  let entryOffsetY = 0;
  
  if (activeSubtitle && captionAnimation && captionAnimation.length > 0 && !captionAnimation.includes('none')) {
    const elapsed = Math.max(0, currentTime - activeSubtitle.start);
    if (elapsed < 0.15) {
      const entryT = Math.max(0.01, Math.min(1, elapsed / 0.15));
      entryAlpha = entryT;
      entryOffsetY = (1 - entryT) * 12;
      entryScale = 0.96 + 0.04 * entryT;
    }
  }

  // Animation class for all 20 Pro Animations
  const animClass = captionAnimation
    ? captionAnimation.filter(a => a !== 'none').map(a => `caption-anim-${a}`).join(' ')
    : '';

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 0',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: isPortrait ? '100%' : '100%',
          maxWidth: isPortrait ? '320px' : '560px',
          aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
          height: isPortrait ? 'min(520px, calc(100vh - 220px))' : 'auto',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          backgroundColor: projectType === 'canvas' ? canvasBgColor : '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Image Background */}
        {imageUri && imageUri.length > 0 ? (
          <img
            src={imageUri}
            alt="Project Background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : projectType === 'image' ? (
          <div
            onClick={onPickImage}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px',
              backgroundColor: '#090d16',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '25px',
                backgroundColor: '#1e1e38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                color: '#818cf8',
              }}
            >
              <ImageIcon size={26} />
            </div>
            <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
              Select an Image
            </p>
            <p style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'center' }}>
              Tap here to pick photo from gallery
            </p>
          </div>
        ) : null}

        {/* Tap-to-Play/Pause Click Layer (Clean preview) */}
        <div
          onClick={onTogglePlayPause}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            zIndex: 10,
          }}
        />

        {/* 1. Speech Subtitle Cue Overlay (Plays according to audio timing) */}
        {activeSubtitle && activeSubtitle.text ? (
          <div
            onPointerDown={handleSubtitlePointerDown}
            onPointerMove={handleSubtitlePointerMove}
            onPointerUp={handleSubtitlePointerUp}
            onPointerCancel={handleSubtitlePointerUp}
            style={{
              position: 'absolute',
              maxWidth: '88%',
              padding: captionBgColor === 'transparent' ? '4px 8px' : '6px 12px',
              borderRadius: captionStyle === 'pill' ? '9999px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: isDraggingSubtitle ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
              transform: `translate(${captionPosition.x}px, ${captionPosition.y + entryOffsetY}px) scale(${entryScale})`,
              zIndex: 20,
              transition: isDraggingSubtitle ? 'none' : 'box-shadow 0.15s, border-color 0.15s',
              border: isDraggingSubtitle
                ? '1.5px solid #818cf8'
                : captionBgColor === 'transparent'
                ? 'none'
                : undefined,
              opacity: (captionOpacity ?? 1) * entryAlpha,
              backgroundColor:
                captionBgColor === 'transparent'
                  ? 'transparent'
                  : captionBgColor
                  ? captionBgColor
                  : undefined,
              backdropFilter: captionBgColor === 'transparent' ? 'none' : undefined,
              WebkitBackdropFilter: captionBgColor === 'transparent' ? 'none' : undefined,
              boxShadow: captionBgColor === 'transparent' ? 'none' : undefined,
            }}
            className={`${captionBgColor === 'transparent' ? '' : `caption-box-${captionStyle}`} ${animClass}`}
          >
            <span
              style={{
                fontSize: `${captionFontSize}px`,
                color: captionColor,
                lineHeight: 1.32,
                fontWeight: 800,
                fontFamily:
                  captionFontFamily !== 'default' ? `'${captionFontFamily}', sans-serif` : 'inherit',
                textShadow:
                  captionBgColor === 'transparent'
                    ? '0 2px 5px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9), 1px 1px 2px #000000'
                    : 'rgba(0, 0, 0, 0.9) 1px 1px 3px',
                wordBreak: 'break-word',
                pointerEvents: 'none',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
              }}
            >
              {displaySubtitleText}
            </span>
          </div>
        ) : null}

        {/* 2. Independent Custom Text Overlay (Headline, Watermark, Lyrics, or Title) */}
        {customText && customText.trim().length > 0 ? (
          <div
            onPointerDown={handleCustomTextPointerDown}
            onPointerMove={handleCustomTextPointerMove}
            onPointerUp={handleCustomTextPointerUp}
            onPointerCancel={handleCustomTextPointerUp}
            style={{
              position: 'absolute',
              maxWidth: '90%',
              padding: captionBgColor === 'transparent' ? '4px 8px' : '6px 12px',
              borderRadius: captionStyle === 'pill' ? '9999px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: isDraggingCustomText ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
              transform: `translate(${customTextPosition.x}px, ${customTextPosition.y}px)`,
              zIndex: 25,
              transition: isDraggingCustomText ? 'none' : 'box-shadow 0.15s, border-color 0.15s',
              border: isDraggingCustomText
                ? '1.5px solid #38bdf8'
                : captionBgColor === 'transparent'
                ? 'none'
                : undefined,
              opacity: customTextOpacity,
              backgroundColor:
                captionBgColor === 'transparent'
                  ? 'transparent'
                  : captionBgColor
                  ? captionBgColor
                  : undefined,
              backdropFilter: captionBgColor === 'transparent' ? 'none' : undefined,
              WebkitBackdropFilter: captionBgColor === 'transparent' ? 'none' : undefined,
              boxShadow: captionBgColor === 'transparent' ? 'none' : undefined,
            }}
            className={captionBgColor === 'transparent' ? '' : `caption-box-${captionStyle}`}
          >
            <span
              style={{
                fontSize: `${customTextFontSize}px`,
                color: captionColor,
                lineHeight: 1.32,
                fontWeight: 800,
                fontFamily:
                  captionFontFamily !== 'default' ? `'${captionFontFamily}', sans-serif` : 'inherit',
                textShadow:
                  captionBgColor === 'transparent'
                    ? '0 2px 5px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9), 1px 1px 2px #000000'
                    : 'rgba(0, 0, 0, 0.9) 1px 1px 3px',
                wordBreak: 'break-word',
                pointerEvents: 'none',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
              }}
            >
              {customText}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
