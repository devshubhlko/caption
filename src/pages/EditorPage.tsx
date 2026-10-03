import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw, FolderOpen, ImageIcon, Check, Search, Upload } from 'lucide-react';
import { Header } from '../components/Header';
import { ChangeImageModal } from '../components/ChangeImageModal';
import {
  useAppTheme,
  updateProjectState,
  getProjectImageUri,
  setProjectImageUri,
} from '../services/projectState';

// Color palette presets for canvas
const COLOR_PALETTES = [
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Midnight', hex: '#000000' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Indigo Glow', hex: '#4f46e5' },
  { name: 'Electric Violet', hex: '#7c3aed' },
  { name: 'Sunset Pink', hex: '#db2777' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Cyan Blue', hex: '#0284c7' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Cool Steel', hex: '#475569' },
  { name: 'Deep Forest', hex: '#14532d' },
];

export const EditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectType = (searchParams.get('type') as 'canvas' | 'image') || 'canvas';
  const aspectRatio = (searchParams.get('size') as '9:16' | '16:9') || '9:16';
  const { isDark, theme } = useAppTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState<boolean>(false);

  // Canvas State
  const [canvasBgColor, setCanvasBgColor] = useState<string>(
    isDark ? '#0f172a' : '#ffffff'
  );

  // Image State
  const [imageUri, setImageUri] = useState<string | null>(getProjectImageUri());

  const isPortrait = aspectRatio === '9:16';

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageUri(url);
      setProjectImageUri(url);
    }
  };

  const handleSelectImageFromModal = (url: string) => {
    setImageUri(url);
    setProjectImageUri(url);
  };

  const handleNext = () => {
    updateProjectState({
      projectType,
      aspectRatio,
      canvasBgColor,
      imageUri,
    });

    if (projectType === 'image' && !imageUri) {
      const confirmContinue = window.confirm(
        "You haven't selected an image yet. Would you like to pick one now (OK to pick, Cancel to continue anyway)?"
      );
      if (confirmContinue) {
        fileInputRef.current?.click();
        return;
      }
    }

    navigate(
      `/studio?type=${projectType}&size=${aspectRatio}&canvasBgColor=${encodeURIComponent(
        canvasBgColor
      )}&imageUri=${encodeURIComponent(imageUri || '')}`
    );
  };

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        style={{ display: 'none' }}
      />

      {/* Header Bar */}
      <Header
        title={projectType === 'canvas' ? 'Canvas Editor' : 'Image Editor'}
        rightAction={
          <button
            onClick={handleNext}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Next ➔
          </button>
        }
      />

      {/* Responsive Studio Split View */}
      <div className="studio-split-wrapper">
        {/* LEFT COLUMN: Settings & Options (Color Swatches / Image Picker) */}
        <div className="studio-left-settings">
          <div
            style={{
              width: '100%',
              borderRadius: '14px',
              padding: '16px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
            }}
          >
            {projectType === 'canvas' ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary, display: 'block' }}>
                      Select Canvas Color
                    </span>
                    <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                      Custom picker or palette
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#818cf8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      backgroundColor: theme.innerBg,
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {canvasBgColor}
                  </span>
                </div>

                {/* Custom Color Picker Input Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: theme.innerBg,
                    border: `1px solid ${theme.border}`,
                    marginBottom: '16px',
                  }}
                >
                  <label
                    style={{
                      position: 'relative',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: canvasBgColor,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      display: 'block',
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="color"
                      value={canvasBgColor.startsWith('#') && canvasBgColor.length === 7 ? canvasBgColor : '#0f172a'}
                      onChange={(e) => setCanvasBgColor(e.target.value)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      }}
                    />
                  </label>

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: theme.textPrimary, display: 'block' }}>
                      Custom Color Picker
                    </span>
                    <span style={{ fontSize: '10px', color: theme.textSecondary }}>
                      Click color swatch to open picker
                    </span>
                  </div>

                  {/* Manual HEX text box */}
                  <input
                    type="text"
                    value={canvasBgColor}
                    onChange={(e) => setCanvasBgColor(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    style={{
                      width: '76px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                      fontSize: '11px',
                      fontWeight: 700,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                {/* Swatches Grid */}
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: theme.textSecondary, marginBottom: '8px', display: 'block' }}>
                    Popular Presets
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                      padding: '2px 0',
                    }}
                  >
                    {COLOR_PALETTES.map((color) => {
                      const isSelected = canvasBgColor.toLowerCase() === color.hex.toLowerCase();
                      return (
                        <button
                          key={color.hex}
                          onClick={() => setCanvasBgColor(color.hex)}
                          style={{
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: color.hex,
                            border: isSelected ? '2.5px solid #6366f1' : '1.5px solid #334155',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                          }}
                          title={color.name}
                        >
                          {isSelected && (
                            <Check
                              size={18}
                              color={color.hex === '#ffffff' ? '#000000' : '#ffffff'}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary, display: 'block' }}>
                      Image Options
                    </span>
                    <span style={{ fontSize: '11px', color: theme.textSecondary }}>
                      Search Pexels or upload your own
                    </span>
                  </div>
                  {imageUri && (
                    <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 700 }}>
                      ✓ Image Loaded
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsChangeImageModalOpen(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  <ImageIcon size={18} />
                  <span>
                    {imageUri ? 'Change Photo (Live / Upload)' : 'Select Photo (Live / Upload)'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Output Canvas / Image Preview Viewport */}
        <div className="studio-right-output">
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: isPortrait ? '100%' : '100%',
                maxWidth: isPortrait ? '320px' : '560px',
                aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
                height: isPortrait ? 'min(520px, calc(100vh - 180px))' : 'auto',
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
              {projectType === 'canvas' ? (
                <div style={{ width: '100%', height: '100%' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {imageUri ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img
                        src={imageUri}
                        alt="Selected Frame"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {/* Floating Change Image Button */}
                      <button
                        onClick={() => setIsChangeImageModalOpen(true)}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          border: '1px solid #475569',
                          padding: '8px 12px',
                          borderRadius: '20px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backdropFilter: 'blur(6px)',
                        }}
                      >
                        <RefreshCw size={14} />
                        <span>Change</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsChangeImageModalOpen(true)}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        backgroundColor: '#090d16',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '30px',
                          backgroundColor: '#1e1e38',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#818cf8',
                          marginBottom: '10px',
                        }}
                      >
                        <ImageIcon size={32} />
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                        Select Photo (Live Search / Upload)
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                        Fits inside {aspectRatio} Frame
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#6366f1',
                          color: '#ffffff',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <FolderOpen size={16} />
                        <span>Open Gallery</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Image Modal */}
      <ChangeImageModal
        isOpen={isChangeImageModalOpen}
        currentImageUrl={imageUri}
        onSelectImage={handleSelectImageFromModal}
        onClose={() => setIsChangeImageModalOpen(false)}
      />
    </div>
  );
};
