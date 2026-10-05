import React, { useRef } from 'react';
import { AlignLeft, Mic, FileText, Pencil, Loader2 } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { SubtitleCue } from '../services/transcriptionService';
import { formatTimeHelper } from '../services/exportService';

interface CaptionsPanelProps {
  selectedLang: 'hi' | 'hinglish';
  isTranscribing: boolean;
  onLanguageChange: (lang: 'hi' | 'hinglish') => void;
  onAutoSpeechClick: () => void;
  onImportSrt: (file: File) => void;
  subtitles: SubtitleCue[];
  captionSource: string | null;
  currentTime: number;
  onClearSubtitles: () => void;
  onEditCue: (cue: SubtitleCue) => void;
  hasAudio: boolean;
}

export const CaptionsPanel: React.FC<CaptionsPanelProps> = ({
  selectedLang,
  isTranscribing,
  onLanguageChange,
  onAutoSpeechClick,
  onImportSrt,
  subtitles,
  captionSource,
  currentTime,
  onClearSubtitles,
  onEditCue,
  hasAudio,
}) => {
  const { theme } = useAppTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportSrt(e.target.files[0]);
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
      {/* Hidden File Input for Subtitles */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".srt,.vtt,text/plain"
        onChange={handleFileChange}
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
        <AlignLeft size={18} color="#818cf8" />
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary }}>
          Captions
        </h2>
      </div>

      {/* Language Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textSecondary }}>
          Language:
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onLanguageChange('hi')}
            disabled={isTranscribing}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              border: `1px solid ${selectedLang === 'hi' ? '#6366f1' : theme.border}`,
              backgroundColor: selectedLang === 'hi' ? '#312e81' : theme.innerBg,
              color: selectedLang === 'hi' ? '#ffffff' : '#94a3b8',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: isTranscribing ? 'not-allowed' : 'pointer',
            }}
          >
            {isTranscribing && selectedLang === 'hi' && (
              <Loader2 size={12} className="animate-spin" />
            )}
            <span>Hindi</span>
          </button>

          <button
            onClick={() => onLanguageChange('hinglish')}
            disabled={isTranscribing}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              border: `1px solid ${selectedLang === 'hinglish' ? '#6366f1' : theme.border}`,
              backgroundColor: selectedLang === 'hinglish' ? '#312e81' : theme.innerBg,
              color: selectedLang === 'hinglish' ? '#ffffff' : '#94a3b8',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: isTranscribing ? 'not-allowed' : 'pointer',
            }}
          >
            {isTranscribing && selectedLang === 'hinglish' && (
              <Loader2 size={12} className="animate-spin" />
            )}
            <span>Hinglish</span>
          </button>
        </div>
      </div>

      {/* Caption Options Grid */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {/* 1. Auto Speech */}
        <button
          onClick={onAutoSpeechClick}
          disabled={isTranscribing}
          style={{
            flex: 1,
            borderRadius: '10px',
            padding: '10px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: isTranscribing ? 'not-allowed' : 'pointer',
            opacity: isTranscribing ? 0.6 : 1,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              backgroundColor: '#1e1e38',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px',
              color: '#818cf8',
            }}
          >
            {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.textPrimary, textAlign: 'center' }}>
            1. Auto Speech
          </span>
          <span style={{ color: '#64748b', fontSize: '9px', textAlign: 'center', marginTop: '2px' }}>
            {hasAudio ? 'From active audio' : 'Pick MP3 / WAV'}
          </span>
        </button>

        {/* 2. Import SRT */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            borderRadius: '10px',
            padding: '10px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              backgroundColor: '#1e1e38',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px',
              color: '#818cf8',
            }}
          >
            <FileText size={18} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.textPrimary, textAlign: 'center' }}>
            2. Import SRT
          </span>
          <span style={{ color: '#64748b', fontSize: '9px', textAlign: 'center', marginTop: '2px' }}>
            Subtitle file
          </span>
        </button>
      </div>

      {/* Loaded Subtitles Indicator & List */}
      {subtitles.length > 0 && (
        <div
          style={{
            borderRadius: '10px',
            padding: '10px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700 }}>
              {subtitles.length} Captions Loaded
            </span>
            <button
              onClick={onClearSubtitles}
              style={{
                color: '#ef4444',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>

          {captionSource && (
            <p style={{ color: '#64748b', fontSize: '9px', marginTop: '2px', marginBottom: '6px' }}>
              Source: {captionSource} • ✏️ Tap any item to edit text
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {subtitles.slice(0, 10).map((cue) => {
              const isCurrent = currentTime >= cue.start && currentTime <= cue.end;
              return (
                <div
                  key={cue.id}
                  onClick={() => onEditCue(cue)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isCurrent ? '#312e81' : theme.cardBg,
                    border: `1px solid ${isCurrent ? '#6366f1' : theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: '#818cf8', fontSize: '9px', fontWeight: 700, minWidth: '32px' }}>
                    {formatTimeHelper(cue.start)}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      flex: 1,
                      color: isCurrent ? '#ffffff' : theme.textPrimary,
                      fontWeight: isCurrent ? 700 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cue.text}
                  </span>
                  <Pencil size={12} color={isCurrent ? '#ffffff' : '#818cf8'} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
