import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Type, Clock, X, PlusCircle } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { formatTimeHelper } from '../services/exportService';

interface AddCustomTextModalProps {
  isOpen: boolean;
  currentTime?: number;
  initialText?: string;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export const AddCustomTextModal: React.FC<AddCustomTextModalProps> = ({
  isOpen,
  initialText = '',
  onClose,
  onAdd,
}) => {
  const { theme } = useAppTheme();
  const [text, setText] = useState(initialText);

  // Sync initialText when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!text.trim()) {
      alert('Please type some text first.');
      return;
    }
    onAdd(text.trim());
  };

  const handleClose = () => {
    onClose();
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
            <Type size={18} color="#818cf8" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: theme.textPrimary }}>
              Add Custom Text
            </h3>
          </div>
          <button
            onClick={handleClose}
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

        {/* Text Input */}
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your custom caption, lyrics, or title..."
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
            onClick={handleClose}
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
            onClick={handleAdd}
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
            <PlusCircle size={16} />
            <span>Add Text</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
