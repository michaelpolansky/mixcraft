/**
 * LFOVisualizer - Animated modulation wave visualization
 * Ableton Learning Synths-style interactive LFO display
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { LFOWaveform } from '../../core/types.ts';

interface LFOVisualizerProps {
  waveform: LFOWaveform;
  rate: number;         // Hz
  depth: number;        // 0-1
  width?: number;
  height?: number;
  accentColor?: string;
  compact?: boolean; // Remove labels and reduce padding for small sizes
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

const LFOVisualizerComponent: React.FC<LFOVisualizerProps> = ({
  waveform,
  rate,
  depth,
  width = 500,
  height = 180,
  accentColor = '#ef4444',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const canvasSizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only update canvas dimensions when they actually change
    const dpr = window.devicePixelRatio || 1;
    if (canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height || canvasSizeRef.current.dpr !== dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvasSizeRef.current = { width, height, dpr };
    }

    const padding = compact ? 8 : 30;
    const topPadding = compact ? 8 : 40;
    const bottomPadding = compact ? 8 : 30;
    const nowIndicatorSpace = compact ? 0 : 50;
    const drawWidth = width - padding * 2 - nowIndicatorSpace;
    const drawHeight = height - topPadding - bottomPadding;

    // Calculate current phase based on time
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const currentPhase = (elapsed * rate) % 1;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw labels only in non-compact mode
    if (!compact) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('LFO', padding, 24);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${waveform.toUpperCase()} • ${rate.toFixed(1)} Hz`, width - padding, 24);
    }

    const centerY = topPadding + drawHeight / 2;
    const maxAmplitude = (drawHeight / 2 - 5) * depth;

    // Draw depth range background
    ctx.fillStyle = `${accentColor}15`;
    ctx.fillRect(padding, centerY - maxAmplitude, drawWidth, maxAmplitude * 2);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Center line
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(padding + drawWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Max/min lines
    ctx.beginPath();
    ctx.moveTo(padding, centerY - maxAmplitude);
    ctx.lineTo(padding + drawWidth, centerY - maxAmplitude);
    ctx.moveTo(padding, centerY + maxAmplitude);
    ctx.lineTo(padding + drawWidth, centerY + maxAmplitude);
    ctx.stroke();

    // Draw waveform (2 full cycles, scrolling)
    const cycles = 2;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i <= drawWidth; i++) {
      // Scroll the wave based on current phase
      const phase = currentPhase + (i / drawWidth) * cycles;
      const value = getWaveformValue(waveform, phase);
      const y = centerY - value * maxAmplitude;

      if (i === 0) {
        ctx.moveTo(padding + i, y);
      } else {
        ctx.lineTo(padding + i, y);
      }
    }

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw "now" indicator only in non-compact mode
    if (!compact) {
      const nowX = padding + drawWidth + 20;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nowX, topPadding);
      ctx.lineTo(nowX, topPadding + drawHeight);
      ctx.stroke();

      // Draw current value marker on the "now" line
      const currentValue = getWaveformValue(waveform, currentPhase);
      const markerY = centerY - currentValue * maxAmplitude;

      // Glow
      ctx.beginPath();
      ctx.arc(nowX, markerY, 12, 0, Math.PI * 2);
      ctx.fillStyle = `${accentColor}40`;
      ctx.fill();

      // Main marker
      ctx.beginPath();
      ctx.arc(nowX, markerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // "NOW" label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NOW', nowX, topPadding - 8);

      // Draw depth percentage
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`DEPTH: ${Math.round(depth * 100)}%`, padding + drawWidth / 2, height - 8);

      // Y-axis labels
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '9px system-ui';
      ctx.fillText('+', padding - 6, centerY - maxAmplitude + 4);
      ctx.fillText('0', padding - 6, centerY + 3);
      ctx.fillText('-', padding - 6, centerY + maxAmplitude + 4);
    }

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [waveform, rate, depth, width, height, accentColor, compact]);

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
      className="rounded-lg"
      style={{
        width,
        height,
        maxWidth: '100%',
        border: `1px solid ${accentColor}40`,
      }}
    />
  );
};

export const LFOVisualizer = React.memo(LFOVisualizerComponent);

// Legacy export for backwards compatibility
export function LFOVisualizerLegacy({
  waveform,
  rate,
  depth,
  width = 450,
  height = 150,
  accentColor = '#4ade80',
}: LFOVisualizerProps) {
  return (
    <LFOVisualizer
      waveform={waveform}
      rate={rate}
      depth={depth}
      width={width}
      height={height}
      accentColor={accentColor}
    />
  );
}
