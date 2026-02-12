/**
 * 3-Band EQ Control
 * Vertical sliders for Low, Mid, High bands
 */

import { useCallback, useRef } from 'react';
import { cn } from '../utils/cn.ts';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';
import type { EQParams } from '../../core/mixing-effects.ts';
import { EQ_RANGES } from '../../core/mixing-effects.ts';

interface EQControlProps {
  params: EQParams;
  onLowChange: (value: number) => void;
  onMidChange: (value: number) => void;
  onHighChange: (value: number) => void;
}

interface BandSliderProps {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

function BandSlider({ label, value, color, onChange }: BandSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { min, max } = EQ_RANGES.low; // Same range for all bands

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

  // Calculate fill height (0 at center, fills up or down)
  const centerPercent = 50;
  const valuePercent = ((value - min) / (max - min)) * 100;
  const fillHeight = Math.abs(valuePercent - centerPercent);
  const fillTop = value >= 0 ? centerPercent - fillHeight : centerPercent;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Value display */}
      <div
        className={cn(
          'text-xs font-mono',
          value === 0 ? 'text-text-muted' : 'font-semibold'
        )}
        style={{ color: value === 0 ? undefined : color }}
      >
        {value > 0 ? '+' : ''}{value.toFixed(1)} dB
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative w-10 h-[120px] bg-bg-tertiary rounded-sm border border-border-medium cursor-pointer"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        {/* Center line (0 dB) */}
        <div className="absolute left-1 right-1 top-1/2 h-px bg-[#444]" />

        {/* Fill bar */}
        <div
          style={{
            position: 'absolute',
            left: '8px',
            right: '8px',
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
            left: '4px',
            right: '4px',
            top: `${100 - valuePercent}%`,
            height: '4px',
            background: color,
            borderRadius: '2px',
            transform: 'translateY(-50%)',
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-text-muted uppercase">
        {label}
      </div>
    </div>
  );
}

export function EQControl({
  params,
  onLowChange,
  onMidChange,
  onHighChange,
}: EQControlProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
      {/* Header */}
      <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 text-center">
        3-Band EQ
      </div>

      {/* Sliders */}
      <div className="flex justify-center gap-6">
        <BandSlider
          label="Low"
          value={params.low}
          color="#f97316"
          onChange={onLowChange}
        />
        <BandSlider
          label="Mid"
          value={params.mid}
          color="#22c55e"
          onChange={onMidChange}
        />
        <BandSlider
          label="High"
          value={params.high}
          color="#3b82f6"
          onChange={onHighChange}
        />
      </div>

      {/* Frequency labels */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="w-10 text-center text-xs text-text-disabled">
          &lt;400Hz
        </div>
        <div className="w-10 text-center text-xs text-text-disabled">
          ~1kHz
        </div>
        <div className="w-10 text-center text-xs text-text-disabled">
          &gt;2.5kHz
        </div>
      </div>
    </div>
  );
}
