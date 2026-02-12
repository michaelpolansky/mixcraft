/**
 * Visualization mode toggle — compact segmented button bar
 * for switching between viz layouts in ChallengeView.
 */

import type { VizMode } from '../../../core/types.ts';
import { cn } from '../../utils/cn.ts';

const MODES: { value: VizMode; label: string }[] = [
  { value: 'default', label: 'ALL' },
  { value: 'spectrum', label: 'SPEC' },
  { value: 'waveform', label: 'WAVE' },
  { value: 'compare', label: 'CMP' },
  { value: 'minimal', label: 'MIN' },
];

interface VizModeToggleProps {
  mode: VizMode;
  onChange: (mode: VizMode) => void;
}

export function VizModeToggle({ mode, onChange }: VizModeToggleProps) {
  return (
    <div className="flex gap-1 mb-2">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors',
            value === mode
              ? 'bg-bg-tertiary text-green-400 ring-1 ring-green-500'
              : 'bg-bg-secondary text-text-disabled hover:text-text-tertiary'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
