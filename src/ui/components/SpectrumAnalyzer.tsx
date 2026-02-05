/**
 * Real-time spectrum analyzer using Canvas 2D
 * Renders frequency data from Web Audio API's AnalyserNode
 */

import { useRef, useEffect, useCallback } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';

interface SpectrumAnalyzerProps {
  width?: number;
  height?: number;
  /** Number of bars to display */
  barCount?: number;
  /** Show frequency labels */
  showLabels?: boolean;
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

// Frequency labels for reference
const FREQ_LABELS = [
  { freq: 60, label: '60' },
  { freq: 250, label: '250' },
  { freq: 1000, label: '1k' },
  { freq: 4000, label: '4k' },
  { freq: 16000, label: '16k' },
];

export function SpectrumAnalyzer({
  width = 400,
  height = 200,
  barCount = 64,
  showLabels = true,
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const engine = useSynthStore((state) => state.engine);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !engine) return;

    // Get frequency data
    const frequencyData = engine.getFrequencyData();
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

    // Map frequency bins to bars (logarithmic distribution)
    for (let i = 0; i < barCount; i++) {
      // Use logarithmic mapping for more natural frequency distribution
      const logMin = Math.log(1);
      const logMax = Math.log(binCount);
      const logStart = logMin + (i / barCount) * (logMax - logMin);
      const logEnd = logMin + ((i + 1) / barCount) * (logMax - logMin);

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

      // Choose color based on frequency position
      const colorIndex = Math.floor((i / barCount) * BAR_COLORS.length);
      const color = BAR_COLORS[colorIndex] ?? '#4ade80';

      // Draw bar
      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight;

      // Gradient fill
      const gradient = ctx.createLinearGradient(x, height, x, y);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustBrightness(color, 0.5));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add glow effect for active bars
      if (normalized > 0.3) {
        ctx.shadowColor = color;
        ctx.shadowBlur = normalized * 10;
        ctx.fillRect(x, y, barWidth, barHeight);
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

      for (const { freq, label } of FREQ_LABELS) {
        // Map frequency to x position (logarithmic)
        const logFreq = Math.log(freq);
        const logMin = Math.log(20);
        const logMax = Math.log(nyquist);
        const x = ((logFreq - logMin) / (logMax - logMin)) * width;

        if (x > 0 && x < width) {
          ctx.fillText(label, x, height - 4);
        }
      }
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [engine, width, height, barCount, showLabels]);

  useEffect(() => {
    if (engine) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [engine, draw]);

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
