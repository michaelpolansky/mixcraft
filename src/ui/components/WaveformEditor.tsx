/**
 * WaveformEditor
 * Canvas 2D-based waveform visualization with interactive selection and slice markers
 * Used for sample manipulation in the Sampling track
 */

import { useRef, useEffect, useCallback, useState } from 'react';

interface Slice {
  id: string;
  start: number;
  end: number;
}

interface WaveformEditorProps {
  /** Audio waveform data as Float32Array (-1 to 1 values) */
  waveformData: Float32Array | null;
  /** Total duration of the audio in seconds */
  duration: number;
  /** Start point of selection (0-1 normalized) */
  startPoint: number;
  /** End point of selection (0-1 normalized) */
  endPoint: number;
  /** Array of slice markers */
  slices: Slice[];
  /** Index of currently selected slice (-1 for none) */
  selectedSlice: number;
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** Accent color for selection and waveform */
  accentColor?: string;
  /** Callback when start point is dragged */
  onStartPointChange?: (point: number) => void;
  /** Callback when end point is dragged */
  onEndPointChange?: (point: number) => void;
  /** Callback when a slice is clicked */
  onSliceSelect?: (index: number) => void;
  /** Callback when double-clicking to add a slice */
  onAddSlice?: (start: number, end: number) => void;
}

/**
 * Formats seconds to MM:SS.ss format
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
};

const HANDLE_WIDTH = 10;
const HANDLE_HEIGHT = 16;
const TIME_MARKER_HEIGHT = 20;
const SLICE_MARKER_WIDTH = 3;

export function WaveformEditor({
  waveformData,
  duration,
  startPoint,
  endPoint,
  slices,
  selectedSlice,
  width = 600,
  height = 150,
  accentColor = '#4ade80',
  onStartPointChange,
  onEndPointChange,
  onSliceSelect,
  onAddSlice,
}: WaveformEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  // Calculate display area (accounting for time marker area at bottom)
  const waveformHeight = height - TIME_MARKER_HEIGHT;

  /**
   * Convert x pixel position to normalized 0-1 value
   */
  const xToNormalized = useCallback(
    (x: number): number => {
      return Math.max(0, Math.min(1, x / width));
    },
    [width]
  );

  /**
   * Convert normalized 0-1 value to x pixel position
   */
  const normalizedToX = useCallback(
    (normalized: number): number => {
      return normalized * width;
    },
    [width]
  );

  /**
   * Check if a point is near the start handle
   */
  const isNearStartHandle = useCallback(
    (x: number, y: number): boolean => {
      const handleX = normalizedToX(startPoint);
      return (
        x >= handleX - HANDLE_WIDTH / 2 &&
        x <= handleX + HANDLE_WIDTH / 2 &&
        y <= HANDLE_HEIGHT
      );
    },
    [normalizedToX, startPoint]
  );

  /**
   * Check if a point is near the end handle
   */
  const isNearEndHandle = useCallback(
    (x: number, y: number): boolean => {
      const handleX = normalizedToX(endPoint);
      return (
        x >= handleX - HANDLE_WIDTH / 2 &&
        x <= handleX + HANDLE_WIDTH / 2 &&
        y <= HANDLE_HEIGHT
      );
    },
    [normalizedToX, endPoint]
  );

  /**
   * Draw the waveform editor
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Draw selection region (before waveform for layering)
    const startX = normalizedToX(startPoint);
    const endX = normalizedToX(endPoint);
    ctx.fillStyle = accentColor + '20'; // 12% opacity
    ctx.fillRect(startX, 0, endX - startX, waveformHeight);

    // Draw waveform
    if (waveformData && waveformData.length > 0) {
      const samplesPerPixel = Math.ceil(waveformData.length / width);
      const centerY = waveformHeight / 2;
      const amplitude = waveformHeight * 0.45;

      for (let x = 0; x < width; x++) {
        // Get min/max for this pixel column
        const startSample = Math.floor((x / width) * waveformData.length);
        const endSample = Math.min(
          startSample + samplesPerPixel,
          waveformData.length
        );

        let min = 0;
        let max = 0;
        for (let i = startSample; i < endSample; i++) {
          const sample = waveformData[i] ?? 0;
          if (sample < min) min = sample;
          if (sample > max) max = sample;
        }

        // Determine if this x position is within selection
        const normalized = x / width;
        const isInSelection = normalized >= startPoint && normalized <= endPoint;

        // Draw bar from min to max
        const y1 = centerY - max * amplitude;
        const y2 = centerY - min * amplitude;
        const barHeight = Math.max(1, y2 - y1);

        ctx.fillStyle = isInSelection ? accentColor : '#555';
        ctx.fillRect(x, y1, 1, barHeight);
      }
    } else {
      // No waveform data - draw center line
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, waveformHeight / 2);
      ctx.lineTo(width, waveformHeight / 2);
      ctx.stroke();
    }

    // Draw slice markers
    slices.forEach((slice, index) => {
      const sliceStartX = normalizedToX(slice.start);
      const sliceEndX = normalizedToX(slice.end);
      const isSelected = index === selectedSlice;
      const markerColor = isSelected ? '#f97316' : '#666';

      // Draw slice region highlight if selected
      if (isSelected) {
        ctx.fillStyle = '#f9731620';
        ctx.fillRect(sliceStartX, 0, sliceEndX - sliceStartX, waveformHeight);
      }

      // Draw start marker
      ctx.fillStyle = markerColor;
      ctx.fillRect(sliceStartX - SLICE_MARKER_WIDTH / 2, 0, SLICE_MARKER_WIDTH, waveformHeight);

      // Draw end marker
      ctx.fillRect(sliceEndX - SLICE_MARKER_WIDTH / 2, 0, SLICE_MARKER_WIDTH, waveformHeight);

      // Draw slice number
      ctx.fillStyle = isSelected ? '#f97316' : '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const centerX = (sliceStartX + sliceEndX) / 2;
      ctx.fillText(`${index + 1}`, centerX, 12);
    });

    // Draw start/end handles (triangular)
    const drawHandle = (x: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - HANDLE_WIDTH / 2, HANDLE_HEIGHT);
      ctx.lineTo(x + HANDLE_WIDTH / 2, HANDLE_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw vertical line from handle
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, HANDLE_HEIGHT);
      ctx.lineTo(x, waveformHeight);
      ctx.stroke();
    };

    drawHandle(startX, accentColor);
    drawHandle(endX, accentColor);

    // Draw time marker area background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, waveformHeight, width, TIME_MARKER_HEIGHT);

    // Draw time markers
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';

    // Start time
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(startPoint * duration), startX + 4, height - 6);

    // End time
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(endPoint * duration), endX - 4, height - 6);

    // Total duration (right edge)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555';
    ctx.fillText(formatTime(duration), width - 4, height - 6);

    // Draw hover indicator
    if (hoverX !== null && dragging === null) {
      const hoverTime = xToNormalized(hoverX) * duration;

      // Dashed vertical line
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, waveformHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Time at hover position
      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(formatTime(hoverTime), hoverX, height - 6);
    }
  }, [
    waveformData,
    duration,
    startPoint,
    endPoint,
    slices,
    selectedSlice,
    width,
    height,
    waveformHeight,
    accentColor,
    normalizedToX,
    xToNormalized,
    hoverX,
    dragging,
  ]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle global mouseup to stop dragging when mouse is released outside canvas
  useEffect(() => {
    if (dragging) {
      const handleGlobalMouseUp = () => setDragging(null);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [dragging]);

  /**
   * Handle mouse down - start dragging handles
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on start or end handle
      if (isNearStartHandle(x, y)) {
        setDragging('start');
        e.preventDefault();
      } else if (isNearEndHandle(x, y)) {
        setDragging('end');
        e.preventDefault();
      } else {
        // Check if clicking on a slice
        const clickedNormalized = xToNormalized(x);
        const clickedSliceIndex = slices.findIndex(
          (slice) =>
            clickedNormalized >= slice.start && clickedNormalized <= slice.end
        );
        if (clickedSliceIndex !== -1 && onSliceSelect) {
          onSliceSelect(clickedSliceIndex);
        }
      }
    },
    [isNearStartHandle, isNearEndHandle, xToNormalized, slices, onSliceSelect]
  );

  /**
   * Handle mouse move - update hover position or drag handles
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (dragging === 'start' && onStartPointChange) {
        const newPoint = xToNormalized(x);
        // Ensure start doesn't go past end
        onStartPointChange(Math.min(newPoint, endPoint - 0.01));
      } else if (dragging === 'end' && onEndPointChange) {
        const newPoint = xToNormalized(x);
        // Ensure end doesn't go before start
        onEndPointChange(Math.max(newPoint, startPoint + 0.01));
      } else {
        setHoverX(x);
      }

      // Update cursor
      const y = e.clientY - rect.top;
      if (isNearStartHandle(x, y) || isNearEndHandle(x, y) || dragging) {
        canvas.style.cursor = 'ew-resize';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    },
    [
      dragging,
      onStartPointChange,
      onEndPointChange,
      xToNormalized,
      startPoint,
      endPoint,
      isNearStartHandle,
      isNearEndHandle,
    ]
  );

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  /**
   * Handle mouse leave - clear hover state
   */
  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
    setDragging(null);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, []);

  /**
   * Handle double click - add slice at position
   */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onAddSlice) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedNormalized = xToNormalized(x);

      // Create a small slice around the click point (5% of total duration)
      const sliceWidth = 0.05;
      const sliceStart = Math.max(0, clickedNormalized - sliceWidth / 2);
      const sliceEnd = Math.min(1, clickedNormalized + sliceWidth / 2);

      onAddSlice(sliceStart, sliceEnd);
    },
    [onAddSlice, xToNormalized]
  );

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
      onDoubleClick={handleDoubleClick}
    />
  );
}
