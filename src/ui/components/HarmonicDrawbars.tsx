/**
 * Hammond organ style drawbars for controlling 16 harmonic partials
 */

import { useCallback, useMemo, useRef } from 'react';
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
  const height = 120;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;

    const updateValue = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      // Invert Y so dragging up increases value
      const position = 1 - (clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, position));
      onChange(clamped);
    };

    updateValue(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateValue(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onChange]);

  const fillHeight = value * 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        userSelect: 'none',
      }}
    >
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '20px',
          height: height,
          background: '#333',
          borderRadius: '4px',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${fillHeight}%`,
            background: 'linear-gradient(to top, #0891b2, #06b6d4)',
            borderRadius: '4px',
          }}
        />

        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            bottom: `calc(${fillHeight}% - 4px)`,
            left: '50%',
            width: '16px',
            height: '8px',
            background: '#06b6d4',
            borderRadius: '2px',
            transform: 'translateX(-50%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      <span
        style={{
          fontSize: '9px',
          color: '#888',
          fontFamily: 'monospace',
        }}
      >
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
    <div
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: '11px',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '12px',
        }}
      >
        Harmonics
      </div>

      {/* Drawbars row */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
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
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
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
