/**
 * Vertical slider for envelope parameters
 */

import { useRef, useCallback, memo } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';

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

export const Slider = memo(function Slider({
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

  const { onPointerDown } = usePointerDrag({
    onMove: useCallback((_clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      // Invert Y so dragging up increases value
      const position = 1 - (clientY - rect.top) / rect.height;
      const newValue = positionToValue(position);
      const quantized = Math.round(newValue / step) * step;
      const clamped = Math.max(min, Math.min(max, quantized));
      onChange(clamped);
    }, [min, max, step, onChange, positionToValue]),
  });

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newValue = value;
    const largeStep = (max - min) / 10;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newValue = Math.max(min, value - step);
        break;
      case 'PageUp':
        newValue = Math.min(max, value + largeStep);
        break;
      case 'PageDown':
        newValue = Math.max(min, value - largeStep);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    const quantized = Math.round(newValue / step) * step;
    onChange(Math.max(min, Math.min(max, quantized)));
  }, [value, min, max, step, onChange]);

  const fillHeight = valueToPosition(value) * 100;
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div
      onMouseEnter={() => paramId && setHoveredParam(paramId)}
      onMouseLeave={() => setHoveredParam(null)}
      className="flex flex-col items-center gap-1 select-none"
    >
      <span className="text-sm text-text-tertiary uppercase tracking-wide">
        {label}
      </span>

      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={displayValue}
        aria-orientation="vertical"
        tabIndex={0}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onKeyDown={handleKeyDown}
        className="w-6 bg-bg-tertiary rounded-sm relative cursor-pointer overflow-hidden outline-none focus:ring-2 focus:ring-success-light"
        style={{ height }}
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-sm transition-[height] duration-100"
          style={{
            height: `${fillHeight}%`,
            background: 'linear-gradient(to top, #16a34a, #4ade80)',
          }}
        />

        {/* Handle */}
        <div
          className="absolute left-1/2 w-5 h-2 bg-text-primary rounded-[2px] shadow-sm transition-[bottom] duration-100"
          style={{
            bottom: `calc(${fillHeight}% - 4px)`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      <span className="text-sm font-mono text-success-light">
        {displayValue}
      </span>
    </div>
  );
});
