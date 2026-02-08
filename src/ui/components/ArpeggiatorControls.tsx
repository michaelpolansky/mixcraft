/**
 * ArpeggiatorControls Component
 * Reusable arpeggiator UI for all synth views
 */

import { Knob } from './Knob.tsx';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Enable toggle */}
      <button
        onClick={() => onEnabledChange(!enabled)}
        style={{
          padding: '6px 12px',
          background: enabled ? accentColor : '#222',
          border: `1px solid ${enabled ? accentColor : '#444'}`,
          borderRadius: '4px',
          color: enabled ? '#000' : '#888',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        {enabled ? 'ON' : 'OFF'}
      </button>

      {enabled && (
        <>
          {/* Pattern selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
              Pattern
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {PATTERN_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onPatternChange(value)}
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: '14px',
                    fontWeight: 600,
                    background: pattern === value ? accentColor : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: pattern === value ? '#000' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Division selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
              Rate
            </span>
            <select
              value={division}
              onChange={(e) => onDivisionChange(e.target.value as ArpDivision)}
              style={{
                padding: '4px 8px',
                background: '#222',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {DIVISION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Octaves selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
              Octaves
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {OCTAVE_OPTIONS.map((oct) => (
                <button
                  key={oct}
                  onClick={() => onOctavesChange(oct)}
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: '10px',
                    fontWeight: 600,
                    background: octaves === oct ? accentColor : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: octaves === oct ? '#000' : '#fff',
                    cursor: 'pointer',
                  }}
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
