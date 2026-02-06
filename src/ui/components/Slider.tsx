/**
 * Vertical slider for envelope parameters
 */

import { useRef, useCallback } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  /** Format the display value */
  formatValue?: (value: number) => string;
  /** Height in pixels */
  height?: number;
  /** Use logarithmic scale */
  logarithmic?: boolean;
  /** Parameter ID for info panel (e.g., "amplitude.attack") */
  paramId?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 0.001,
  label,
  onChange,
  formatValue,
  height = 100,
  logarithmic = false,
  paramId,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { setHoveredParam } = useInfoPanel();

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

    const updateValue = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      // Invert Y so dragging up increases value
      const position = 1 - (clientY - rect.top) / rect.height;
      const newValue = positionToValue(position);
      const quantized = Math.round(newValue / step) * step;
      const clamped = Math.max(min, Math.min(max, quantized));
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
  }, [min, max, step, onChange, positionToValue]);

  const fillHeight = valueToPosition(value) * 100;
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

      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '24px',
          height: height,
          background: '#1a1a1a',
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
            background: 'linear-gradient(to top, #4ade80, #22c55e)',
            borderRadius: '4px',
          }}
        />

        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            bottom: `calc(${fillHeight}% - 4px)`,
            left: '50%',
            width: '20px',
            height: '8px',
            background: '#fff',
            borderRadius: '2px',
            transform: 'translateX(-50%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      <span
        style={{
          fontSize: '10px',
          color: '#4ade80',
          fontFamily: 'monospace',
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}
