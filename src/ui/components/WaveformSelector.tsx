/**
 * Unified Waveform Selector Component
 *
 * Visual waveform type selector with customizable accent color and size.
 * Used for oscillators, LFOs, and FM carrier/modulator selection.
 */

import type { OscillatorType, LFOWaveform } from '../../core/types.ts';
import { cn } from '../utils/cn.ts';
import { COLORS } from '../theme/index.ts';

type WaveformType = OscillatorType | LFOWaveform;

interface WaveformSelectorProps<T extends WaveformType> {
  value: T;
  onChange: (type: T) => void;
  accentColor?: string;
  size?: 'compact' | 'normal' | 'large';
  direction?: 'row' | 'column';
  waveforms?: T[];
}

const WAVEFORMS: { type: WaveformType; label: string; path: string }[] = [
  { type: 'sine', label: 'Sine', path: 'M 0 20 Q 10 0, 20 20 Q 30 40, 40 20' },
  { type: 'triangle', label: 'Triangle', path: 'M 0 20 L 10 0 L 30 40 L 40 20' },
  { type: 'sawtooth', label: 'Saw', path: 'M 0 40 L 20 0 L 20 40 L 40 0' },
  { type: 'square', label: 'Square', path: 'M 0 40 L 0 0 L 20 0 L 20 40 L 40 40 L 40 0' },
];

const SIZES = {
  compact: { button: 32, svg: 24, gap: 'gap-1', radius: 'rounded-sm' },
  normal: { button: 40, svg: 32, gap: 'gap-1.5', radius: 'rounded-md' },
  large: { button: 48, svg: 40, gap: 'gap-2', radius: 'rounded-md' },
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

  const displayWaveforms = waveforms
    ? WAVEFORMS.filter(w => waveforms.includes(w.type as T))
    : WAVEFORMS;

  return (
    <div
      className={cn('flex', sizeConfig.gap, direction === 'column' && 'flex-col')}
      style={{ '--wf-accent': accentColor } as React.CSSProperties}
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
            className={cn(
              'flex items-center justify-center cursor-pointer transition-all duration-100 p-0 border-2',
              sizeConfig.radius,
              isSelected
                ? 'border-(--wf-accent)'
                : 'bg-bg-tertiary border-border-medium'
            )}
            style={{
              width: sizeConfig.button,
              height: sizeConfig.button,
              ...(isSelected ? { background: `${accentColor}20` } : {}),
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
                stroke={isSelected ? accentColor : '#666'}
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
