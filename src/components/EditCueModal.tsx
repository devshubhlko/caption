import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Clock, X, Check } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { SubtitleCue } from '../services/transcriptionService';
import { formatTimeHelper } from '../services/exportService';

interface EditCueModalProps {
  isOpen: boolean;
  cue: SubtitleCue | null;
  onClose: () => void;
  onSave: (newText: string) => void;
}

export const EditCueModal: React.FC<EditCueModalProps> = ({
  isOpen,
  cue,
  onClose,
  onSave,
}) => {
  const { theme } = useAppTheme();
  const [text, setText] = useState('');

  useEffect(() => {
    if (cue) {
      setText(cue.text);
    }
  }, [cue]);

  if (!isOpen || !cue) return null;

  const handleSave = () => {
    if (!text.trim()) {
      alert('Caption text cannot be empty.');
      return;
    }
    onSave(text.trim());
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
          maxWidth: '420px',
          borderRadius: '14px',
          padding: '18px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Pencil size={18} color="#818cf8" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: theme.textPrimary }}>
              Edit Caption Text
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              borderRadius: '6px',
              color: theme.textSecondary,
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Timestamp Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            marginBottom: '12px',
          }}
        >
          <Clock size={14} color="#818cf8" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>
            Timestamp: {formatTimeHelper(cue.start)} ➔ {formatTimeHelper(cue.end)}
          </span>
        </div>

        {/* Input */}
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter caption text..."
          style={{
            width: '100%',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '14px',
            lineHeight: 1.4,
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.innerBg,
            color: theme.textPrimary,
            marginBottom: '14px',
            resize: 'none',
          }}
          autoFocus
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.innerBg,
              color: theme.textSecondary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              flex: 1.5,
              padding: '11px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Check size={16} />
            <span>OK / Update</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
