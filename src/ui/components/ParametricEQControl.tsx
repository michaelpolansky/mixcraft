/**
 * 4-Band Parametric EQ Control
 * Per-band controls: Frequency (knob), Gain (vertical slider), Q (knob)
 * Band types: Low Shelf, Peak, Peak, High Shelf
 */

import { useCallback, useRef } from 'react';
import { cn } from '../utils/cn.ts';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';
import { Knob } from './Knob.tsx';
import type { ParametricBand } from '../../core/types.ts';
import { PARAMETRIC_EQ_RANGES } from '../../core/mixing-effects.ts';

const BAND_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7'] as const;
const BAND_TYPE_LABELS = ['Low Shelf', 'Peak', 'Peak', 'High Shelf'] as const;

interface ParametricEQControlProps {
  bands: [ParametricBand, ParametricBand, ParametricBand, ParametricBand];
  onBandChange: (index: number, params: Partial<ParametricBand>) => void;
}

function formatFreq(hz: number): string {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return `${Math.round(hz)}`;
}

/** Vertical gain slider matching the BandSlider style from EQControl */
function GainSlider({ value, color, onChange }: {
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { min, max } = PARAMETRIC_EQ_RANGES.gain;

  const { onPointerDown } = usePointerDrag({
    onMove: useCallback((_clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const y = clientY - rect.top;
      const percent = 1 - y / rect.height;
      const newValue = min + percent * (max - min);
      onChange(Math.round(newValue * 10) / 10);
    }, [min, max, onChange]),
  });

  const centerPercent = 50;
  const valuePercent = ((value - min) / (max - min)) * 100;
  const fillHeight = Math.abs(valuePercent - centerPercent);
  const fillTop = value >= 0 ? centerPercent - fillHeight : centerPercent;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'text-xs font-mono',
          value === 0 ? 'text-text-muted' : 'font-semibold'
        )}
        style={{ color: value === 0 ? undefined : color }}
      >
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </div>
      <div
        ref={trackRef}
        className="relative w-8 h-[90px] bg-bg-tertiary rounded-sm border border-border-medium cursor-pointer"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        {/* Center line (0 dB) */}
        <div className="absolute left-[3px] right-[3px] top-1/2 h-px bg-[#444]" />
        {/* Fill bar */}
        <div
          style={{
            position: 'absolute',
            left: '6px',
            right: '6px',
            top: `${fillTop}%`,
            height: `${fillHeight}%`,
            background: color,
            borderRadius: '2px',
            opacity: 0.6,
            transition: 'all 0.05s ease',
          }}
        />
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: '3px',
            right: '3px',
            top: `${100 - valuePercent}%`,
            height: '3px',
            background: color,
            borderRadius: '2px',
            transform: 'translateY(-50%)',
            boxShadow: `0 0 6px ${color}40`,
          }}
        />
      </div>
      <div className="text-[10px] text-text-disabled">dB</div>
    </div>
  );
}

export function ParametricEQControl({ bands, onBandChange }: ParametricEQControlProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
      <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 text-center">
        Parametric EQ
      </div>

      <div className="flex gap-3 justify-center">
        {bands.map((band, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 bg-[#0a0a0a] rounded-lg p-3 flex-1 min-w-0"
          >
            {/* Band type label */}
            <div
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: BAND_COLORS[i] }}
            >
              {BAND_TYPE_LABELS[i]}
            </div>

            {/* Frequency knob */}
            <Knob
              label="Freq"
              value={band.frequency}
              min={PARAMETRIC_EQ_RANGES.frequency.min}
              max={PARAMETRIC_EQ_RANGES.frequency.max}
              onChange={(v) => onBandChange(i, { frequency: v })}
              formatValue={formatFreq}
              logarithmic
              size={36}
            />

            {/* Gain slider */}
            <GainSlider
              value={band.gain}
              color={BAND_COLORS[i]!}
              onChange={(v) => onBandChange(i, { gain: v })}
            />

            {/* Q knob */}
            <Knob
              label="Q"
              value={band.Q}
              min={PARAMETRIC_EQ_RANGES.Q.min}
              max={PARAMETRIC_EQ_RANGES.Q.max}
              step={0.1}
              onChange={(v) => onBandChange(i, { Q: v })}
              formatValue={(v) => v.toFixed(1)}
              size={32}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
