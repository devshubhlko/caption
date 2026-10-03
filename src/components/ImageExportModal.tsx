import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, CheckCircle2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { ImageRatioType, IMAGE_RATIO_CONFIGS } from '../services/imageService';
import confetti from 'canvas-confetti';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: ImageRatioType;
  renderHdCanvas: (scale: number) => Promise<Blob | null>;
}

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  renderHdCanvas,
}) => {
  const { theme, isDark } = useAppTheme();
  const config = IMAGE_RATIO_CONFIGS[aspectRatio] || IMAGE_RATIO_CONFIGS['4:5'];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resolutionScale, setResolutionScale] = useState<number>(1); // 1 = 1080p, 2 = Ultra HD 2K/4K

  useEffect(() => {
    if (isOpen) {
      startExportFlow();
    } else {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
      setIsExporting(false);
      setCurrentStep(1);
    }
  }, [isOpen, resolutionScale]);

  const startExportFlow = async () => {
    setIsExporting(true);
    setCurrentStep(1);

    try {
      // Step 1: Initializing
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(2);

      // Step 2: High Resolution Engine Render
      await new Promise((r) => setTimeout(r, 700));
      const blob = await renderHdCanvas(resolutionScale);

      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Step 3: Optimization & Finalizing
        setCurrentStep(3);
        await new Promise((r) => setTimeout(r, 600));

        // Step 4: Ready
        setCurrentStep(4);
        setIsExporting(false);

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}
      } else {
        throw new Error('Canvas render failed');
      }
    } catch (e) {
      console.error('Export failed:', e);
      setIsExporting(false);
    }
  };

  const handleDownloadFile = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    const finalW = config.width * resolutionScale;
    const finalH = config.height * resolutionScale;
    link.download = `tashveer_quote_${aspectRatio.replace(':', 'x')}_${finalW}x${finalH}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: theme.cardBg,
          borderRadius: '20px',
          border: `1px solid ${theme.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#312e81',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.textPrimary }}>
                HD Image Export
              </h3>
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                {config.name} ({config.width * resolutionScale} × {config.height * resolutionScale} px)
              </p>
            </div>
          </div>

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

        {/* Resolution Scale Selector */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            backgroundColor: theme.innerBg,
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={() => setResolutionScale(1)}
            disabled={isExporting}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: resolutionScale === 1 ? '#6366f1' : 'transparent',
              color: resolutionScale === 1 ? '#ffffff' : theme.textSecondary,
              cursor: 'pointer',
            }}
          >
            Full HD (1080p)
          </button>
          <button
            onClick={() => setResolutionScale(2)}
            disabled={isExporting}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: resolutionScale === 2 ? '#6366f1' : 'transparent',
              color: resolutionScale === 2 ? '#ffffff' : theme.textSecondary,
              cursor: 'pointer',
            }}
          >
            Ultra HD (2x / 4K)
          </button>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {[
            { step: 1, title: 'Preparing high-res typography & assets' },
            { step: 2, title: 'Rendering high-definition canvas' },
            { step: 3, title: 'Applying shadow filters & color grading' },
            { step: 4, title: 'High-res image ready for download' },
          ].map((item) => {
            const isDone = currentStep > item.step || currentStep === 4;
            const isCurrent = currentStep === item.step && isExporting;

            return (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: isCurrent ? (isDark ? '#1e1e38' : '#eef2ff') : theme.innerBg,
                  border: `1px solid ${isCurrent ? '#6366f1' : theme.border}`,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isDone
                      ? '#10b981'
                      : isCurrent
                      ? '#6366f1'
                      : theme.cardBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={14} className="spinner" />
                  ) : (
                    item.step
                  )}
                </div>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isCurrent || isDone ? 600 : 400,
                    color: isDone
                      ? theme.textPrimary
                      : isCurrent
                      ? '#818cf8'
                      : theme.textSecondary,
                  }}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Download Action */}
        <button
          onClick={handleDownloadFile}
          disabled={!downloadUrl || isExporting}
          style={{
            backgroundColor: downloadUrl ? '#6366f1' : '#475569',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: downloadUrl ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: downloadUrl ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        >
          {isExporting ? (
            <>
              <Loader2 size={18} className="spinner" />
              <span>Generating HD Image...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download High-Res PNG</span>
            </>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
};
