/**
 * LFO Waveform type selector with visual icons
 * Same visual style as WaveformSelector but typed for LFOWaveform
 */

import type { LFOWaveform } from '../../core/types.ts';

interface LFOWaveformSelectorProps {
  value: LFOWaveform;
  onChange: (type: LFOWaveform) => void;
  /** Smaller size for compact layouts */
  compact?: boolean;
}

const WAVEFORMS: { type: LFOWaveform; label: string; path: string }[] = [
  {
    type: 'sine',
    label: 'Sine',
    path: 'M 0 20 Q 10 0, 20 20 Q 30 40, 40 20',
  },
  {
    type: 'triangle',
    label: 'Triangle',
    path: 'M 0 20 L 10 0 L 30 40 L 40 20',
  },
  {
    type: 'sawtooth',
    label: 'Saw',
    path: 'M 0 40 L 20 0 L 20 40 L 40 0',
  },
  {
    type: 'square',
    label: 'Square',
    path: 'M 0 40 L 0 0 L 20 0 L 20 40 L 40 40 L 40 0',
  },
];

export function LFOWaveformSelector({ value, onChange, compact = false }: LFOWaveformSelectorProps) {
  const buttonSize = compact ? 36 : 48;
  const svgSize = compact ? 28 : 40;

  return (
    <div
      style={{
        display: 'flex',
        gap: compact ? '4px' : '8px',
      }}
    >
      {WAVEFORMS.map(({ type, label, path }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          title={label}
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            background: value === type ? '#2a2a3a' : '#1a1a1a',
            border: value === type ? '2px solid #818cf8' : '2px solid #333',
            borderRadius: compact ? '6px' : '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width={svgSize} height={svgSize} viewBox="0 0 40 40">
            <path
              d={path}
              fill="none"
              stroke={value === type ? '#818cf8' : '#666'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
