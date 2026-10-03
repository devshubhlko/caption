import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ArrowRight,
  Sun,
  Moon,
  Video,
  Sparkles,
  Upload,
  Search,
  Check,
} from 'lucide-react';
import { useAppTheme, updateProjectState, setProjectImageUri } from '../services/projectState';
import {
  ImageRatioType,
  IMAGE_RATIO_CONFIGS,
  CURATED_BACKGROUNDS,
} from '../services/imageService';
import { ChangeImageModal } from '../components/ChangeImageModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ShieldAlert, LogOut } from 'lucide-react';
import { logout } from '../services/authService';

type ProjectCategory = 'video' | 'image';
type VideoProjectType = 'canvas' | 'image';
type VideoAspectRatio = '9:16' | '16:9';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, theme, toggleTheme } = useAppTheme();

  // Master Category Choice: Video vs Image
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>('video');

  // Video Project State (Preserves exact previous behavior)
  const [videoSelectedType, setVideoSelectedType] = useState<VideoProjectType>('canvas');
  const [videoSelectedSize, setVideoSelectedSize] = useState<VideoAspectRatio>('9:16');

  // Image Project State
  const [imageRatio, setImageRatio] = useState<ImageRatioType>('4:5');
  const [imageSourceType, setImageSourceType] = useState<'browse' | 'live'>('live');
  const [selectedImageUri, setSelectedImageUri] = useState<string>(CURATED_BACKGROUNDS[0].url);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  const localFileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImageUri(url);
      setProjectImageUri(url);
    }
  };

  const handleContinue = () => {
    if (projectCategory === 'video') {
      updateProjectState({
        projectType: videoSelectedType,
        aspectRatio: videoSelectedSize,
        imageUri: videoSelectedType === 'image' ? selectedImageUri : null,
      });
      if (videoSelectedType === 'image' && selectedImageUri) {
        setProjectImageUri(selectedImageUri);
      }
      navigate(`/editor?type=${videoSelectedType}&size=${videoSelectedSize}`);
    } else {
      // Image Project Flow
      navigate(
        `/image-studio?ratio=${imageRatio}&imageUri=${encodeURIComponent(selectedImageUri)}`
      );
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handlePasswordChanged = () => {
    setIsChangePasswordModalOpen(false);
    window.location.reload();
  };

  return (
    <div
      className="screen-scroll-container"
      style={{
        backgroundColor: theme.bg,
        padding: '28px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '860px' }}>
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={localFileInputRef}
          accept="image/*"
          onChange={handleLocalImageUpload}
          style={{ display: 'none' }}
        />

        {/* Header with Global Theme Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: theme.textPrimary,
                letterSpacing: '-0.5px',
              }}
            >
              Create Project
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: theme.textSecondary,
                marginTop: '4px',
                lineHeight: '18px',
              }}
            >
              Choose whether to create a Video Reel or an Image Quote
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Change Password"
            >
              <ShieldAlert size={20} />
            </button>

            <button
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: isDark ? '#fde047' : '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* STEP 1: Choose Media Format (Video vs Image) */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: theme.textPrimary,
              marginBottom: '10px',
            }}
          >
            1. Choose Format
          </h2>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Video Option */}
            <div
              onClick={() => setProjectCategory('video')}
              style={{
                flex: 1,
                borderRadius: '16px',
                padding: '14px',
                backgroundColor: projectCategory === 'video' ? theme.cardActiveBg : theme.cardBg,
                border: `2px solid ${projectCategory === 'video' ? '#6366f1' : theme.border}`,
                position: 'relative',
                minHeight: '130px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: projectCategory === 'video' ? '#312e81' : theme.innerBg,
                  color: projectCategory === 'video' ? '#6366f1' : theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                }}
              >
                <Video size={24} />
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: projectCategory === 'video' ? '#6366f1' : theme.textPrimary,
                  marginBottom: '3px',
                }}
              >
                Video Project
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: '14px',
                }}
              >
                Reels, animated captions & audio
              </span>
              {projectCategory === 'video' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>

            {/* Image Option */}
            <div
              onClick={() => setProjectCategory('image')}
              style={{
                flex: 1,
                borderRadius: '16px',
                padding: '14px',
                backgroundColor: projectCategory === 'image' ? theme.cardActiveBg : theme.cardBg,
                border: `2px solid ${projectCategory === 'image' ? '#6366f1' : theme.border}`,
                position: 'relative',
                minHeight: '130px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: projectCategory === 'image' ? '#312e81' : theme.innerBg,
                  color: projectCategory === 'image' ? '#6366f1' : theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                }}
              >
                <ImageIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: projectCategory === 'image' ? '#6366f1' : theme.textPrimary,
                  marginBottom: '3px',
                }}
              >
                Image Quote / Poster
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: '14px',
                }}
              >
                HD photo, typography & styling
              </span>
              {projectCategory === 'image' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* FLOW A: VIDEO PROJECT (Untouched original video creation flow) */}
        {/* ------------------------------------------------------------- */}
        {projectCategory === 'video' && (
          <>
            {/* Section 2: Select Type */}
            <section style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  marginBottom: '10px',
                }}
              >
                2. Select Type
              </h2>

              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Canvas Option */}
                <div
                  onClick={() => setVideoSelectedType('canvas')}
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    padding: '14px',
                    backgroundColor: videoSelectedType === 'canvas' ? theme.cardActiveBg : theme.cardBg,
                    border: `1.5px solid ${videoSelectedType === 'canvas' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    minHeight: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: videoSelectedType === 'canvas' ? '#312e81' : theme.innerBg,
                      color: videoSelectedType === 'canvas' ? '#6366f1' : theme.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <Palette size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: videoSelectedType === 'canvas' ? '#6366f1' : theme.textPrimary,
                      marginBottom: '2px',
                    }}
                  >
                    Canvas
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      lineHeight: '14px',
                    }}
                  >
                    Blank canvas for text & graphics
                  </span>
                  {videoSelectedType === 'canvas' && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>

                {/* Image Option */}
                <div
                  onClick={() => setVideoSelectedType('image')}
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    padding: '14px',
                    backgroundColor: videoSelectedType === 'image' ? theme.cardActiveBg : theme.cardBg,
                    border: `1.5px solid ${videoSelectedType === 'image' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    minHeight: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: videoSelectedType === 'image' ? '#312e81' : theme.innerBg,
                      color: videoSelectedType === 'image' ? '#6366f1' : theme.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <ImageIcon size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: videoSelectedType === 'image' ? '#6366f1' : theme.textPrimary,
                      marginBottom: '2px',
                    }}
                  >
                    Image
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      lineHeight: '14px',
                    }}
                  >
                    Import photos & background media
                  </span>
                  {videoSelectedType === 'image' && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Select Size */}
            <section style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  marginBottom: '10px',
                }}
              >
                3. Select Size
              </h2>

              <div style={{ display: 'flex', gap: '12px' }}>
                {/* 9:16 Option */}
                <div
                  onClick={() => setVideoSelectedSize('9:16')}
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    padding: '14px',
                    backgroundColor: videoSelectedSize === '9:16' ? theme.cardActiveBg : theme.cardBg,
                    border: `1.5px solid ${videoSelectedSize === '9:16' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    minHeight: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '34px',
                        borderRadius: '4px',
                        border: `1.5px solid ${videoSelectedSize === '9:16' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: videoSelectedSize === '9:16' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>9:16</span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: videoSelectedSize === '9:16' ? '#6366f1' : theme.textPrimary,
                      marginBottom: '2px',
                    }}
                  >
                    9 : 16
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      lineHeight: '14px',
                    }}
                  >
                    Reels / Shorts / TikTok
                  </span>

                  {videoSelectedSize === '9:16' && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>

                {/* 16:9 Option */}
                <div
                  onClick={() => setVideoSelectedSize('16:9')}
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    padding: '14px',
                    backgroundColor: videoSelectedSize === '16:9' ? theme.cardActiveBg : theme.cardBg,
                    border: `1.5px solid ${videoSelectedSize === '16:9' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    minHeight: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        borderRadius: '4px',
                        border: `1.5px solid ${videoSelectedSize === '16:9' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: videoSelectedSize === '16:9' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>16:9</span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: videoSelectedSize === '16:9' ? '#6366f1' : theme.textPrimary,
                      marginBottom: '2px',
                    }}
                  >
                    16 : 9
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      lineHeight: '14px',
                    }}
                  >
                    YouTube / Landscape
                  </span>

                  {videoSelectedSize === '16:9' && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 4: Select Background Media for Video */}
            {videoSelectedType === 'image' && (
              <section style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: theme.textPrimary,
                    marginBottom: '10px',
                  }}
                >
                  4. Background Photo / Media
                </h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Option A: Browse Local Media */}
                  <button
                    type="button"
                    onClick={() => localFileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: theme.cardBg,
                      border: `1.5px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: theme.textPrimary,
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <Upload size={18} color="#6366f1" />
                    <span>Browse / Upload</span>
                  </button>

                  {/* Option B: Get Live Image */}
                  <button
                    type="button"
                    onClick={() => setIsChangeImageModalOpen(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: theme.cardBg,
                      border: `1.5px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: theme.textPrimary,
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <Search size={18} color="#6366f1" />
                    <span>Get Live Image</span>
                  </button>
                </div>

                {/* Media Preview Card */}
                {selectedImageUri && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: theme.innerBg,
                      border: `1px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#1e293b',
                        }}
                      >
                        <img
                          src={selectedImageUri}
                          alt="Selected Media"
                          crossOrigin="anonymous"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, display: 'block' }}>
                          Selected Background Media
                        </span>
                        <span style={{ fontSize: '10px', color: theme.textSecondary }}>
                          Ready for captions & animation
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsChangeImageModalOpen(true)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: theme.cardBg,
                        border: `1px solid ${theme.border}`,
                        color: '#6366f1',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FLOW B: IMAGE PROJECT (Exact user requested aspect ratio table) */}
        {/* ------------------------------------------------------------- */}
        {projectCategory === 'image' && (
          <>
            {/* Section 2: Select Aspect Ratio */}
            <section style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  marginBottom: '10px',
                }}
              >
                2. Select Ratio & Resolution
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '8px' }}>
                {/* Option 1: Portrait (4:5, 1080 x 1350) */}
                <div
                  onClick={() => setImageRatio('4:5')}
                  style={{
                    borderRadius: '14px',
                    padding: '10px 8px',
                    backgroundColor: imageRatio === '4:5' ? theme.cardActiveBg : theme.cardBg,
                    border: `2px solid ${imageRatio === '4:5' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '125px',
                  }}
                >
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '30px',
                        borderRadius: '4px',
                        border: `1.5px solid ${imageRatio === '4:5' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: imageRatio === '4:5' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>4:5</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: imageRatio === '4:5' ? '#6366f1' : theme.textPrimary, marginBottom: '2px', textAlign: 'center' }}>
                    Portrait
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: imageRatio === '4:5' ? '#818cf8' : theme.textPrimary, marginBottom: '2px' }}>
                    4 : 5
                  </span>
                  <span style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', lineHeight: '11px' }}>
                    1080 × 1350 px
                  </span>

                  {imageRatio === '4:5' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#6366f1' }}>
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </div>

                {/* Option 2: Stories / Reels (9:16, 1080 x 1920) */}
                <div
                  onClick={() => setImageRatio('9:16')}
                  style={{
                    borderRadius: '14px',
                    padding: '10px 8px',
                    backgroundColor: imageRatio === '9:16' ? theme.cardActiveBg : theme.cardBg,
                    border: `2px solid ${imageRatio === '9:16' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '125px',
                  }}
                >
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '32px',
                        borderRadius: '4px',
                        border: `1.5px solid ${imageRatio === '9:16' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: imageRatio === '9:16' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>9:16</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: imageRatio === '9:16' ? '#6366f1' : theme.textPrimary, marginBottom: '2px', textAlign: 'center' }}>
                    Stories
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: imageRatio === '9:16' ? '#818cf8' : theme.textPrimary, marginBottom: '2px' }}>
                    9 : 16
                  </span>
                  <span style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', lineHeight: '11px' }}>
                    1080 × 1920 px
                  </span>

                  {imageRatio === '9:16' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#6366f1' }}>
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </div>

                {/* Option 3: Landscape (1.91:1, 1080 x 566) */}
                <div
                  onClick={() => setImageRatio('1.91:1')}
                  style={{
                    borderRadius: '14px',
                    padding: '10px 8px',
                    backgroundColor: imageRatio === '1.91:1' ? theme.cardActiveBg : theme.cardBg,
                    border: `2px solid ${imageRatio === '1.91:1' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '125px',
                  }}
                >
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '18px',
                        borderRadius: '4px',
                        border: `1.5px solid ${imageRatio === '1.91:1' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: imageRatio === '1.91:1' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '6px', fontWeight: 700, color: '#a5b4fc' }}>1.91:1</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: imageRatio === '1.91:1' ? '#6366f1' : theme.textPrimary, marginBottom: '2px', textAlign: 'center' }}>
                    Landscape
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: imageRatio === '1.91:1' ? '#818cf8' : theme.textPrimary, marginBottom: '2px' }}>
                    1.91 : 1
                  </span>
                  <span style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', lineHeight: '11px' }}>
                    1080 × 566 px
                  </span>

                  {imageRatio === '1.91:1' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#6366f1' }}>
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </div>

                {/* Option 4: Widescreen (16:9, 1920 x 1080) */}
                <div
                  onClick={() => setImageRatio('16:9')}
                  style={{
                    borderRadius: '14px',
                    padding: '10px 8px',
                    backgroundColor: imageRatio === '16:9' ? theme.cardActiveBg : theme.cardBg,
                    border: `2px solid ${imageRatio === '16:9' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '125px',
                  }}
                >
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `1.5px solid ${imageRatio === '16:9' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: imageRatio === '16:9' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>16:9</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: imageRatio === '16:9' ? '#6366f1' : theme.textPrimary, marginBottom: '2px', textAlign: 'center' }}>
                    Widescreen
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: imageRatio === '16:9' ? '#818cf8' : theme.textPrimary, marginBottom: '2px' }}>
                    16 : 9
                  </span>
                  <span style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', lineHeight: '11px' }}>
                    1920 × 1080 px
                  </span>

                  {imageRatio === '16:9' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#6366f1' }}>
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </div>

                {/* Option 5: Square (1:1, 1080 x 1080) */}
                <div
                  onClick={() => setImageRatio('1:1')}
                  style={{
                    borderRadius: '14px',
                    padding: '10px 8px',
                    backgroundColor: imageRatio === '1:1' ? theme.cardActiveBg : theme.cardBg,
                    border: `2px solid ${imageRatio === '1:1' ? '#6366f1' : theme.border}`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '125px',
                  }}
                >
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: `1.5px solid ${imageRatio === '1:1' ? '#6366f1' : theme.textSecondary}`,
                        backgroundColor: imageRatio === '1:1' ? '#312e81' : theme.innerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#a5b4fc' }}>1:1</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: imageRatio === '1:1' ? '#6366f1' : theme.textPrimary, marginBottom: '2px', textAlign: 'center' }}>
                    Square
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: imageRatio === '1:1' ? '#818cf8' : theme.textPrimary, marginBottom: '2px' }}>
                    1 : 1
                  </span>
                  <span style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', lineHeight: '11px' }}>
                    1080 × 1080 px
                  </span>

                  {imageRatio === '1:1' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', color: '#6366f1' }}>
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Select Background Photo */}
            <section style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  marginBottom: '10px',
                }}
              >
                3. Background Image
              </h2>

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* Option A: Browse Local File */}
                <button
                  type="button"
                  onClick={() => localFileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: theme.cardBg,
                    border: `1.5px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: theme.textPrimary,
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <Upload size={18} color="#6366f1" />
                  <span>Browse Image</span>
                </button>

                {/* Option B: Get Live Image from Pexels */}
                <button
                  type="button"
                  onClick={() => setIsChangeImageModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: theme.cardBg,
                    border: `1.5px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: theme.textPrimary,
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <Search size={18} color="#6366f1" />
                  <span>Get Live Image</span>
                </button>
              </div>

              {/* Quick Preview of selected background */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: theme.innerBg,
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#1e293b',
                    }}
                  >
                    <img
                      src={selectedImageUri}
                      alt="Selected"
                      crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, display: 'block' }}>
                      Active Photo
                    </span>
                    <span style={{ fontSize: '10px', color: theme.textSecondary }}>
                      Ready for typography & export
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsChangeImageModalOpen(true)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    color: '#6366f1',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            </section>
          </>
        )}

        {/* Selected Summary Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.cardBg,
            marginBottom: '20px',
          }}
        >
          <Info size={19} color="#818cf8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: theme.textSecondary }}>
            {projectCategory === 'video' ? (
              <>
                Selected: <strong style={{ color: '#818cf8' }}>Video ({videoSelectedType === 'canvas' ? 'Canvas' : 'Image'})</strong> •{' '}
                <strong style={{ color: '#818cf8' }}>{videoSelectedSize}</strong>
              </>
            ) : (
              <>
                Selected: <strong style={{ color: '#818cf8' }}>Image Quote</strong> •{' '}
                <strong style={{ color: '#818cf8' }}>
                  {IMAGE_RATIO_CONFIGS[imageRatio]?.name} ({IMAGE_RATIO_CONFIGS[imageRatio]?.ratioLabel} • {IMAGE_RATIO_CONFIGS[imageRatio]?.description})
                </strong>
              </>
            )}
          </span>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          style={{
            backgroundColor: '#6366f1',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
        >
          <span>
            {projectCategory === 'video' ? 'Continue to Video Studio' : 'Start Designing Image'}
          </span>
          <ArrowRight size={18} />
        </button>

        {/* Change Image Modal */}
        <ChangeImageModal
          isOpen={isChangeImageModalOpen}
          currentImageUrl={selectedImageUri}
          onSelectImage={(url) => setSelectedImageUri(url)}
          onClose={() => setIsChangeImageModalOpen(false)}
        />
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          onSuccess={handlePasswordChanged}
        />
      </div>
    </div>
  );
};
