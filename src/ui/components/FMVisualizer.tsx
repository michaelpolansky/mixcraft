/**
 * FMVisualizer - FM synthesis carrier/modulator visualization
 * Shows how the modulator affects the carrier waveform
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { OscillatorType } from '../../core/types.ts';

interface FMVisualizerProps {
  carrierType: OscillatorType;
  modulatorType: OscillatorType;
  harmonicity: number;
  modulationIndex: number;
  width?: number;
  height?: number;
  accentColor?: string;
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

const FMVisualizerComponent: React.FC<FMVisualizerProps> = ({
  carrierType,
  modulatorType,
  harmonicity,
  modulationIndex,
  width = 600,
  height = 200,
  accentColor = '#f97316',
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

    // Update phase
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;
    phaseRef.current += deltaTime * 0.5;

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
      ctx.fillText('FM SYNTHESIS', padding, 24);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`H:${harmonicity.toFixed(1)} • MI:${modulationIndex.toFixed(1)}`, width - padding, 24);
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(padding + drawWidth, centerY);
    ctx.stroke();

    const waveAmplitude = (drawHeight / 2 - 10);
    const cycles = 3;

    // Draw modulator wave (subtle, in background)
    ctx.beginPath();
    for (let i = 0; i <= drawWidth; i++) {
      const phase = phaseRef.current + (i / drawWidth) * cycles * harmonicity;
      const value = getWaveformValue(modulatorType, phase);
      const y = centerY - value * waveAmplitude * 0.3;

      if (i === 0) {
        ctx.moveTo(padding + i, y);
      } else {
        ctx.lineTo(padding + i, y);
      }
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw FM modulated carrier wave
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();

    for (let i = 0; i <= drawWidth; i++) {
      const basePhase = phaseRef.current + (i / drawWidth) * cycles;

      // Modulator phase (frequency ratio = harmonicity)
      const modPhase = basePhase * harmonicity;
      const modValue = getWaveformValue(modulatorType, modPhase);

      // FM: carrier phase is modulated by modulator
      const carrierPhase = basePhase + modValue * modulationIndex * 0.5;
      const carrierValue = getWaveformValue(carrierType, carrierPhase);

      const y = centerY - carrierValue * waveAmplitude;

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

    // Draw waveform type labels only in non-compact mode
    if (!compact) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Carrier: ${carrierType.toUpperCase()} • Modulator: ${modulatorType.toUpperCase()}`, padding + drawWidth / 2, height - 8);
    }

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [carrierType, modulatorType, harmonicity, modulationIndex, width, height, accentColor, compact]);

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

export const FMVisualizer = React.memo(FMVisualizerComponent);
