/**
 * Filter type selector buttons
 */

import type { FilterType } from '../../core/types.ts';
import { cn } from '../utils/cn.ts';

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
    <div className="flex gap-1">
      {FILTER_TYPES.map(({ type, label, description }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          title={description}
          className={cn(
            'py-2 px-4 rounded-sm font-mono text-md transition-all duration-150 border-2',
            value === type
              ? 'bg-[#2a3a2a] border-success-light text-success-light font-bold'
              : 'bg-bg-tertiary border-border-medium text-text-tertiary font-normal'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
