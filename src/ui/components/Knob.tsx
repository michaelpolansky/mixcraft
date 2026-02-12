/**
 * Horizontal slider control for synth parameters
 * Converted from rotary knob to horizontal slider
 */

import { useRef, useCallback, memo } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { usePointerDrag } from '../hooks/usePointerDrag.ts';
import { cn } from '../utils/cn.ts';

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

export const Knob = memo(function Knob({
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

  const { onPointerDown } = usePointerDrag({
    onMove: useCallback((clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const newValue = positionToValue(position);
      const quantized = Math.round(newValue / step) * step;
      const clamped = Math.max(min, Math.min(max, quantized));
      onChange(clamped);
    }, [min, max, step, onChange, positionToValue]),
  });

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newValue = value;
    const largeStep = (max - min) / 10; // 10% jumps for Page keys

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
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
        return; // Don't prevent default for other keys
    }

    e.preventDefault();
    const quantized = Math.round(newValue / step) * step;
    onChange(Math.max(min, Math.min(max, quantized)));
  }, [value, min, max, step, onChange]);

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
      className="flex flex-col gap-1 select-none w-full px-2 py-1"
    >
      {/* Header row: Label left, Value right */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-tertiary uppercase tracking-wide">
          {label}
        </span>

        {/* Value display */}
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-sm font-mono',
              isModulated ? 'text-text-muted' : 'text-success-light'
            )}
          >
            {displayValue}
          </span>
          {/* Modulated value display */}
          {isModulated && modulatedDisplayValue && (
            <span className="text-sm font-mono text-accent-secondary font-medium">
              → {modulatedDisplayValue}
            </span>
          )}
        </div>
      </div>

      {/* Full-width slider track - accessible */}
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={displayValue}
        tabIndex={0}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className="w-full h-1.5 bg-bg-tertiary rounded-full relative cursor-pointer overflow-visible outline-none focus:ring-2 focus:ring-success-light"
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-border-medium rounded-full" />

        {/* Base value fill */}
        <div
          className="absolute top-0 left-0 bottom-0 rounded-full transition-[width] duration-100"
          style={{
            width: `${fillWidth}%`,
            background: 'linear-gradient(90deg, #16a34a, #4ade80)',
          }}
        />

        {/* Modulated value indicator - shows as a moving line */}
        {isModulated && (
          <div
            className="absolute -top-0.5 -bottom-0.5 w-[3px] rounded-sm"
            style={{
              left: `${modulatedPosition}%`,
              background: '#60a5fa',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 12px #60a5fa',
            }}
          />
        )}

        {/* Handle/thumb */}
        <div
          className="absolute top-1/2 w-3 h-3 bg-text-primary rounded-full shadow-md border-2 border-success-light transition-[left] duration-100"
          style={{
            left: `${fillWidth}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
});
