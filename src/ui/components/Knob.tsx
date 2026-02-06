/**
 * Rotary knob control for synth parameters
 * Uses mouse drag for interaction
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
  /** Size in pixels */
  size?: number;
  /** Use logarithmic scale (for frequency) */
  logarithmic?: boolean;
  /** Parameter ID for info panel (e.g., "filter.cutoff") */
  paramId?: string;
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
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const { setHoveredParam } = useInfoPanel();
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Convert between linear position (0-1) and actual value
  const valueToPosition = useCallback((v: number): number => {
    if (logarithmic) {
      const minLog = Math.log(min);
      const maxLog = Math.log(max);
      return (Math.log(v) - minLog) / (maxLog - minLog);
    }
    return (v - min) / (max - min);
  }, [min, max, logarithmic]);

  const positionToValue = useCallback((p: number): number => {
    const clamped = Math.max(0, Math.min(1, p));
    if (logarithmic) {
      const minLog = Math.log(min);
      const maxLog = Math.log(max);
      return Math.exp(minLog + clamped * (maxLog - minLog));
    }
    return min + clamped * (max - min);
  }, [min, max, logarithmic]);

  // Calculate rotation angle (270 degree sweep, starting at -135)
  const rotation = valueToPosition(value) * 270 - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = valueToPosition(value);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;

      // Drag sensitivity: 200 pixels = full range
      const delta = (startY.current - moveEvent.clientY) / 200;
      const newPosition = startValue.current + delta;
      const newValue = positionToValue(newPosition);

      // Apply step quantization
      const quantized = Math.round(newValue / step) * step;
      const clamped = Math.max(min, Math.min(max, quantized));

      onChange(clamped);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, step, onChange, valueToPosition, positionToValue]);

  // Double-click to reset to center
  const handleDoubleClick = useCallback(() => {
    if (logarithmic) {
      onChange(Math.sqrt(min * max));
    } else {
      onChange((min + max) / 2);
    }
  }, [min, max, logarithmic, onChange]);

  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div
      onMouseEnter={() => paramId && setHoveredParam(paramId)}
      onMouseLeave={() => setHoveredParam(null)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        userSelect: 'none',
      }}
    >
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: '4px 4px 8px #0a0a0a, -2px -2px 6px #3a3a3a',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {/* Arc indicator background */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-135deg)',
          }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#333"
            strokeWidth="4"
            strokeDasharray={`${270 * (Math.PI * 42) / 180} 1000`}
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#4ade80"
            strokeWidth="4"
            strokeDasharray={`${valueToPosition(value) * 270 * (Math.PI * 42) / 180} 1000`}
          />
        </svg>

        {/* Pointer line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '2px',
            height: size * 0.35,
            background: '#fff',
            transformOrigin: '50% 0',
            transform: `translate(-50%, 0) rotate(${rotation}deg)`,
            borderRadius: '1px',
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: '50%',
            background: '#222',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

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

      <span
        style={{
          fontSize: '11px',
          color: '#4ade80',
          fontFamily: 'monospace',
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}
