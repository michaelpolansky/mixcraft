/**
 * Filter Response Curve
 * Shows the frequency response of a filter with cutoff and resonance
 * Includes frequency band indicators (bass/mid/high)
 */

import { useRef, useEffect } from 'react';

interface FilterResponseProps {
  /** Filter type */
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  /** Cutoff frequency in Hz */
  cutoff: number;
  /** Resonance (Q value) */
  resonance: number;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color for the curve */
  accentColor?: string;
}

// Frequency band boundaries
const BASS_END = 250;
const MID_END = 4000;
const MIN_FREQ = 20;
const MAX_FREQ = 20000;

// dB range
const MIN_DB = -24;
const MAX_DB = 12;

/**
 * Convert frequency to x position (logarithmic scale)
 */
function freqToX(freq: number, width: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const freqLog = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq)));
  return ((freqLog - minLog) / (maxLog - minLog)) * width;
}

/**
 * Convert dB to y position
 */
function dbToY(db: number, height: number): number {
  const normalized = (db - MIN_DB) / (MAX_DB - MIN_DB);
  return height - normalized * height;
}

/**
 * Calculate filter response at a given frequency
 * Simplified biquad filter response approximation
 */
function calculateResponse(
  filterType: 'lowpass' | 'highpass' | 'bandpass',
  cutoff: number,
  resonance: number,
  freq: number
): number {
  // Clamp resonance to reasonable range
  const Q = Math.max(0.5, Math.min(20, resonance));

  // Ratio of frequency to cutoff
  const ratio = freq / cutoff;

  let magnitude: number;

  switch (filterType) {
    case 'lowpass': {
      // 2-pole lowpass response with resonance
      const x = ratio * ratio;
      const denominator = Math.sqrt(
        Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2)
      );
      magnitude = 1 / denominator;
      break;
    }
    case 'highpass': {
      // 2-pole highpass response with resonance
      const x = ratio * ratio;
      const denominator = Math.sqrt(
        Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2)
      );
      magnitude = x / denominator;
      break;
    }
    case 'bandpass': {
      // Bandpass response
      const x = ratio * ratio;
      const denominator = Math.sqrt(
        Math.pow(1 - x, 2) + Math.pow(ratio / Q, 2)
      );
      magnitude = (ratio / Q) / denominator;
      break;
    }
    default:
      magnitude = 1;
  }

  // Convert to dB
  const db = 20 * Math.log10(Math.max(0.001, magnitude));

  // Clamp to display range
  return Math.max(MIN_DB, Math.min(MAX_DB, db));
}

export function FilterResponse({
  filterType,
  cutoff,
  resonance,
  width = 300,
  height = 150,
  accentColor = '#4ade80',
}: FilterResponseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    const labelHeight = 20;
    const graphHeight = height - labelHeight;

    // Draw frequency bands
    const bassEndX = freqToX(BASS_END, width);
    const midEndX = freqToX(MID_END, width);

    // Bass band (blue tint)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(0, 0, bassEndX, graphHeight);

    // Mid band (neutral - already dark)

    // High band (orange tint)
    ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
    ctx.fillRect(midEndX, 0, width - midEndX, graphHeight);

    // Draw band separators
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(bassEndX, 0);
    ctx.lineTo(bassEndX, graphHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(midEndX, 0);
    ctx.lineTo(midEndX, graphHeight);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw 0dB reference line
    const zeroY = dbToY(0, graphHeight);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();

    // Draw cutoff frequency marker
    const cutoffX = freqToX(cutoff, width);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cutoffX, 0);
    ctx.lineTo(cutoffX, graphHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw filter response curve
    ctx.beginPath();

    // Start from bottom left for fill
    const startDb = calculateResponse(filterType, cutoff, resonance, MIN_FREQ);
    ctx.moveTo(0, graphHeight);
    ctx.lineTo(0, dbToY(startDb, graphHeight));

    // Draw the curve with many points for smoothness
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const logFreq = Math.log10(MIN_FREQ) + (i / steps) * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ));
      const freq = Math.pow(10, logFreq);
      const db = calculateResponse(filterType, cutoff, resonance, freq);
      const x = (i / steps) * width;
      const y = dbToY(db, graphHeight);
      ctx.lineTo(x, y);
    }

    // Close path for fill
    ctx.lineTo(width, graphHeight);
    ctx.closePath();

    // Fill with semi-transparent accent color
    ctx.fillStyle = accentColor + '30';
    ctx.fill();

    // Draw the curve stroke
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const logFreq = Math.log10(MIN_FREQ) + (i / steps) * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ));
      const freq = Math.pow(10, logFreq);
      const db = calculateResponse(filterType, cutoff, resonance, freq);
      const x = (i / steps) * width;
      const y = dbToY(db, graphHeight);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw frequency band labels
    ctx.fillStyle = '#666';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';

    const bassCenter = freqToX(Math.sqrt(MIN_FREQ * BASS_END), width);
    const midCenter = freqToX(Math.sqrt(BASS_END * MID_END), width);
    const highCenter = freqToX(Math.sqrt(MID_END * MAX_FREQ), width);

    ctx.fillText('BASS', bassCenter, height - 6);
    ctx.fillText('MID', midCenter, height - 6);
    ctx.fillText('HIGH', highCenter, height - 6);

    // Draw cutoff frequency label
    ctx.fillStyle = '#888';
    ctx.font = '9px monospace';
    const cutoffLabel = cutoff >= 1000 ? `${(cutoff / 1000).toFixed(1)}k` : `${Math.round(cutoff)}`;
    ctx.fillText(cutoffLabel, cutoffX, 12);

  }, [filterType, cutoff, resonance, width, height, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}
