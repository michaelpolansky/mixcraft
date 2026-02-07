/**
 * FilterVisualizer - Draggable frequency response visualization
 * Ableton Learning Synths-style interactive filter display
 */

import React, { useRef, useEffect, useCallback, useState, memo } from 'react';

interface FilterVisualizerProps {
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  cutoff: number;       // 20-20000 Hz
  resonance: number;    // 0-20 Q
  onCutoffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
  width?: number;
  height?: number;
  accentColor?: string;
  compact?: boolean; // Remove labels and reduce padding for small sizes
}

// Frequency range (logarithmic)
const MIN_FREQ = 20;
const MAX_FREQ = 20000;

// dB range
const MIN_DB = -24;
const MAX_DB = 18;

/**
 * Convert frequency to x position (logarithmic scale)
 */
function freqToX(freq: number, drawWidth: number, padding: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const freqLog = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq)));
  return padding + ((freqLog - minLog) / (maxLog - minLog)) * drawWidth;
}

/**
 * Convert x position to frequency (logarithmic scale)
 */
function xToFreq(x: number, drawWidth: number, padding: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const normalized = (x - padding) / drawWidth;
  const freqLog = minLog + normalized * (maxLog - minLog);
  return Math.pow(10, freqLog);
}

/**
 * Convert dB to y position
 */
function dbToY(db: number, drawHeight: number, topPadding: number): number {
  const normalized = (db - MIN_DB) / (MAX_DB - MIN_DB);
  return topPadding + drawHeight - normalized * drawHeight;
}

/**
 * Convert y position to resonance (Q)
 */
function yToResonance(y: number, drawHeight: number, topPadding: number): number {
  // Map from top of canvas (high resonance) to bottom (low resonance)
  const normalized = 1 - (y - topPadding) / drawHeight;
  return Math.max(0.5, Math.min(20, normalized * 20));
}

/**
 * Calculate filter response at a given frequency
 */
function calculateResponse(
  filterType: 'lowpass' | 'highpass' | 'bandpass',
  cutoff: number,
  resonance: number,
  freq: number
): number {
  const Q = Math.max(0.5, Math.min(20, resonance));
  const ratio = freq / cutoff;

  let magnitude: number;

  switch (filterType) {
    case 'lowpass': {
      const x = ratio * ratio;
      const denominator = Math.sqrt(Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2));
      magnitude = 1 / denominator;
      break;
    }
    case 'highpass': {
      const x = ratio * ratio;
      const denominator = Math.sqrt(Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2));
      magnitude = x / denominator;
      break;
    }
    case 'bandpass': {
      const x = ratio * ratio;
      const denominator = Math.sqrt(Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2));
      magnitude = (ratio / Q) / denominator;
      break;
    }
    default:
      magnitude = 1;
  }

  const db = 20 * Math.log10(Math.max(0.001, magnitude));
  return Math.max(MIN_DB, Math.min(MAX_DB, db));
}

const FilterVisualizerComponent: React.FC<FilterVisualizerProps> = ({
  filterType,
  cutoff,
  resonance,
  onCutoffChange,
  onResonanceChange,
  width = 500,
  height = 250,
  accentColor = '#06b6d4',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const padding = compact ? 10 : 40;
  const topPadding = compact ? 10 : 40;
  const bottomPadding = compact ? 10 : 30;
  const drawWidth = width - padding * 2;
  const drawHeight = height - topPadding - bottomPadding;

  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw labels only in non-compact mode
    if (!compact) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('FILTER', padding, 24);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(filterType.toUpperCase(), width - padding, 24);
    }

    // Draw frequency grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Draw frequency grid and labels (reduced in compact mode)
    if (!compact) {
      const freqMarkers = [100, 1000, 10000];
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

      freqMarkers.forEach(freq => {
        const x = freqToX(freq, drawWidth, padding);
        ctx.beginPath();
        ctx.moveTo(x, topPadding);
        ctx.lineTo(x, topPadding + drawHeight);
        ctx.stroke();

        const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
        ctx.fillText(label, x, height - 8);
      });

      // Draw 0dB reference line
      const zeroY = dbToY(0, drawHeight, topPadding);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(padding + drawWidth, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw dB labels
      ctx.textAlign = 'right';
      ctx.fillText('0dB', padding - 4, zeroY + 3);
      ctx.fillText('+12', padding - 4, dbToY(12, drawHeight, topPadding) + 3);
      ctx.fillText('-12', padding - 4, dbToY(-12, drawHeight, topPadding) + 3);
    }

    // Draw filter response curve with glow
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = padding + (i / steps) * drawWidth;
      const freq = xToFreq(x, drawWidth, padding);
      const db = calculateResponse(filterType, cutoff, resonance, freq);
      const y = dbToY(db, drawHeight, topPadding);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Fill under curve
    ctx.beginPath();
    ctx.moveTo(padding, topPadding + drawHeight);
    for (let i = 0; i <= steps; i++) {
      const x = padding + (i / steps) * drawWidth;
      const freq = xToFreq(x, drawWidth, padding);
      const db = calculateResponse(filterType, cutoff, resonance, freq);
      const y = dbToY(db, drawHeight, topPadding);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padding + drawWidth, topPadding + drawHeight);
    ctx.closePath();
    ctx.fillStyle = `${accentColor}20`;
    ctx.fill();

    // Draw cutoff control point
    const cutoffX = freqToX(cutoff, drawWidth, padding);
    const cutoffDb = calculateResponse(filterType, cutoff, resonance, cutoff);
    const cutoffY = dbToY(cutoffDb, drawHeight, topPadding);

    // Resonance peak indicator
    if (resonance > 2) {
      const peakDb = calculateResponse(filterType, cutoff, resonance, cutoff);
      const peakY = dbToY(peakDb, drawHeight, topPadding);

      // Glow around peak
      const gradient = ctx.createRadialGradient(cutoffX, peakY, 0, cutoffX, peakY, 30);
      gradient.addColorStop(0, `${accentColor}40`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(cutoffX - 30, peakY - 30, 60, 60);
    }

    // Control point (larger when hovering/dragging)
    const radius = isDragging ? 12 : isHovering ? 10 : 8;

    // Outer glow
    ctx.beginPath();
    ctx.arc(cutoffX, cutoffY, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = `${accentColor}40`;
    ctx.fill();

    // Main circle
    ctx.beginPath();
    ctx.arc(cutoffX, cutoffY, radius, 0, Math.PI * 2);
    ctx.fillStyle = isDragging || isHovering ? '#ffffff' : accentColor;
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw cutoff and resonance values (only in non-compact mode)
    if (!compact) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';

      const cutoffLabel = cutoff >= 1000 ? `${(cutoff / 1000).toFixed(1)}kHz` : `${Math.round(cutoff)}Hz`;
      ctx.fillText(cutoffLabel, cutoffX, cutoffY - 18);

      ctx.textAlign = 'left';
      ctx.fillText(`Q: ${resonance.toFixed(1)}`, width - padding - 50, topPadding + 20);
    }

  }, [filterType, cutoff, resonance, width, height, accentColor, isDragging, isHovering, padding, topPadding, drawWidth, drawHeight, compact]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if near control point
    const cutoffX = freqToX(cutoff, drawWidth, padding);
    const cutoffDb = calculateResponse(filterType, cutoff, resonance, cutoff);
    const cutoffY = dbToY(cutoffDb, drawHeight, topPadding);

    const dist = Math.sqrt((x - cutoffX) ** 2 + (y - cutoffY) ** 2);
    setIsHovering(dist < 20);

    if (isDragging) {
      // Update cutoff from x position
      const newCutoff = xToFreq(x, drawWidth, padding);
      onCutoffChange(Math.max(MIN_FREQ, Math.min(MAX_FREQ, newCutoff)));

      // Update resonance from y position
      const newResonance = yToResonance(y, drawHeight, topPadding);
      onResonanceChange(newResonance);
    }
  }, [isDragging, cutoff, resonance, filterType, padding, topPadding, drawWidth, drawHeight, onCutoffChange, onResonanceChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsHovering(false);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        cursor: isDragging ? 'grabbing' : isHovering ? 'grab' : 'crosshair',
        borderRadius: 8,
        border: `1px solid ${accentColor}40`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export const FilterVisualizer = memo(FilterVisualizerComponent);
