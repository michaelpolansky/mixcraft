/**
 * Horizontal slider control for synth parameters
 * Converted from rotary knob to horizontal slider
 */

import { useRef, useCallback } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  /** Format the display value */
  formatValue?: (value: number) => string;
  /** Width in pixels (was size for knob) */
  size?: number;
  /** Use logarithmic scale (for frequency) */
  logarithmic?: boolean;
  /** Parameter ID for info panel (e.g., "filter.cutoff") */
  paramId?: string;
  /** Real-time modulated value (optional) - shows oscillating value when modulation is active */
  modulatedValue?: number;
}

export function Knob({
  value,
  min,
  max,
  step = 0.01,
  label,
  onChange,
  formatValue,
  size = 64,
  logarithmic = false,
  paramId,
  modulatedValue,
}: KnobProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { setHoveredParam } = useInfoPanel();

  // Slider dimensions - width based on size prop, fixed height
  const sliderWidth = Math.max(size * 1.5, 80);
  const sliderHeight = 8;

  // Convert between linear position (0-1) and actual value
  const valueToPosition = useCallback((v: number): number => {
    if (logarithmic) {
      const minLog = Math.log(Math.max(min, 0.001));
      const maxLog = Math.log(max);
      return (Math.log(Math.max(v, 0.001)) - minLog) / (maxLog - minLog);
    }
    return (v - min) / (max - min);
  }, [min, max, logarithmic]);

  const positionToValue = useCallback((p: number): number => {
    const clamped = Math.max(0, Math.min(1, p));
    if (logarithmic) {
      const minLog = Math.log(Math.max(min, 0.001));
      const maxLog = Math.log(max);
      return Math.exp(minLog + clamped * (maxLog - minLog));
    }
    return min + clamped * (max - min);
  }, [min, max, logarithmic]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;

    const updateValue = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const newValue = positionToValue(position);
      const quantized = Math.round(newValue / step) * step;
      const clamped = Math.max(min, Math.min(max, quantized));
      onChange(clamped);
    };

    updateValue(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateValue(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [min, max, step, onChange, positionToValue]);

  // Double-click to reset to center
  const handleDoubleClick = useCallback(() => {
    if (logarithmic) {
      onChange(Math.sqrt(min * max));
    } else {
      onChange((min + max) / 2);
    }
  }, [min, max, logarithmic, onChange]);

  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);
  const fillWidth = valueToPosition(value) * 100;

  // Check if modulation is active (value differs from base by threshold)
  const modulationThreshold = (max - min) * 0.005; // 0.5% of range
  const isModulated = modulatedValue !== undefined &&
    Math.abs(modulatedValue - value) > modulationThreshold;

  // Calculate modulated position (clamped to range)
  const clampedModulatedValue = modulatedValue !== undefined
    ? Math.max(min, Math.min(max, modulatedValue))
    : value;
  const modulatedPosition = valueToPosition(clampedModulatedValue) * 100;

  // Format the modulated value for display
  const modulatedDisplayValue = isModulated
    ? (formatValue ? formatValue(clampedModulatedValue) : clampedModulatedValue.toFixed(2))
    : null;

  // Track mouse position for tooltip placement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (paramId) {
      setHoveredParam(paramId, { x: e.clientX, y: e.clientY });
    }
  }, [paramId, setHoveredParam]);

  return (
    <div
      onMouseEnter={(e) => paramId && setHoveredParam(paramId, { x: e.clientX, y: e.clientY })}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredParam(null)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        userSelect: 'none',
        minWidth: sliderWidth,
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '10px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>

      {/* Slider track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          width: sliderWidth,
          height: sliderHeight,
          background: '#1a1a1a',
          borderRadius: sliderHeight / 2,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'visible',
        }}
      >
        {/* Background track */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#333',
            borderRadius: sliderHeight / 2,
          }}
        />

        {/* Base value fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${fillWidth}%`,
            background: 'linear-gradient(to right, #22c55e, #4ade80)',
            borderRadius: sliderHeight / 2,
          }}
        />

        {/* Modulated value indicator - shows as a moving line */}
        {isModulated && (
          <div
            style={{
              position: 'absolute',
              top: -2,
              bottom: -2,
              left: `${modulatedPosition}%`,
              width: 3,
              background: '#22d3ee',
              borderRadius: 1,
              transform: 'translateX(-50%)',
              boxShadow: '0 0 6px #22d3ee',
            }}
          />
        )}

        {/* Handle/thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${fillWidth}%`,
            width: 14,
            height: 14,
            background: '#fff',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            border: '2px solid #4ade80',
          }}
        />
      </div>

      {/* Value display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: '16px',
      }}>
        <span
          style={{
            fontSize: '11px',
            color: isModulated ? '#666' : '#4ade80',
            fontFamily: 'monospace',
          }}
        >
          {displayValue}
        </span>
        {/* Modulated value display */}
        {isModulated && modulatedDisplayValue && (
          <span
            style={{
              fontSize: '11px',
              color: '#22d3ee',
              fontFamily: 'monospace',
              fontWeight: 500,
            }}
          >
            → {modulatedDisplayValue}
          </span>
        )}
      </div>
    </div>
  );
}
