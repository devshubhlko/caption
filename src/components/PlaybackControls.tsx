import React from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { useAppTheme } from '../services/projectState';
import { formatTimeHelper } from '../services/exportService';

interface PlaybackControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlayPause: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlayPause,
}) => {
  const { theme } = useAppTheme();

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '12px',
        padding: '10px 14px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
        marginBottom: '12px',
      }}
    >
      {/* Seek Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: theme.textSecondary,
            minWidth: '36px',
            textAlign: 'center',
          }}
        >
          {formatTimeHelper(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 15}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          style={{
            flex: 1,
            height: '6px',
            accentColor: '#6366f1',
            cursor: 'pointer',
          }}
        />

        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: theme.textSecondary,
            minWidth: '36px',
            textAlign: 'center',
          }}
        >
          {formatTimeHelper(duration)}
        </span>
      </div>

      {/* Button Controls Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            borderRadius: '6px',
            color: theme.textSecondary,
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Rewind 5s"
        >
          <RotateCcw size={15} />
          <span>-5s</span>
        </button>

        <button
          onClick={onTogglePlayPause}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '21px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(99, 102, 241, 0.35)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 5))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            borderRadius: '6px',
            color: theme.textSecondary,
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Forward 5s"
        >
          <span>+5s</span>
          <RotateCw size={15} />
        </button>
      </div>
    </div>
  );
};
