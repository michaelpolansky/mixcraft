/**
 * StepGrid Component
 * Canvas 2D grid display for drum pattern editing
 * Features: step toggle, velocity display, playhead, beat markers, track selection
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { DrumPattern } from '../../core/types.ts';

interface StepGridProps {
  pattern: DrumPattern;
  currentStep: number;
  selectedTrack: number;
  onToggleStep: (trackIndex: number, stepIndex: number) => void;
  onSelectTrack: (trackIndex: number) => void;
  onVelocityChange?: (trackIndex: number, stepIndex: number, velocity: number) => void;
  width?: number;
  height?: number;
  accentColor?: string;
}

// Visual design constants
const COLORS = {
  background: '#1a1a2e',
  gridInactive: '#2d2d44',
  gridBeat: '#3d3d54',
  playhead: '#00ff88',
  selectedRow: 'rgba(255, 255, 255, 0.05)',
  trackLabel: '#888',
  trackLabelSelected: '#fff',
};

const LABEL_WIDTH = 80;
const CELL_PADDING = 2;
const CELL_RADIUS = 3;
const PLAYHEAD_WIDTH = 3;

export function StepGrid({
  pattern,
  currentStep,
  selectedTrack,
  onToggleStep,
  onSelectTrack,
  onVelocityChange,
  width = 600,
  height = 200,
  accentColor = '#4ade80',
}: StepGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverCell, setHoverCell] = useState<{ track: number; step: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTrack, setDragTrack] = useState<number | null>(null);
  const [velocityDragStep, setVelocityDragStep] = useState<{ trackIndex: number; stepIndex: number } | null>(null);

  // Calculate cell dimensions
  const gridWidth = width - LABEL_WIDTH;
  const cellWidth = gridWidth / pattern.stepCount;
  const cellHeight = height / pattern.tracks.length;

  /**
   * Convert x position to step index
   */
  const xToStep = useCallback(
    (x: number): number => {
      const gridX = x - LABEL_WIDTH;
      if (gridX < 0) return -1;
      return Math.floor(gridX / cellWidth);
    },
    [cellWidth]
  );

  /**
   * Convert y position to track index
   */
  const yToTrack = useCallback(
    (y: number): number => {
      return Math.floor(y / cellHeight);
    },
    [cellHeight]
  );

  /**
   * Draw the grid
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw track rows
    pattern.tracks.forEach((track, trackIndex) => {
      const y = trackIndex * cellHeight;
      const isSelected = trackIndex === selectedTrack;

      // Selected track highlight
      if (isSelected) {
        ctx.fillStyle = COLORS.selectedRow;
        ctx.fillRect(0, y, width, cellHeight);
      }

      // Track label
      ctx.fillStyle = isSelected ? COLORS.trackLabelSelected : COLORS.trackLabel;
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(track.name, 8, y + cellHeight / 2);

      // Draw step cells
      track.steps.forEach((step, stepIndex) => {
        const x = LABEL_WIDTH + stepIndex * cellWidth;
        const isBeat = stepIndex % 4 === 0;
        const isHovered =
          hoverCell?.track === trackIndex && hoverCell?.step === stepIndex;
        const isPlayhead = stepIndex === currentStep;

        // Cell background
        const cellX = x + CELL_PADDING;
        const cellY = y + CELL_PADDING;
        const cellW = cellWidth - CELL_PADDING * 2;
        const cellH = cellHeight - CELL_PADDING * 2;

        // Draw cell background (beat markers or inactive)
        ctx.fillStyle = isBeat ? COLORS.gridBeat : COLORS.gridInactive;
        ctx.beginPath();
        ctx.roundRect(cellX, cellY, cellW, cellH, CELL_RADIUS);
        ctx.fill();

        // Draw active step with velocity-based opacity
        if (step.active) {
          const opacity = 0.4 + step.velocity * 0.6; // Range from 0.4 to 1.0
          ctx.fillStyle = hexToRgba(accentColor, opacity);
          ctx.beginPath();
          ctx.roundRect(cellX, cellY, cellW, cellH, CELL_RADIUS);
          ctx.fill();

          // Add glow effect for high velocity
          if (step.velocity > 0.7) {
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = step.velocity * 8;
            ctx.beginPath();
            ctx.roundRect(cellX, cellY, cellW, cellH, CELL_RADIUS);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
          }
        }

        // Hover highlight
        if (isHovered && !step.active) {
          ctx.fillStyle = hexToRgba(accentColor, 0.2);
          ctx.beginPath();
          ctx.roundRect(cellX, cellY, cellW, cellH, CELL_RADIUS);
          ctx.fill();
        }

        // Cell border for active steps
        if (step.active) {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cellX, cellY, cellW, cellH, CELL_RADIUS);
          ctx.stroke();
        }
      });
    });

    // Draw playhead
    if (currentStep >= 0 && currentStep < pattern.stepCount) {
      const playheadX = LABEL_WIDTH + currentStep * cellWidth + cellWidth / 2;
      ctx.fillStyle = COLORS.playhead;
      ctx.fillRect(playheadX - PLAYHEAD_WIDTH / 2, 0, PLAYHEAD_WIDTH, height);

      // Add glow to playhead
      ctx.shadowColor = COLORS.playhead;
      ctx.shadowBlur = 10;
      ctx.fillRect(playheadX - PLAYHEAD_WIDTH / 2, 0, PLAYHEAD_WIDTH, height);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    // Draw grid lines for beat markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= pattern.stepCount; i++) {
      if (i % 4 === 0) {
        const x = LABEL_WIDTH + i * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Draw beat numbers at top
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < pattern.stepCount; i += 4) {
      const x = LABEL_WIDTH + i * cellWidth + cellWidth * 2;
      ctx.fillText(`${i / 4 + 1}`, x, 2);
    }
  }, [
    pattern,
    currentStep,
    selectedTrack,
    width,
    height,
    cellWidth,
    cellHeight,
    accentColor,
    hoverCell,
  ]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  /**
   * Handle mouse down - toggle step, select track, or start velocity drag (Shift+click)
   *
   * Velocity drag modes:
   * - Mode 1: Shift+click on active step = velocity drag mode (adjust velocity by Y position)
   * - Mode 2: Normal click = toggle step on/off
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const stepIndex = xToStep(x);
      const trackIndex = yToTrack(y);

      if (trackIndex < 0 || trackIndex >= pattern.tracks.length) return;

      // Clicking in label area selects track
      if (stepIndex < 0) {
        onSelectTrack(trackIndex);
        return;
      }

      // Clicking in grid area
      if (stepIndex >= 0 && stepIndex < pattern.stepCount) {
        const step = pattern.tracks[trackIndex]?.steps[stepIndex];

        // Shift+click: start velocity drag mode if step is active
        if (e.shiftKey && step?.active) {
          setIsDragging(true);
          setVelocityDragStep({ trackIndex, stepIndex });

          // Immediately update velocity based on Y position in cell
          if (onVelocityChange) {
            const cellY = trackIndex * cellHeight;
            const relativeY = 1 - (y - cellY) / cellHeight;
            const newVelocity = Math.max(0, Math.min(1, relativeY));
            onVelocityChange(trackIndex, stepIndex, newVelocity);
          }
        } else {
          // Normal toggle behavior
          onToggleStep(trackIndex, stepIndex);
          setIsDragging(true);
          setDragTrack(trackIndex);
        }
      }
    },
    [pattern, xToStep, yToTrack, cellHeight, onToggleStep, onSelectTrack, onVelocityChange]
  );

  /**
   * Handle mouse move - update hover state and handle velocity drag
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const stepIndex = xToStep(x);
      const trackIndex = yToTrack(y);

      // Update hover state
      if (
        stepIndex >= 0 &&
        stepIndex < pattern.stepCount &&
        trackIndex >= 0 &&
        trackIndex < pattern.tracks.length
      ) {
        setHoverCell({ track: trackIndex, step: stepIndex });

        // Update cursor
        canvas.style.cursor = 'pointer';

        // Handle velocity drag mode (Shift+click)
        if (isDragging && velocityDragStep && onVelocityChange) {
          const step = pattern.tracks[velocityDragStep.trackIndex]?.steps[velocityDragStep.stepIndex];
          if (step?.active) {
            // Calculate velocity from y position within cell
            const cellY = velocityDragStep.trackIndex * cellHeight;
            const relativeY = 1 - (y - cellY) / cellHeight;
            const newVelocity = Math.max(0, Math.min(1, relativeY));
            onVelocityChange(velocityDragStep.trackIndex, velocityDragStep.stepIndex, newVelocity);
          }
        }
        // Handle regular drag velocity adjustment on same track
        else if (isDragging && dragTrack === trackIndex && onVelocityChange) {
          const step = pattern.tracks[trackIndex]?.steps[stepIndex];
          if (step?.active) {
            // Calculate velocity from y position within cell
            const cellY = trackIndex * cellHeight;
            const relativeY = 1 - (y - cellY) / cellHeight;
            const newVelocity = Math.max(0, Math.min(1, relativeY));
            onVelocityChange(trackIndex, stepIndex, newVelocity);
          }
        }
      } else if (stepIndex < 0 && trackIndex >= 0 && trackIndex < pattern.tracks.length) {
        // Hovering over label area
        setHoverCell(null);
        canvas.style.cursor = 'pointer';
      } else {
        setHoverCell(null);
        canvas.style.cursor = 'default';
      }
    },
    [
      pattern,
      xToStep,
      yToTrack,
      cellHeight,
      isDragging,
      dragTrack,
      velocityDragStep,
      onVelocityChange,
    ]
  );

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTrack(null);
    setVelocityDragStep(null);
  }, []);

  /**
   * Handle mouse leave - clear hover state
   */
  const handleMouseLeave = useCallback(() => {
    setHoverCell(null);
    setIsDragging(false);
    setDragTrack(null);
    setVelocityDragStep(null);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, []);

  // Handle global mouseup to stop dragging when mouse is released outside canvas
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setDragTrack(null);
        setVelocityDragStep(null);
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        borderRadius: '8px',
        display: 'block',
        border: '1px solid #333',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
