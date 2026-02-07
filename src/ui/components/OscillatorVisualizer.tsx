/**
 * OscillatorVisualizer - Animated waveform visualization
 * Ableton Learning Synths-style scrolling waveform display
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { OscillatorType } from '../../core/types.ts';

interface OscillatorVisualizerProps {
  waveform: OscillatorType;
  octave: number;
  detune: number;
  width?: number;
  height?: number;
  accentColor?: string;
  isPlaying?: boolean;
  amplitude?: number; // 0-1 for envelope modulation
  compact?: boolean; // Remove labels and reduce padding for small sizes
}

/**
 * Generate waveform sample at a given phase (0-1)
 */
function getWaveformValue(waveform: OscillatorType, phase: number): number {
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

const OscillatorVisualizerComponent: React.FC<OscillatorVisualizerProps> = ({
  waveform,
  octave,
  detune,
  width = 500,
  height = 200,
  accentColor = '#3b82f6',
  isPlaying = false,
  amplitude = 1,
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
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

    // Update phase based on octave (higher octave = faster scrolling)
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    // Base frequency relates to octave (higher octave = faster animation)
    const baseSpeed = 0.5 * Math.pow(2, (octave - 4) / 2);
    phaseRef.current += deltaTime * baseSpeed;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const padding = compact ? 8 : 30;
    const topPadding = compact ? 8 : 40;
    const bottomPadding = compact ? 8 : 30;
    const drawWidth = width - padding * 2;
    const drawHeight = height - topPadding - bottomPadding;
    const centerY = topPadding + drawHeight / 2;

    // Draw labels only in non-compact mode
    if (!compact) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('OSCILLATOR', padding, 24);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(waveform.toUpperCase(), width - padding, 24);
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Center line (0 amplitude)
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(padding + drawWidth, centerY);
    ctx.stroke();

    // Top and bottom lines
    ctx.beginPath();
    ctx.moveTo(padding, topPadding);
    ctx.lineTo(padding + drawWidth, topPadding);
    ctx.moveTo(padding, topPadding + drawHeight);
    ctx.lineTo(padding + drawWidth, topPadding + drawHeight);
    ctx.stroke();

    // Draw waveform (3-4 cycles scrolling)
    const cycles = 3.5;
    const currentAmplitude = isPlaying ? amplitude : 0.7;
    const waveAmplitude = (drawHeight / 2 - 10) * currentAmplitude;

    // Draw glow effect
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    for (let i = 0; i <= drawWidth; i++) {
      const phase = phaseRef.current + (i / drawWidth) * cycles;
      const value = getWaveformValue(waveform, phase);
      const y = centerY - value * waveAmplitude;

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

    // Draw second harmonic trace (subtle) if detune is non-zero
    if (Math.abs(detune) > 1) {
      ctx.beginPath();
      const detunePhase = phaseRef.current * (1 + detune / 1000);
      for (let i = 0; i <= drawWidth; i++) {
        const phase = detunePhase + (i / drawWidth) * cycles;
        const value = getWaveformValue(waveform, phase);
        const y = centerY - value * waveAmplitude * 0.5;

        if (i === 0) {
          ctx.moveTo(padding + i, y);
        } else {
          ctx.lineTo(padding + i, y);
        }
      }

      ctx.strokeStyle = `${accentColor}40`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw octave and detune labels at bottom (only in non-compact mode)
    if (!compact) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`OCT ${octave}`, padding + drawWidth * 0.25, height - 10);
      ctx.fillText(`DETUNE ${detune > 0 ? '+' : ''}${detune}¢`, padding + drawWidth * 0.75, height - 10);

      // Amplitude indicator (right side bar)
      const barWidth = 8;
      const barX = width - padding + 10;
      const barHeight = drawHeight * 0.8;
      const barY = topPadding + (drawHeight - barHeight) / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = `${accentColor}80`;
      const filledHeight = barHeight * currentAmplitude;
      ctx.fillRect(barX, barY + barHeight - filledHeight, barWidth, filledHeight);
    }

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [waveform, octave, detune, width, height, accentColor, isPlaying, amplitude, compact]);

  useEffect(() => {
    lastTimeRef.current = Date.now();
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
      style={{
        width,
        height,
        maxWidth: '100%',
        borderRadius: 8,
        border: `1px solid ${accentColor}40`,
      }}
    />
  );
};

export const OscillatorVisualizer = React.memo(OscillatorVisualizerComponent);
