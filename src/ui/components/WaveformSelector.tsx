/**
 * Waveform type selector with visual icons
 */

import type { OscillatorType } from '../../core/types.ts';

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (type: OscillatorType) => void;
}

const WAVEFORMS: { type: OscillatorType; label: string; path: string }[] = [
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

export function WaveformSelector({ value, onChange }: WaveformSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        justifyContent: 'center',
      }}
    >
      {WAVEFORMS.map(({ type, label, path }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          title={label}
          style={{
            width: '44px',
            height: '44px',
            background: value === type ? '#2a3a2a' : '#1a1a1a',
            border: value === type ? '2px solid #4ade80' : '2px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 40 40">
            <path
              d={path}
              fill="none"
              stroke={value === type ? '#4ade80' : '#666'}
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
