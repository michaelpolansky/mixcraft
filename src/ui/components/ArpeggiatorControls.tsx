/**
 * ArpeggiatorControls Component
 * Reusable arpeggiator UI for all synth views
 */

import { Knob } from './Knob.tsx';
import { cn } from '../utils/cn.ts';
import type { ArpPattern, ArpDivision } from '../../core/types.ts';

export interface ArpeggiatorControlsProps {
  enabled: boolean;
  pattern: ArpPattern;
  division: ArpDivision;
  octaves: 1 | 2 | 3 | 4;
  gate: number;
  onEnabledChange: (enabled: boolean) => void;
  onPatternChange: (pattern: ArpPattern) => void;
  onDivisionChange: (division: ArpDivision) => void;
  onOctavesChange: (octaves: 1 | 2 | 3 | 4) => void;
  onGateChange: (gate: number) => void;
  accentColor: string;
}

// Pattern options with arrow icons
const PATTERN_OPTIONS: Array<{ value: ArpPattern; label: string }> = [
  { value: 'up', label: '\u2191' },
  { value: 'down', label: '\u2193' },
  { value: 'upDown', label: '\u2195' },
  { value: 'random', label: '?' },
];

// Division options
const DIVISION_OPTIONS: Array<{ value: ArpDivision; label: string }> = [
  { value: '1n', label: '1' },
  { value: '2n', label: '1/2' },
  { value: '4n', label: '1/4' },
  { value: '8n', label: '1/8' },
  { value: '16n', label: '1/16' },
  { value: '32n', label: '1/32' },
];

// Octave options
const OCTAVE_OPTIONS = [1, 2, 3, 4] as const;

export function ArpeggiatorControls({
  enabled,
  pattern,
  division,
  octaves,
  gate,
  onEnabledChange,
  onPatternChange,
  onDivisionChange,
  onOctavesChange,
  onGateChange,
  accentColor,
}: ArpeggiatorControlsProps) {
  return (
    <div
      className="flex flex-col gap-2"
      style={{ '--arp-accent': accentColor } as React.CSSProperties}
    >
      {/* Enable toggle */}
      <button
        onClick={() => onEnabledChange(!enabled)}
        className={cn(
          'py-1.5 px-3 rounded-sm text-base font-bold cursor-pointer self-start border',
          enabled
            ? 'text-bg-primary'
            : 'bg-bg-tertiary border-border-bright text-text-muted'
        )}
        style={enabled ? { background: accentColor, borderColor: accentColor } : undefined}
      >
        {enabled ? 'ON' : 'OFF'}
      </button>

      {enabled && (
        <>
          {/* Pattern selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase">
              Pattern
            </span>
            <div className="flex gap-0.5">
              {PATTERN_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onPatternChange(value)}
                  className={cn(
                    'w-7 h-7 text-xl font-semibold border-none rounded-sm cursor-pointer',
                    pattern === value ? 'text-bg-primary' : 'bg-border-medium text-text-primary'
                  )}
                  style={pattern === value ? { background: accentColor } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Division selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase">
              Rate
            </span>
            <select
              value={division}
              onChange={(e) => onDivisionChange(e.target.value as ArpDivision)}
              className="py-1 px-2 bg-bg-tertiary border border-border-bright rounded-sm text-text-primary text-base cursor-pointer"
            >
              {DIVISION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Octaves selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase">
              Octaves
            </span>
            <div className="flex gap-0.5">
              {OCTAVE_OPTIONS.map((oct) => (
                <button
                  key={oct}
                  onClick={() => onOctavesChange(oct)}
                  className={cn(
                    'w-6 h-6 text-sm font-semibold border-none rounded-sm cursor-pointer',
                    octaves === oct ? 'text-bg-primary' : 'bg-border-medium text-text-primary'
                  )}
                  style={octaves === oct ? { background: accentColor } : undefined}
                >
                  {oct}
                </button>
              ))}
            </div>
          </div>

          {/* Gate knob */}
          <Knob
            label="Gate"
            value={gate}
            min={0.25}
            max={1}
            step={0.05}
            onChange={onGateChange}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            paramId="arp.gate"
          />
        </>
      )}
    </div>
  );
}
