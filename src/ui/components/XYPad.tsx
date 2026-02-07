/**
 * XY Pad Component
 * 2D control surface for simultaneous control of two parameters
 * Inspired by Ableton Learning Synths-style interaction
 */

import { useRef, useEffect, useCallback, useState } from 'react';

export interface XYPadProps {
  /** X-axis value (0-1 normalized) */
  xValue: number;
  /** Y-axis value (0-1 normalized) */
  yValue: number;
  /** Label for X-axis parameter */
  xLabel: string;
  /** Label for Y-axis parameter */
  yLabel: string;
  /** Actual parameter range for X [min, max] */
  xRange: [number, number];
  /** Actual parameter range for Y [min, max] */
  yRange: [number, number];
  /** Callback when X value changes */
  onXChange: (value: number) => void;
  /** Callback when Y value changes */
  onYChange: (value: number) => void;
  /** Size in pixels (default 200) */
  size?: number;
  /** Accent color for crosshair and border (default Ableton blue) */
  accentColor?: string;
  /** Format function for X value display */
  formatXValue?: (value: number) => string;
  /** Format function for Y value display */
  formatYValue?: (value: number) => string;
}

// Visual design constants
const COLORS = {
  background: '#1a1a2e',
  grid: '#2d2d44',
  crosshair: '#3b82f6',
  text: '#888',
  border: '#3b82f6',
};

const GRID_DIVISIONS = 4; // 25% intervals
const CROSSHAIR_SIZE = 12;

export function XYPad({
  xValue,
  yValue,
  xLabel,
  yLabel,
  xRange,
  yRange,
  onXChange,
  onYChange,
  size = 200,
  accentColor = '#3b82f6',
  formatXValue,
  formatYValue,
}: XYPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Convert normalized value (0-1) to actual parameter value
   */
  const normalizedToActual = useCallback(
    (normalized: number, range: [number, number]): number => {
      return range[0] + normalized * (range[1] - range[0]);
    },
    []
  );

  /**
   * Format value for display
   */
  const formatValue = useCallback(
    (normalized: number, range: [number, number], formatter?: (v: number) => string): string => {
      const actual = normalizedToActual(normalized, range);
      if (formatter) {
        return formatter(actual);
      }
      // Default formatting based on value magnitude
      if (Math.abs(actual) >= 1000) {
        return `${(actual / 1000).toFixed(1)}k`;
      }
      if (Math.abs(actual) >= 10) {
        return `${Math.round(actual)}`;
      }
      return actual.toFixed(1);
    },
    [normalizedToActual]
  );

  /**
   * Update values based on mouse/touch position
   */
  const updateFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Normalize to 0-1, clamped
      const normalizedX = Math.max(0, Math.min(1, x / size));
      const normalizedY = Math.max(0, Math.min(1, 1 - y / size)); // Invert Y so up is higher

      onXChange(normalizedX);
      onYChange(normalizedY);
    },
    [size, onXChange, onYChange]
  );

  /**
   * Draw the XY Pad
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, size, size);

    // Draw grid lines at 25% intervals
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_DIVISIONS; i++) {
      const pos = (size * i) / GRID_DIVISIONS;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Calculate crosshair position
    const crosshairX = xValue * size;
    const crosshairY = (1 - yValue) * size; // Invert Y

    // Draw crosshair lines (full width/height)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    // Vertical line through crosshair
    ctx.beginPath();
    ctx.moveTo(crosshairX, 0);
    ctx.lineTo(crosshairX, size);
    ctx.stroke();

    // Horizontal line through crosshair
    ctx.beginPath();
    ctx.moveTo(0, crosshairY);
    ctx.lineTo(size, crosshairY);
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Draw crosshair indicator (circle with cross)
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(crosshairX, crosshairY, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle (darker)
    ctx.fillStyle = COLORS.background;
    ctx.beginPath();
    ctx.arc(crosshairX, crosshairY, CROSSHAIR_SIZE / 4, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect when dragging
    if (isDragging) {
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(crosshairX, crosshairY, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [size, xValue, yValue, accentColor, isDragging]);

  // Set up canvas with HiDPI support and redraw when values change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    draw();
  }, [draw, size]);

  /**
   * Handle mouse down - start dragging
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsDragging(true);
      updateFromPosition(e.clientX, e.clientY);
    },
    [updateFromPosition]
  );

  /**
   * Handle mouse move - update values if dragging
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        updateFromPosition(e.clientX, e.clientY);
      }
    },
    [isDragging, updateFromPosition]
  );

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle mouse leave - stop dragging
   */
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle global mouseup to stop dragging when mouse is released outside canvas
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };
      const handleGlobalMouseMove = (e: MouseEvent) => {
        updateFromPosition(e.clientX, e.clientY);
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, updateFromPosition]);

  // Handle touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        setIsDragging(true);
        updateFromPosition(touch.clientX, touch.clientY);
      }
    },
    [updateFromPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch && isDragging) {
        updateFromPosition(touch.clientX, touch.clientY);
      }
    },
    [isDragging, updateFromPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Format display values
  const xDisplayValue = formatValue(xValue, xRange, formatXValue);
  const yDisplayValue = formatValue(yValue, yRange, formatYValue);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        userSelect: 'none',
      }}
    >
      {/* Top label (Y max) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: COLORS.text,
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {yLabel}
        </span>
        <span style={{ color: accentColor, fontFamily: 'monospace' }}>
          {yDisplayValue}
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '8px',
          border: `2px solid ${accentColor}`,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Bottom label (X) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: COLORS.text,
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {xLabel}
        </span>
        <span style={{ color: accentColor, fontFamily: 'monospace' }}>
          {xDisplayValue}
        </span>
      </div>
    </div>
  );
}
