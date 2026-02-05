/**
 * Filter type selector buttons
 */

import type { FilterType } from '../../core/types.ts';

interface FilterTypeSelectorProps {
  value: FilterType;
  onChange: (type: FilterType) => void;
}

const FILTER_TYPES: { type: FilterType; label: string; description: string }[] = [
  { type: 'lowpass', label: 'LP', description: 'Low Pass - removes highs' },
  { type: 'highpass', label: 'HP', description: 'High Pass - removes lows' },
  { type: 'bandpass', label: 'BP', description: 'Band Pass - keeps middle frequencies' },
];

export function FilterTypeSelector({ value, onChange }: FilterTypeSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
      }}
    >
      {FILTER_TYPES.map(({ type, label, description }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          title={description}
          style={{
            padding: '8px 16px',
            background: value === type ? '#2a3a2a' : '#1a1a1a',
            border: value === type ? '2px solid #4ade80' : '2px solid #333',
            borderRadius: '4px',
            color: value === type ? '#4ade80' : '#888',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: value === type ? 'bold' : 'normal',
            transition: 'all 0.15s ease',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
