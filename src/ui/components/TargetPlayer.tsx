/**
 * Target sound player with Play Target / Play Yours / Compare buttons
 */

import { useState, useCallback } from 'react';

interface TargetPlayerProps {
  onPlayTarget: () => void;
  onPlayYours: () => void;
  onCompare: () => void;
  disabled?: boolean;
}

export function TargetPlayer({
  onPlayTarget,
  onPlayYours,
  onCompare,
  disabled = false,
}: TargetPlayerProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handlePlay = useCallback(
    (action: () => void, buttonId: string) => {
      if (disabled) return;
      setActiveButton(buttonId);
      action();
      // Reset after a short delay
      setTimeout(() => setActiveButton(null), 600);
    },
    [disabled]
  );

  const buttonStyle = (id: string, isPrimary: boolean = false) => ({
    padding: '12px 20px',
    background: activeButton === id
      ? (isPrimary ? '#16a34a' : '#2a2a2a')
      : (isPrimary ? 'linear-gradient(145deg, #22c55e, #16a34a)' : '#1a1a1a'),
    border: isPrimary ? 'none' : '1px solid #333',
    borderRadius: '8px',
    color: isPrimary ? '#fff' : '#888',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: isPrimary ? 600 : 400,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        background: '#0a0a0a',
        borderRadius: '8px',
        border: '1px solid #222',
      }}
    >
      <button
        onClick={() => handlePlay(onPlayTarget, 'target')}
        disabled={disabled}
        style={buttonStyle('target', true)}
      >
        <span style={{ fontSize: '16px' }}>▶</span>
        Play Target
      </button>

      <button
        onClick={() => handlePlay(onPlayYours, 'yours')}
        disabled={disabled}
        style={buttonStyle('yours')}
      >
        <span style={{ fontSize: '16px' }}>▶</span>
        Play Yours
      </button>

      <button
        onClick={() => handlePlay(onCompare, 'compare')}
        disabled={disabled}
        style={buttonStyle('compare')}
        title="Plays target, then yours, back to back"
      >
        <span style={{ fontSize: '14px' }}>⟷</span>
        Compare
      </button>
    </div>
  );
}
