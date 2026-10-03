import React, { useRef } from 'react';
import { Music, Plus, Trash2, Sparkles, RefreshCw, ImageIcon, Loader2 } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { formatTimeHelper } from '../services/exportService';

interface AudioPanelProps {
  customAudio: { name: string; uri: string; size?: number } | null;
  duration: number;
  isTranscribing: boolean;
  onPickAudio: (file: File) => void;
  onRemoveAudio: () => void;
  onAutoTranscribeAudio: () => void;
  projectType: 'canvas' | 'image';
  currentImageUri: string;
  onPickImage: () => void;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({
  customAudio,
  duration,
  isTranscribing,
  onPickAudio,
  onRemoveAudio,
  onAutoTranscribeAudio,
  projectType,
  currentImageUri,
  onPickImage,
}) => {
  const { theme } = useAppTheme();
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPickAudio(e.target.files[0]);
      e.target.value = '';
    }
  };

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
      {/* Hidden Audio File Input */}
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*,video/*"
        onChange={handleAudioChange}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <Music size={18} color="#818cf8" />
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary }}>
          Audio Track
        </h2>
      </div>

      {customAudio ? (
        <div
          style={{
            borderRadius: '10px',
            padding: '12px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* File Info Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#312e81',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
                flexShrink: 0,
              }}
            >
              <Music size={18} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: theme.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {customAudio.name}
              </p>
              <p style={{ color: '#818cf8', fontSize: '10px', marginTop: '1px' }}>
                ● Synced Duration ({formatTimeHelper(duration)})
              </p>
            </div>

            <button
              onClick={onRemoveAudio}
              style={{
                padding: '6px',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
              }}
              title="Remove Audio"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* 1-Click Auto Transcribe from Active Audio */}
          <button
            onClick={onAutoTranscribeAudio}
            disabled={isTranscribing}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isTranscribing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
            }}
          >
            {isTranscribing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>
              {isTranscribing
                ? 'Transcribing Audio...'
                : '⚡ Generate Captions from this Audio'}
            </span>
          </button>

          {/* Change Audio Button */}
          <button
            onClick={() => audioInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              backgroundColor: '#334155',
              color: '#ffffff',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Change Audio</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => audioInputRef.current?.click()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '10px',
            padding: '12px',
            border: `1.5px dashed ${theme.border}`,
            backgroundColor: theme.innerBg,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Plus size={20} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: theme.textPrimary }}>
              Add Audio Track
            </p>
            <p style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '1px' }}>
              Auto-syncs video duration to music
            </p>
          </div>
        </button>
      )}

      {/* For Image Projects: Change Background Image option */}
      {projectType === 'image' && (
        <button
          onClick={onPickImage}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            backgroundColor: '#334155',
            color: '#ffffff',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            marginTop: '12px',
            cursor: 'pointer',
          }}
        >
          <ImageIcon size={14} />
          <span>{currentImageUri ? 'Change Background Image' : 'Pick Image'}</span>
        </button>
      )}
    </div>
  );
};
