/**
 * Unified Waveform Selector Component
 *
 * Visual waveform type selector with customizable accent color and size.
 * Used for oscillators, LFOs, and FM carrier/modulator selection.
 */

import type { OscillatorType, LFOWaveform } from '../../core/types.ts';
import { COLORS, RADIUS, TRANSITIONS } from '../theme/index.ts';

// Waveform can be either oscillator or LFO type
type WaveformType = OscillatorType | LFOWaveform;

interface WaveformSelectorProps<T extends WaveformType> {
  value: T;
  onChange: (type: T) => void;
  /** Accent color for selected state */
  accentColor?: string;
  /** Size variant */
  size?: 'compact' | 'normal' | 'large';
  /** Layout direction */
  direction?: 'row' | 'column';
  /** Filter to show only specific waveforms (defaults to all) */
  waveforms?: T[];
}

// Shared waveform definitions
const WAVEFORMS: { type: WaveformType; label: string; path: string }[] = [
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

// Size configurations
const SIZES = {
  compact: { button: 32, svg: 24, gap: 4, radius: RADIUS.sm },
  normal: { button: 40, svg: 32, gap: 6, radius: RADIUS.md },
  large: { button: 48, svg: 40, gap: 8, radius: RADIUS.md },
};

export function WaveformSelector<T extends WaveformType>({
  value,
  onChange,
  accentColor = COLORS.accent.primary,
  size = 'normal',
  direction = 'row',
  waveforms,
}: WaveformSelectorProps<T>) {
  const sizeConfig = SIZES[size];

  // Calculate selected background with color tint
  const selectedBg = `${accentColor}20`;

  // Filter waveforms if specified
  const displayWaveforms = waveforms
    ? WAVEFORMS.filter(w => waveforms.includes(w.type as T))
    : WAVEFORMS;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: sizeConfig.gap,
      }}
    >
      {displayWaveforms.map(({ type, label, path }) => {
        const isSelected = value === type;

        return (
          <button
            key={type}
            onClick={() => onChange(type as T)}
            title={label}
            aria-label={`${label} waveform`}
            aria-pressed={isSelected}
            style={{
              width: sizeConfig.button,
              height: sizeConfig.button,
              background: isSelected ? selectedBg : COLORS.bg.tertiary,
              border: `2px solid ${isSelected ? accentColor : COLORS.border.medium}`,
              borderRadius: sizeConfig.radius,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `all ${TRANSITIONS.fast}`,
              padding: 0,
            }}
          >
            <svg
              width={sizeConfig.svg}
              height={sizeConfig.svg}
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <path
                d={path}
                fill="none"
                stroke={isSelected ? accentColor : COLORS.text.muted}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Convenience wrapper for LFO waveform selection
 * Pre-configured with LFO color
 */
export function LFOWaveformSelector({
  value,
  onChange,
  compact = false,
}: {
  value: LFOWaveform;
  onChange: (type: LFOWaveform) => void;
  compact?: boolean;
}) {
  return (
    <WaveformSelector
      value={value}
      onChange={onChange}
      accentColor={COLORS.synth.lfo}
      size={compact ? 'compact' : 'normal'}
    />
  );
}
