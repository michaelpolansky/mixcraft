/**
 * Vertical slider for envelope parameters
 */

import { useRef, useCallback } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TRANSITIONS } from '../theme/index.ts';

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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING.xs,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          fontSize: TYPOGRAPHY.size.sm,
          color: COLORS.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        }}
      >
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
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        style={{
          width: 24,
          height: height,
          background: COLORS.bg.tertiary,
          borderRadius: RADIUS.sm,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.interactive.focus}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
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
            background: COLORS.gradients.successVertical,
            borderRadius: RADIUS.sm,
            transition: `height ${TRANSITIONS.fast}`,
          }}
        />

        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            bottom: `calc(${fillHeight}% - 4px)`,
            left: '50%',
            width: 20,
            height: 8,
            background: COLORS.text.primary,
            borderRadius: 2,
            transform: 'translateX(-50%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: `bottom ${TRANSITIONS.fast}`,
          }}
        />
      </div>

      <span
        style={{
          fontSize: TYPOGRAPHY.size.sm,
          fontFamily: TYPOGRAPHY.family.mono,
          color: COLORS.accent.primary,
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}
