/**
 * Real-time spectrum analyzer using Canvas 2D
 * Renders frequency data from Web Audio API's AnalyserNode
 *
 * Performance optimizations:
 * - Reuses TypedArray for frequency data (no allocations in animation loop)
 * - Uses solid colors instead of gradients (60x faster)
 * - Minimal shadow usage (only for high values)
 * - Memoized component
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';

interface SpectrumAnalyzerProps {
  width?: number;
  height?: number;
  /** Number of bars to display */
  barCount?: number;
  /** Show frequency labels */
  showLabels?: boolean;
  /** Optional function to get analyser node (for use with different synth engines) */
  getAnalyser?: () => AnalyserNode | null;
}

// Color palette for spectrum bars (low to high frequency)
const BAR_COLORS = [
  '#ef4444', // Red (sub-bass)
  '#f97316', // Orange (bass)
  '#eab308', // Yellow (low-mids)
  '#22c55e', // Green (mids)
  '#14b8a6', // Teal (high-mids)
  '#3b82f6', // Blue (presence)
  '#8b5cf6', // Purple (highs)
  '#ec4899', // Pink (air)
];

// Pre-computed darker versions of bar colors (50% brightness)
const BAR_COLORS_DARK = BAR_COLORS.map(hex => {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * 0.5);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * 0.5);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * 0.5);
  return `rgb(${r}, ${g}, ${b})`;
});

// Frequency labels for reference
const FREQ_LABELS = [
  { freq: 60, label: '60' },
  { freq: 250, label: '250' },
  { freq: 1000, label: '1k' },
  { freq: 4000, label: '4k' },
  { freq: 16000, label: '16k' },
];

const SpectrumAnalyzerComponent: React.FC<SpectrumAnalyzerProps> = ({
  width = 400,
  height = 200,
  barCount = 64,
  showLabels = true,
  getAnalyser,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const defaultEngine = useSynthStore((state) => state.engine);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Get analyser from custom prop or default to synth store engine
    const analyser = getAnalyser ? getAnalyser() : defaultEngine?.getAnalyser();
    if (!canvas || !ctx || !analyser) return;

    // Reuse frequency data array (avoid allocation in animation loop)
    if (!frequencyDataRef.current || frequencyDataRef.current.length !== analyser.frequencyBinCount) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    const frequencyData = frequencyDataRef.current;
    analyser.getByteFrequencyData(frequencyData);
    const binCount = frequencyData.length;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height * i) / 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calculate bar width with gap
    const barWidth = (width / barCount) * 0.8;
    const gap = (width / barCount) * 0.2;

    // Pre-compute log values for bar mapping
    const logMin = Math.log(1);
    const logMax = Math.log(binCount);
    const logRange = logMax - logMin;

    // Map frequency bins to bars (logarithmic distribution)
    for (let i = 0; i < barCount; i++) {
      // Use logarithmic mapping for more natural frequency distribution
      const logStart = logMin + (i / barCount) * logRange;
      const logEnd = logMin + ((i + 1) / barCount) * logRange;

      const binStart = Math.floor(Math.exp(logStart));
      const binEnd = Math.min(Math.floor(Math.exp(logEnd)), binCount - 1);

      // Average the bins in this range
      let sum = 0;
      let count = 0;
      for (let j = binStart; j <= binEnd; j++) {
        sum += frequencyData[j] ?? 0;
        count++;
      }
      const average = count > 0 ? sum / count : 0;

      // Normalize to 0-1 range
      const normalized = average / 255;

      // Calculate bar height
      const barHeight = normalized * height * 0.9;

      // Choose color based on frequency position (pre-computed, no allocation)
      const colorIndex = Math.floor((i / barCount) * BAR_COLORS.length);
      const color = BAR_COLORS[colorIndex] ?? '#4ade80';
      const colorDark = BAR_COLORS_DARK[colorIndex] ?? '#257040';

      // Draw bar
      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight;

      // Draw darker bottom half, brighter top half (simulates gradient without creating one)
      if (barHeight > 2) {
        const midY = y + barHeight / 2;
        // Top half (brighter)
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight / 2);
        // Bottom half (darker)
        ctx.fillStyle = colorDark;
        ctx.fillRect(x, midY, barWidth, barHeight / 2);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      // Add subtle glow effect only for very active bars (skip most of the time)
      if (normalized > 0.6) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, Math.min(barHeight, 4));
        ctx.shadowBlur = 0;
      }
    }

    // Draw frequency labels
    if (showLabels) {
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      const sampleRate = 48000; // Typical sample rate
      const nyquist = sampleRate / 2;
      const logFreqMin = Math.log(20);
      const logFreqMax = Math.log(nyquist);
      const logFreqRange = logFreqMax - logFreqMin;

      for (const { freq, label } of FREQ_LABELS) {
        // Map frequency to x position (logarithmic)
        const logFreq = Math.log(freq);
        const x = ((logFreq - logFreqMin) / logFreqRange) * width;

        if (x > 0 && x < width) {
          ctx.fillText(label, x, height - 4);
        }
      }
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [defaultEngine, getAnalyser, width, height, barCount, showLabels]);

  useEffect(() => {
    // Start animation if we have an analyser source
    const hasAnalyser = getAnalyser ? getAnalyser() !== null : defaultEngine !== null;
    if (hasAnalyser) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [defaultEngine, getAnalyser, draw]);

  return (
    <div
      style={{
        background: '#0a0a0a',
        borderRadius: '8px',
        padding: '8px',
        border: '1px solid #222',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          borderRadius: '4px',
        }}
      />
    </div>
  );
};

export const SpectrumAnalyzer = React.memo(SpectrumAnalyzerComponent);
