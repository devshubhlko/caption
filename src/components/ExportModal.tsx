import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Video, X, Film, Download, Loader2, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { formatTimeHelper, ExportResult, triggerDownload } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExporting: boolean;
  exportProgress: number;
  exportStepText: string;
  duration: number;
  aspectRatio: string;
  onExportVideo: () => void;
  generatedVideo: ExportResult | null;
  onResetGeneratedVideo: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  isExporting,
  exportProgress,
  exportStepText,
  duration,
  aspectRatio,
  onExportVideo,
  generatedVideo,
  onResetGeneratedVideo,
}) => {
  const { isDark, theme } = useAppTheme();

  if (!isOpen) return null;

  const handleDownload = () => {
    if (generatedVideo) {
      triggerDownload(generatedVideo.blob, generatedVideo.filename);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

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
          maxWidth: '460px',
          borderRadius: '16px',
          padding: '20px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
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
              <Video size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                {generatedVideo ? 'Video Export Ready' : 'Export HD Video'}
              </h3>
              <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '2px 0 0' }}>
                Full HD 1080p with audio, custom overlays & typography
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={handleClose}
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
          )}
        </div>

        {/* State 1: Generation In Progress */}
        {isExporting ? (
          <div
            style={{
              padding: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '27px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: '1.5px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              <Loader2 size={28} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
            </div>

            <p style={{ fontSize: '15px', fontWeight: 800, color: theme.textPrimary, marginBottom: '4px' }}>
              Rendering HD Video ({exportProgress}%)
            </p>
            <p style={{ fontSize: '12px', color: '#818cf8', marginBottom: '16px', minHeight: '18px' }}>
              {exportStepText}
            </p>

            {/* Progress Bar Container */}
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: theme.innerBg,
                overflow: 'hidden',
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  width: `${exportProgress}%`,
                  height: '100%',
                  backgroundColor: '#6366f1',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.7)',
                }}
              />
            </div>
            <span style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '8px' }}>
              Processing frame by frame for pristine quality...
            </span>
          </div>
        ) : generatedVideo ? (
          /* State 2: Video Generated & Ready For Download */
          <div>
            {/* Success Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={16} color="#22c55e" />
              <span>HD Video successfully rendered and ready to save!</span>
            </div>

            {/* Video Player Preview */}
            <div
              style={{
                width: '100%',
                maxHeight: '230px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                border: `1px solid ${theme.border}`,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                src={generatedVideo.url}
                controls
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxHeight: '230px',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Project Specs Info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                marginBottom: '16px',
                fontSize: '11px',
                color: theme.textSecondary,
              }}
            >
              <span>
                Duration: <strong style={{ color: theme.textPrimary }}>{formatTimeHelper(generatedVideo.duration)}</strong>
              </span>
              <span>
                Ratio: <strong style={{ color: theme.textPrimary }}>{generatedVideo.aspectRatio}</strong>
              </span>
              <span>
                Quality: <strong style={{ color: '#818cf8' }}>1080p HD MP4</strong>
              </span>
            </div>

            {/* Actions: Download Button & Regenerate Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleDownload}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={18} />
                <span>Download HD Video (MP4)</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={onResetGeneratedVideo}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: theme.innerBg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Re-render</span>
                </button>

                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: theme.innerBg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State 3: Ready to Start Generation */
          <div>
            {/* Project Specs Summary */}
            <div
              style={{
                backgroundColor: theme.innerBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: theme.textSecondary }}>Aspect Ratio:</span>
                <strong style={{ color: '#818cf8' }}>{aspectRatio} ({aspectRatio === '9:16' ? '1080×1920' : aspectRatio === '16:9' ? '1920×1080' : '1080×1080'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: theme.textSecondary }}>Audio Track:</span>
                <strong style={{ color: theme.textPrimary }}>Synced HD Audio</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: theme.textSecondary }}>Target Length:</span>
                <strong style={{ color: theme.textPrimary }}>{formatTimeHelper(duration)}</strong>
              </div>
            </div>

            {/* Big Primary Generate Button */}
            <button
              onClick={onExportVideo}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
                transition: 'all 0.15s ease',
              }}
            >
              <Film size={18} />
              <span>Generate HD Video (MP4)</span>
            </button>

            <p style={{ fontSize: '10px', color: theme.textSecondary, textAlign: 'center', marginTop: '10px', marginBlockEnd: 0 }}>
              ⚡ Renders your subtitles, audio, custom text & styles with full hardware acceleration
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
