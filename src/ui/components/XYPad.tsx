/**
 * XY Pad Component
 * 2D control surface for simultaneous control of two parameters
 * Inspired by Ableton Learning Synths-style interaction
 *
 * Features:
 * - Motion trail while dragging
 * - Smooth crosshair animation
 * - Click pulse effect
 * - Keyboard control (arrow keys)
 * - Shift+drag for precision
 * - Double-click to reset
 * - Optional click sound and theremin mode
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
  /** Enable click sound (default true) */
  enableClickSound?: boolean;
  /** Enable theremin mode - continuous tone while dragging (default false) */
  enableThereminMode?: boolean;
}

// Visual design constants
const COLORS = {
  background: '#1a1a2e',
  grid: '#2d2d44',
  crosshair: '#3b82f6',
  text: '#888',
  border: '#3b82f6',
  focus: '#3b82f6',
};

const GRID_DIVISIONS = 4;
const CROSSHAIR_SIZE = 12;
const TRAIL_LENGTH = 25;
const LERP_SPEED = 0.15;
const PRECISION_RATIO = 0.25; // 4:1 ratio when shift held
const PULSE_DURATION = 300;
const PULSE_MAX_SCALE = 3;

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface PulseState {
  x: number;
  y: number;
  startTime: number;
  active: boolean;
}

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
  enableClickSound = true,
  enableThereminMode = false,
}: XYPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const thereminOscRef = useRef<OscillatorNode | null>(null);
  const thereminGainRef = useRef<GainNode | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);

  // Visual state (smoothed positions)
  const visualPosRef = useRef({ x: xValue, y: yValue });
  const trailRef = useRef<TrailPoint[]>([]);
  const pulseRef = useRef<PulseState>({ x: 0, y: 0, startTime: 0, active: false });
  const lastDragPosRef = useRef({ x: 0, y: 0 });

  /**
   * Initialize audio context lazily
   */
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play click sound
   */
  const playClickSound = useCallback(() => {
    if (!enableClickSound) return;

    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context not available
    }
  }, [enableClickSound, getAudioContext]);

  /**
   * Start theremin oscillator
   */
  const startTheremin = useCallback(() => {
    if (!enableThereminMode) return;

    try {
      const ctx = getAudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(100 + xValue * 700, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15 * yValue, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      thereminOscRef.current = osc;
      thereminGainRef.current = gain;
    } catch {
      // Audio context not available
    }
  }, [enableThereminMode, getAudioContext, xValue, yValue]);

  /**
   * Update theremin pitch/volume
   */
  const updateTheremin = useCallback(() => {
    if (!thereminOscRef.current || !thereminGainRef.current) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    thereminOscRef.current.frequency.setValueAtTime(100 + xValue * 700, ctx.currentTime);
    thereminGainRef.current.gain.setValueAtTime(0.15 * yValue, ctx.currentTime);
  }, [xValue, yValue]);

  /**
   * Stop theremin oscillator
   */
  const stopTheremin = useCallback(() => {
    if (thereminOscRef.current && thereminGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      thereminGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      thereminOscRef.current.stop(ctx.currentTime + 0.15);
      thereminOscRef.current = null;
      thereminGainRef.current = null;
    }
  }, []);

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
   * Update values based on mouse/touch position with optional precision mode
   */
  const updateFromPosition = useCallback(
    (clientX: number, clientY: number, precision: boolean = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      if (precision && isDragging) {
        // Precision mode: calculate delta from last position
        const deltaX = (clientX - lastDragPosRef.current.x) * PRECISION_RATIO;
        const deltaY = (clientY - lastDragPosRef.current.y) * PRECISION_RATIO;

        const newX = Math.max(0, Math.min(1, xValue + deltaX / size));
        const newY = Math.max(0, Math.min(1, yValue - deltaY / size));

        onXChange(newX);
        onYChange(newY);
      } else {
        // Normal mode: direct position mapping
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const normalizedX = Math.max(0, Math.min(1, x / size));
        const normalizedY = Math.max(0, Math.min(1, 1 - y / size));

        onXChange(normalizedX);
        onYChange(normalizedY);
      }

      lastDragPosRef.current = { x: clientX, y: clientY };

      // Add to trail
      if (isDragging) {
        const trail = trailRef.current;
        trail.push({ x: xValue, y: yValue, age: 0 });
        if (trail.length > TRAIL_LENGTH) {
          trail.shift();
        }
      }
    },
    [size, xValue, yValue, onXChange, onYChange, isDragging]
  );

  /**
   * Draw the XY Pad with all visual effects
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lerp visual position toward actual position
    visualPosRef.current.x += (xValue - visualPosRef.current.x) * LERP_SPEED;
    visualPosRef.current.y += (yValue - visualPosRef.current.y) * LERP_SPEED;

    const visualX = visualPosRef.current.x * size;
    const visualY = (1 - visualPosRef.current.y) * size;

    // Clear canvas with background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, size, size);

    // Draw grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_DIVISIONS; i++) {
      const pos = (size * i) / GRID_DIVISIONS;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Draw motion trail
    const trail = trailRef.current;
    trail.forEach((point, i) => {
      point.age++;
      const alpha = Math.max(0, 1 - point.age / (TRAIL_LENGTH * 2));
      if (alpha > 0) {
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(point.x * size, (1 - point.y) * size, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // Remove old trail points
    trailRef.current = trail.filter(p => p.age < TRAIL_LENGTH * 2);
    ctx.globalAlpha = 1;

    // Draw pulse effect
    const pulse = pulseRef.current;
    if (pulse.active) {
      const elapsed = Date.now() - pulse.startTime;
      const progress = Math.min(1, elapsed / PULSE_DURATION);

      if (progress < 1) {
        const scale = 1 + progress * (PULSE_MAX_SCALE - 1);
        const alpha = 1 - progress;

        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = alpha * 0.6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, (CROSSHAIR_SIZE / 2) * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        pulse.active = false;
      }
    }

    // Draw crosshair lines (full width/height)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(visualX, 0);
    ctx.lineTo(visualX, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, visualY);
    ctx.lineTo(size, visualY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw crosshair indicator
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(visualX, visualY, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = COLORS.background;
    ctx.beginPath();
    ctx.arc(visualX, visualY, CROSSHAIR_SIZE / 4, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect when dragging
    if (isDragging) {
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(visualX, visualY, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Precision mode indicator
    if (isShiftHeld && isDragging) {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(visualX, visualY, CROSSHAIR_SIZE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [size, xValue, yValue, accentColor, isDragging, isShiftHeld]);

  // Animation loop
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

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw, size]);

  // Update theremin when values change
  useEffect(() => {
    if (isDragging && enableThereminMode) {
      updateTheremin();
    }
  }, [isDragging, enableThereminMode, updateTheremin]);

  /**
   * Handle mouse down - start dragging
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsDragging(true);
      lastDragPosRef.current = { x: e.clientX, y: e.clientY };
      updateFromPosition(e.clientX, e.clientY, e.shiftKey);

      // Trigger pulse
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        pulseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          startTime: Date.now(),
          active: true,
        };
      }

      playClickSound();
      startTheremin();
    },
    [updateFromPosition, playClickSound, startTheremin]
  );

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    trailRef.current = [];
    stopTheremin();
  }, [stopTheremin]);

  /**
   * Handle double click - reset to center
   */
  const handleDoubleClick = useCallback(() => {
    onXChange(0.5);
    onYChange(0.5);

    // Trigger pulse at center
    pulseRef.current = {
      x: size / 2,
      y: size / 2,
      startTime: Date.now(),
      active: true,
    };

    playClickSound();
  }, [onXChange, onYChange, size, playClickSound]);

  // Handle global mouse events
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        trailRef.current = [];
        stopTheremin();
      };
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setIsShiftHeld(e.shiftKey);
        updateFromPosition(e.clientX, e.clientY, e.shiftKey);
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, updateFromPosition, stopTheremin]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      const step = e.shiftKey ? 0.1 : 0.01;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onXChange(Math.max(0, xValue - step));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onXChange(Math.min(1, xValue + step));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onYChange(Math.min(1, yValue + step));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onYChange(Math.max(0, yValue - step));
          break;
        case ' ':
          e.preventDefault();
          handleDoubleClick(); // Space also resets to center
          break;
      }

      setIsShiftHeld(e.shiftKey);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setIsShiftHeld(e.shiftKey);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFocused, xValue, yValue, onXChange, onYChange, handleDoubleClick]);

  // Handle touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        setIsDragging(true);
        lastDragPosRef.current = { x: touch.clientX, y: touch.clientY };
        updateFromPosition(touch.clientX, touch.clientY);

        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          pulseRef.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            startTime: Date.now(),
            active: true,
          };
        }

        playClickSound();
        startTheremin();
      }
    },
    [updateFromPosition, playClickSound, startTheremin]
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
    trailRef.current = [];
    stopTheremin();
  }, [stopTheremin]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopTheremin();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopTheremin]);

  const xDisplayValue = formatValue(xValue, xRange, formatXValue);
  const yDisplayValue = formatValue(yValue, yRange, formatYValue);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        userSelect: 'none',
      }}
    >
      {/* Top label (Y) */}
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
        tabIndex={0}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '8px',
          border: `2px solid ${isFocused ? COLORS.focus : accentColor}`,
          cursor: isDragging
            ? (isShiftHeld ? 'crosshair' : 'grabbing')
            : 'grab',
          display: 'block',
          outline: 'none',
          boxShadow: isFocused ? `0 0 0 2px ${COLORS.focus}40` : 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
