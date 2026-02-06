/**
 * LFO Visualizer
 * Shows the LFO waveform shape, rate, and modulation depth
 * Animated to show the oscillation in real-time
 */

import { useRef, useEffect, useCallback } from 'react';
import type { LFOWaveform } from '../../core/types.ts';

interface LFOVisualizerProps {
  /** LFO waveform type */
  waveform: LFOWaveform;
  /** LFO rate in Hz */
  rate: number;
  /** LFO depth (0-1) */
  depth: number;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color */
  accentColor?: string;
}

/**
 * Generate waveform sample at a given phase (0-1)
 */
function getWaveformValue(waveform: LFOWaveform, phase: number): number {
  const p = phase % 1;
  switch (waveform) {
    case 'sine':
      return Math.sin(p * Math.PI * 2);
    case 'triangle':
      return p < 0.5 ? (p * 4) - 1 : 3 - (p * 4);
    case 'square':
      return p < 0.5 ? 1 : -1;
    case 'sawtooth':
      return (p * 2) - 1;
    default:
      return 0;
  }
}

export function LFOVisualizer({
  waveform,
  rate,
  depth,
  width = 450,
  height = 150,
  accentColor = '#4ade80',
}: LFOVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 16;
    const labelHeight = 24;
    const graphHeight = height - labelHeight - padding;
    const graphWidth = width - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Calculate current phase based on time
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const currentPhase = (elapsed * rate) % 1;

    // Draw the modulation range indicator (background)
    const centerY = padding + graphHeight / 2;
    const maxAmplitude = (graphHeight / 2) * depth;

    // Depth range background
    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.fillRect(padding, centerY - maxAmplitude, graphWidth, maxAmplitude * 2);

    // Center line (no modulation)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(padding + graphWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw max/min lines
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(padding, centerY - maxAmplitude);
    ctx.lineTo(padding + graphWidth, centerY - maxAmplitude);
    ctx.moveTo(padding, centerY + maxAmplitude);
    ctx.lineTo(padding + graphWidth, centerY + maxAmplitude);
    ctx.stroke();

    // Draw waveform (2 full cycles)
    const cycles = 2;
    ctx.beginPath();

    for (let i = 0; i <= graphWidth; i++) {
      const phase = (i / graphWidth) * cycles;
      const value = getWaveformValue(waveform, phase);
      const y = centerY - value * maxAmplitude;

      if (i === 0) {
        ctx.moveTo(padding + i, y);
      } else {
        ctx.lineTo(padding + i, y);
      }
    }

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw current position marker (animated dot)
    const markerPhase = (currentPhase * cycles) % cycles;
    const markerX = padding + (markerPhase / cycles) * graphWidth;
    const markerValue = getWaveformValue(waveform, currentPhase);
    const markerY = centerY - markerValue * maxAmplitude;

    // Glow effect
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = accentColor + '40';
    ctx.fill();

    // Marker dot
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Draw modulation target indicator (right side)
    const targetX = width - 40;
    const targetHeight = graphHeight * 0.6;
    const targetY = centerY - targetHeight / 2;

    // Filter cutoff bar (modulated)
    const modulatedHeight = targetHeight * (0.5 + markerValue * depth * 0.5);
    const modulatedY = centerY + targetHeight / 2 - modulatedHeight;

    ctx.fillStyle = '#333';
    ctx.fillRect(targetX, targetY, 24, targetHeight);

    ctx.fillStyle = accentColor + '80';
    ctx.fillRect(targetX, modulatedY, 24, modulatedHeight);

    // Labels
    ctx.fillStyle = '#888';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';

    // Waveform label
    ctx.fillStyle = accentColor;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(waveform.toUpperCase(), padding + graphWidth / 4, height - 6);

    // Rate label
    ctx.fillStyle = '#888';
    ctx.fillText(`${rate.toFixed(1)} Hz`, padding + graphWidth / 2, height - 6);

    // Depth label
    ctx.fillText(`${Math.round(depth * 100)}% depth`, padding + (graphWidth / 4) * 3, height - 6);

    // Target label
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText('CUTOFF', targetX + 12, targetY - 4);

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText('+', padding - 4, centerY - maxAmplitude + 4);
    ctx.fillText('0', padding - 4, centerY + 3);
    ctx.fillText('-', padding - 4, centerY + maxAmplitude + 4);

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [waveform, rate, depth, width, height, accentColor]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

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
