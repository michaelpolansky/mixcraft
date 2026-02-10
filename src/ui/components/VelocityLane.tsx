/**
 * VelocityLane Component
 * Bar graph showing velocity for each step with click/drag editing
 * Shows velocity bars only for active steps
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { DrumTrack } from '../../core/types.ts';

interface VelocityLaneProps {
  track: DrumTrack;
  trackIndex: number;
  onVelocityChange: (stepIndex: number, velocity: number) => void;
  width?: number;
  height?: number;
  accentColor?: string;
}

// Visual design constants
const COLORS = {
  background: '#1a1a2e',
  gridLine: '#2d2d44',
  gridLineBeat: '#3d3d54',
  barInactive: '#333',
  labelColor: '#666',
};

const LABEL_WIDTH = 80; // Match StepGrid
const BAR_PADDING = 2;
const BAR_RADIUS = 2;

export function VelocityLane({
  track,
  trackIndex,
  onVelocityChange,
  width = 600,
  height = 60,
  accentColor = '#4ade80',
}: VelocityLaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverStep, setHoverStep] = useState<number | null>(null);

  // Calculate bar dimensions
  const gridWidth = width - LABEL_WIDTH;
  const stepCount = track.steps.length;
  const barWidth = gridWidth / stepCount;
  const drawableHeight = height - 4; // Padding for labels

  /**
   * Convert x position to step index
   */
  const xToStep = useCallback(
    (x: number): number => {
      const gridX = x - LABEL_WIDTH;
      if (gridX < 0) return -1;
      return Math.floor(gridX / barWidth);
    },
    [barWidth]
  );

  /**
   * Convert y position to velocity (0-1)
   */
  const yToVelocity = useCallback(
    (y: number): number => {
      // Y is inverted: top = high velocity, bottom = low
      const normalizedY = y / drawableHeight;
      return Math.max(0, Math.min(1, 1 - normalizedY));
    },
    [drawableHeight]
  );

  /**
   * Draw the velocity lane
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw label area
    ctx.fillStyle = COLORS.labelColor;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Velocity', 8, height / 2);

    // Draw horizontal grid lines at 25%, 50%, 75%
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    [0.25, 0.5, 0.75].forEach((level) => {
      const y = drawableHeight * (1 - level);
      ctx.beginPath();
      ctx.moveTo(LABEL_WIDTH, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw vertical beat markers
    for (let i = 0; i <= stepCount; i++) {
      if (i % 4 === 0) {
        const x = LABEL_WIDTH + i * barWidth;
        ctx.strokeStyle = COLORS.gridLineBeat;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Draw velocity bars for each step
    track.steps.forEach((step, stepIndex) => {
      const x = LABEL_WIDTH + stepIndex * barWidth;
      const barX = x + BAR_PADDING;
      const barW = barWidth - BAR_PADDING * 2;
      const isHovered = stepIndex === hoverStep;

      if (step.active) {
        // Draw velocity bar
        const barHeight = step.velocity * drawableHeight;
        const barY = drawableHeight - barHeight;

        // Create gradient for bar
        const gradient = ctx.createLinearGradient(barX, drawableHeight, barX, barY);
        gradient.addColorStop(0, adjustBrightness(accentColor, 0.6));
        gradient.addColorStop(1, accentColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barHeight, [BAR_RADIUS, BAR_RADIUS, 0, 0]);
        ctx.fill();

        // Add glow for high velocity
        if (step.velocity > 0.7) {
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = step.velocity * 6;
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barHeight, [BAR_RADIUS, BAR_RADIUS, 0, 0]);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        // Hover highlight
        if (isHovered) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barHeight, [BAR_RADIUS, BAR_RADIUS, 0, 0]);
          ctx.stroke();

          // Show velocity value
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(
            `${Math.round(step.velocity * 100)}`,
            barX + barW / 2,
            barY - 2
          );
        }
      } else {
        // Draw inactive step indicator (subtle line at bottom)
        ctx.fillStyle = COLORS.barInactive;
        ctx.beginPath();
        ctx.roundRect(
          barX,
          drawableHeight - 4,
          barW,
          4,
          [BAR_RADIUS, BAR_RADIUS, 0, 0]
        );
        ctx.fill();
      }
    });

    // Draw velocity scale labels
    ctx.fillStyle = COLORS.labelColor;
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('100', LABEL_WIDTH - 4, 8);
    ctx.fillText('50', LABEL_WIDTH - 4, drawableHeight / 2);
    ctx.fillText('0', LABEL_WIDTH - 4, drawableHeight - 4);
  }, [track, width, height, drawableHeight, barWidth, stepCount, accentColor, hoverStep]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  /**
   * Handle mouse down - start velocity edit
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const stepIndex = xToStep(x);

      if (stepIndex < 0 || stepIndex >= stepCount) return;

      // Only allow editing active steps
      const step = track.steps[stepIndex];
      if (!step?.active) return;

      const velocity = yToVelocity(y);
      onVelocityChange(stepIndex, velocity);
      setIsDragging(true);
    },
    [track.steps, stepCount, xToStep, yToVelocity, onVelocityChange]
  );

  /**
   * Handle mouse move - update velocity while dragging
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const stepIndex = xToStep(x);

      if (stepIndex >= 0 && stepIndex < stepCount) {
        const step = track.steps[stepIndex];
        if (step?.active) {
          setHoverStep(stepIndex);
          canvas.style.cursor = 'ns-resize';

          // Update velocity while dragging
          if (isDragging) {
            const velocity = yToVelocity(y);
            onVelocityChange(stepIndex, velocity);
          }
        } else {
          setHoverStep(null);
          canvas.style.cursor = 'default';
        }
      } else {
        setHoverStep(null);
        canvas.style.cursor = 'default';
      }
    },
    [track.steps, stepCount, xToStep, yToVelocity, isDragging, onVelocityChange]
  );

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle mouse leave - clear state
   */
  const handleMouseLeave = useCallback(() => {
    setHoverStep(null);
    setIsDragging(false);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg block border border-border-default"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/**
 * Adjusts the brightness of a hex color
 */
function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `rgb(${newR}, ${newG}, ${newB})`;
}
