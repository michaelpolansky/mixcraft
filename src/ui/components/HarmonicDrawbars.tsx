/**
 * Hammond organ style drawbars for controlling 16 harmonic partials
 */

import { useCallback, useMemo, useRef } from 'react';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';
import { ADDITIVE_PRESETS, type AdditivePreset } from '../../core/types.ts';

interface HarmonicDrawbarsProps {
  harmonics: number[]; // 16 values, 0-1 each
  onChange: (index: number, value: number) => void;
  onPreset: (preset: AdditivePreset) => void;
}

const PRESET_LABELS: Record<AdditivePreset, string> = {
  saw: 'Saw',
  square: 'Square',
  triangle: 'Triangle',
  organ: 'Organ',
};

const PRESETS: AdditivePreset[] = ['saw', 'square', 'triangle', 'organ'];

// Check if current harmonics match a preset (with small tolerance)
function matchesPreset(harmonics: number[], preset: AdditivePreset): boolean {
  const presetValues = ADDITIVE_PRESETS[preset];
  const tolerance = 0.01;

  for (let i = 0; i < 16; i++) {
    if (Math.abs((harmonics[i] ?? 0) - (presetValues[i] ?? 0)) > tolerance) {
      return false;
    }
  }
  return true;
}

interface DrawbarProps {
  index: number;
  value: number;
  onChange: (value: number) => void;
}

function Drawbar({ index, value, onChange }: DrawbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const { onPointerDown } = usePointerDrag({
    onMove: useCallback((_clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      // Invert Y so dragging up increases value
      const position = 1 - (clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, position));
      onChange(clamped);
    }, [onChange]),
  });

  const fillHeight = value * 100;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        ref={trackRef}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        className="w-5 h-[120px] bg-[#333] rounded relative cursor-pointer overflow-hidden"
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded bg-gradient-to-t from-cyan-600 to-cyan-500"
          style={{ height: `${fillHeight}%` }}
        />

        {/* Handle */}
        <div
          className="absolute left-1/2 w-4 h-2 bg-cyan-500 rounded-sm -translate-x-1/2 shadow-md"
          style={{ bottom: `calc(${fillHeight}% - 4px)` }}
        />
      </div>

      <span className="text-[9px] text-[#888] font-mono">
        {index + 1}
      </span>
    </div>
  );
}

export function HarmonicDrawbars({ harmonics, onChange, onPreset }: HarmonicDrawbarsProps) {
  // Determine which preset (if any) matches current harmonics
  const activePreset = useMemo(() => {
    for (const preset of PRESETS) {
      if (matchesPreset(harmonics, preset)) {
        return preset;
      }
    }
    return null;
  }, [harmonics]);

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      {/* Section label */}
      <div className="text-[11px] text-[#666] uppercase tracking-[1px] mb-3">
        Harmonics
      </div>

      {/* Drawbars row */}
      <div className="flex gap-1.5 justify-center mb-4">
        {harmonics.slice(0, 16).map((value, index) => (
          <Drawbar
            key={index}
            index={index}
            value={value}
            onChange={(v) => onChange(index, v)}
          />
        ))}
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 justify-center">
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset;
          return (
            <button
              key={preset}
              onClick={() => onPreset(preset)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 500,
                background: isActive ? '#164e63' : '#1a1a1a',
                border: isActive ? '1px solid #06b6d4' : '1px solid #333',
                borderRadius: '6px',
                color: isActive ? '#06b6d4' : '#888',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {PRESET_LABELS[preset]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
