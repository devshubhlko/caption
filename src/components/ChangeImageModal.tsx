import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import {
  searchPexelsPhotos,
  PexelsPhoto,
  PexelsOrientation,
  CURATED_BACKGROUNDS,
  CuratedBackground,
} from '../services/imageService';

interface ChangeImageModalProps {
  isOpen: boolean;
  currentImageUrl: string | null;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
}

const SEARCH_TAGS = [
  'Nature',
  'BMW',
  'Supercars',
  'Dark Aesthetic',
  'Night City',
  'Quotes Background',
  'Moody Nature',
  'Cyberpunk',
  'Minimalist',
  'Sunset',
];

export const ChangeImageModal: React.FC<ChangeImageModalProps> = ({
  isOpen,
  currentImageUrl,
  onSelectImage,
  onClose,
}) => {
  const { theme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'live' | 'upload'>('live');

  // Live Pexels Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [orientation, setOrientation] = useState<PexelsOrientation>('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentImageUrl);
  const [hasSearched, setHasSearched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial load config
  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentImageUrl);
    }
  }, [isOpen, currentImageUrl]);

  const performSearch = async (
    query: string,
    pageNum: number = 1,
    isNewSearch: boolean = true,
    activeOrientation: PexelsOrientation = orientation
  ) => {
    if (!query.trim()) return;
    
    if (isNewSearch) {
      setIsLoading(true);
      setPage(1);
      setHasSearched(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await searchPexelsPhotos(query, pageNum, 15, activeOrientation);
      if (isNewSearch) {
        setPhotos(result.photos);
      } else {
        setPhotos((prev) => [...prev, ...result.photos]);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim(), 1, true, orientation);
    }
  };

  const handleOrientationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextOrientation = e.target.value as PexelsOrientation;
    setOrientation(nextOrientation);
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim(), 1, true, nextOrientation);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    performSearch(tag, 1, true, orientation);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      performSearch(searchQuery, page + 1, false, orientation);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedUrl(url);
      onSelectImage(url);
      onClose();
    }
  };

  const handleConfirmSelect = (url: string) => {
    setSelectedUrl(url);
    onSelectImage(url);
    onClose();
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
        {/* Modal Header */}
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
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: theme.textPrimary }}>
                Change Image
              </h3>
              <p style={{ fontSize: '11px', color: theme.textSecondary }}>
                Search live HD photos or upload your own
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

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px',
            gap: '8px',
            backgroundColor: theme.innerBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={() => setActiveTab('live')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'live' ? '#6366f1' : 'transparent',
              color: activeTab === 'live' ? '#ffffff' : theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Search size={15} />
            <span>Live Search</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'upload' ? '#6366f1' : 'transparent',
              color: activeTab === 'upload' ? '#ffffff' : theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Upload size={15} />
            <span>Upload from Device</span>
          </button>
        </div>

        {/* Tab Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* TAB 1: LIVE SEARCH */}
          {activeTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Search Bar & Orientation Dropdown */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: theme.innerBg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px',
                      padding: '0 12px',
                      gap: '8px',
                    }}
                  >
                    <Search size={16} color={theme.textSecondary} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Nature, BMW, Quotes..."
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: theme.textPrimary,
                        fontSize: '13px',
                        padding: '10px 0',
                      }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ color: theme.textSecondary }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      padding: '0 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isLoading ? <Loader2 size={16} className="spinner" /> : 'Search'}
                  </button>
                </div>

                {/* Orientation Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                    Orientation:
                  </span>
                  <select
                    value={orientation}
                    onChange={handleOrientationChange}
                    style={{
                      flex: 1,
                      backgroundColor: theme.innerBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">All Orientations</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </form>

              {/* Quick Tag Chips */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}
              >
                {SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      backgroundColor: searchQuery.toLowerCase() === tag.toLowerCase() ? '#312e81' : theme.innerBg,
                      border: `1px solid ${searchQuery.toLowerCase() === tag.toLowerCase() ? '#6366f1' : theme.border}`,
                      color: searchQuery.toLowerCase() === tag.toLowerCase() ? '#a5b4fc' : theme.textSecondary,
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Photos Grid */}
              {isLoading ? (
                <div
                  style={{
                    padding: '40px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: theme.textSecondary,
                  }}
                >
                  <Loader2 size={28} className="spinner" color="#6366f1" />
                  <span style={{ fontSize: '13px' }}>Searching live HD photos...</span>
                </div>
              ) : photos.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: theme.textSecondary,
                    fontSize: '13px',
                  }}
                >
                  {!hasSearched 
                    ? "Enter a keyword above to search for images." 
                    : "No photos found. Try another search query."}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                  }}
                >
                  {photos.map((photo) => {
                    const isSelected = selectedUrl === photo.full || selectedUrl === photo.medium;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => handleConfirmSelect(photo.full)}
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? '#6366f1' : 'transparent'}`,
                          backgroundColor: '#1e293b',
                        }}
                      >
                        <img
                          src={photo.thumb}
                          alt={photo.alt}
                          crossOrigin="anonymous"
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.2s',
                          }}
                        />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: '#6366f1',
                              borderRadius: '50%',
                              padding: '2px',
                              color: '#ffffff',
                              display: 'flex',
                            }}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  style={{
                    marginTop: '8px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: theme.innerBg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={14} className="spinner" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      <span>Load More Photos</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 2: LOCAL UPLOAD */}
          {activeTab === 'upload' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                textAlign: 'center',
                border: `2px dashed ${theme.border}`,
                borderRadius: '16px',
                backgroundColor: theme.innerBg,
                gap: '12px',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={28} />
              </div>

              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: theme.textPrimary }}>
                  Upload Image from Device
                </h4>
                <p
                  style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    marginTop: '4px',
                    maxWidth: '260px',
                  }}
                >
                  Select any high-resolution JPG, PNG or WebP image from your gallery or computer.
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: '8px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                }}
              >
                <Upload size={16} />
                <span>Browse Files</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
