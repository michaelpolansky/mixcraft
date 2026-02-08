/**
 * Horizontal slider control for synth parameters
 * Converted from rotary knob to horizontal slider
 */

import { useRef, useCallback } from 'react';
import { useInfoPanel } from '../context/InfoPanelContext.tsx';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TRANSITIONS, SHADOWS } from '../theme/index.ts';

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

  // Slider dimensions - full width, fixed height
  const sliderHeight = 6;

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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.xs,
        userSelect: 'none',
        width: '100%',
        padding: `${SPACING.xs}px ${SPACING.sm}px`,
      }}
    >
      {/* Header row: Label left, Value right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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

        {/* Value display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.xs,
        }}>
          <span
            style={{
              fontSize: TYPOGRAPHY.size.sm,
              fontFamily: TYPOGRAPHY.family.mono,
              color: isModulated ? COLORS.text.muted : COLORS.accent.primary,
            }}
          >
            {displayValue}
          </span>
          {/* Modulated value display */}
          {isModulated && modulatedDisplayValue && (
            <span
              style={{
                fontSize: TYPOGRAPHY.size.sm,
                fontFamily: TYPOGRAPHY.family.mono,
                color: COLORS.accent.secondary,
                fontWeight: TYPOGRAPHY.weight.medium,
              }}
            >
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
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: sliderHeight,
          background: COLORS.bg.tertiary,
          borderRadius: RADIUS.full,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'visible',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.interactive.focus}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
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
            background: COLORS.border.medium,
            borderRadius: RADIUS.full,
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
            background: COLORS.gradients.success,
            borderRadius: RADIUS.full,
            transition: `width ${TRANSITIONS.fast}`,
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
              background: COLORS.accent.secondary,
              borderRadius: RADIUS.sm,
              transform: 'translateX(-50%)',
              boxShadow: SHADOWS.glow(COLORS.accent.secondary),
            }}
          />
        )}

        {/* Handle/thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${fillWidth}%`,
            width: 12,
            height: 12,
            background: COLORS.text.primary,
            borderRadius: RADIUS.full,
            transform: 'translate(-50%, -50%)',
            boxShadow: SHADOWS.md,
            border: `2px solid ${COLORS.accent.primary}`,
            transition: `left ${TRANSITIONS.fast}`,
          }}
        />
      </div>
    </div>
  );
}
