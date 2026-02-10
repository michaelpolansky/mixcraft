/**
 * EffectCard - Individual effect visualization card
 * Ableton Learning Synths-style effect display
 */

import React, { useRef, useEffect, useCallback } from 'react';

// Effect types
type EffectType = 'distortion' | 'delay' | 'reverb' | 'chorus';

interface EffectCardProps {
  type: EffectType;
  mix: number;          // 0-1
  param1: number;       // Main parameter (amount, time, decay, rate)
  param2?: number;      // Secondary parameter (feedback, depth)
  width?: number;
  height?: number;
  accentColor?: string;
}

const EFFECT_COLORS: Record<EffectType, string> = {
  distortion: '#ef4444',
  delay: '#3b82f6',
  reverb: '#8b5cf6',
  chorus: '#06b6d4',
};

const EFFECT_LABELS: Record<EffectType, { name: string; param1: string; param2?: string }> = {
  distortion: { name: 'DISTORTION', param1: 'Drive' },
  delay: { name: 'DELAY', param1: 'Time', param2: 'Feedback' },
  reverb: { name: 'REVERB', param1: 'Decay' },
  chorus: { name: 'CHORUS', param1: 'Rate', param2: 'Depth' },
};

export const EffectCard: React.FC<EffectCardProps> = ({
  type,
  mix,
  param1,
  param2 = 0.5,
  width = 200,
  height = 150,
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  const color = accentColor || EFFECT_COLORS[type];
  const labels = EFFECT_LABELS[type];
  const isActive = mix > 0.01;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Update animation phase
    phaseRef.current += 0.03;

    const padding = 12;
    const headerHeight = 24;
    const mixBarHeight = 6;
    const vizHeight = height - headerHeight - mixBarHeight - padding * 3;
    const vizWidth = width - padding * 2;
    const vizY = headerHeight + padding + mixBarHeight + 8;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = isActive ? `${color}60` : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Draw header
    ctx.fillStyle = isActive ? color : 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(labels.name, padding, padding + 12);

    // Draw mix bar
    const mixBarY = headerHeight + padding;
    const mixBarWidth = vizWidth;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(padding, mixBarY, mixBarWidth, mixBarHeight);

    ctx.fillStyle = isActive ? color : 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(padding, mixBarY, mixBarWidth * mix, mixBarHeight);

    // Draw visualization based on type
    const vizX = padding;

    switch (type) {
      case 'distortion':
        drawDistortion(ctx, vizX, vizY, vizWidth, vizHeight, param1, isActive, color, phaseRef.current);
        break;
      case 'delay':
        drawDelay(ctx, vizX, vizY, vizWidth, vizHeight, param1, param2, isActive, color, phaseRef.current);
        break;
      case 'reverb':
        drawReverb(ctx, vizX, vizY, vizWidth, vizHeight, param1, isActive, color, phaseRef.current);
        break;
      case 'chorus':
        drawChorus(ctx, vizX, vizY, vizWidth, vizHeight, param1, param2, isActive, color, phaseRef.current);
        break;
    }

    // Draw param labels at bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';

    const paramText = formatParam(type, param1, param2);
    ctx.fillText(paramText, width / 2, height - 6);

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [type, mix, param1, param2, width, height, color, isActive, labels]);

  useEffect(() => {
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
      }}
    />
  );
};

function formatParam(type: EffectType, param1: number, param2?: number): string {
  switch (type) {
    case 'distortion':
      return `Drive: ${Math.round(param1 * 100)}%`;
    case 'delay':
      return `${Math.round(param1 * 1000)}ms • ${Math.round((param2 || 0) * 100)}%`;
    case 'reverb':
      return `Decay: ${param1.toFixed(1)}s`;
    case 'chorus':
      return `${param1.toFixed(1)}Hz • ${Math.round((param2 || 0) * 100)}%`;
    default:
      return '';
  }
}

function drawDistortion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  amount: number,
  isActive: boolean,
  color: string,
  _phase: number
) {
  // Draw waveshaping transfer curve
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, centerY);
  ctx.lineTo(x + w, centerY);
  ctx.moveTo(centerX, y);
  ctx.lineTo(centerX, y + h);
  ctx.stroke();

  // Transfer curve
  ctx.beginPath();
  const k = amount * 10 + 1;

  for (let i = 0; i <= w; i++) {
    const input = (i / w) * 2 - 1; // -1 to 1
    const output = Math.tanh(input * k) / Math.tanh(k);
    const px = x + i;
    const py = centerY - output * (h / 2 - 4);

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.strokeStyle = isActive ? color : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDelay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  feedback: number,
  isActive: boolean,
  color: string,
  phase: number
) {
  const baseY = y + h - 4;
  const numTaps = 5;
  const spacing = w / numTaps;

  // Animated pulse
  const pulsePhase = (phase * 0.5) % 1;

  for (let i = 0; i < numTaps; i++) {
    const tapX = x + spacing * 0.5 + i * spacing;
    const amplitude = Math.pow(feedback, i);
    const barHeight = (h - 8) * amplitude;

    // Check if this tap is "active" in the animation
    const tapPhase = i / numTaps;
    const isPulseActive = Math.abs(pulsePhase - tapPhase) < 0.15;

    const alpha = isActive ? (isPulseActive ? 1 : 0.6) : 0.3;

    ctx.fillStyle = isActive ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(tapX - 6, baseY - barHeight, 12, barHeight);

    // Echo lines connecting taps
    if (i > 0 && isActive) {
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(tapX - spacing, baseY - (h - 8) * Math.pow(feedback, i - 1));
      ctx.lineTo(tapX, baseY - barHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function drawReverb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  decay: number,
  isActive: boolean,
  color: string,
  phase: number
) {
  // Decay envelope with diffusion
  ctx.beginPath();
  ctx.moveTo(x, y + 4);

  for (let i = 0; i <= w; i++) {
    const t = i / w;
    const amplitude = Math.exp(-t * 3 / decay);
    // Add subtle "shimmer" noise
    const noise = Math.sin(phase * 2 + i * 0.5) * 0.08 * amplitude;
    const py = y + 4 + (1 - amplitude + noise) * (h - 8);
    ctx.lineTo(x + i, py);
  }

  ctx.lineTo(x + w, y + h - 4);
  ctx.lineTo(x, y + h - 4);
  ctx.closePath();

  ctx.fillStyle = isActive ? `${color}30` : 'rgba(255, 255, 255, 0.1)';
  ctx.fill();

  // Envelope line
  ctx.beginPath();
  ctx.moveTo(x, y + 4);

  for (let i = 0; i <= w; i++) {
    const t = i / w;
    const amplitude = Math.exp(-t * 3 / decay);
    const py = y + 4 + (1 - amplitude) * (h - 8);
    ctx.lineTo(x + i, py);
  }

  ctx.strokeStyle = isActive ? color : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawChorus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rate: number,
  depth: number,
  isActive: boolean,
  color: string,
  phase: number
) {
  const centerY = y + h / 2;

  // Original signal (center line, dashed)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x, centerY);
  ctx.lineTo(x + w, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Modulated voices
  for (let voice = 0; voice < 2; voice++) {
    const voicePhase = phase * rate + voice * Math.PI;
    const offset = voice === 0 ? -1 : 1;

    ctx.beginPath();
    for (let i = 0; i <= w; i++) {
      const t = i / w;
      const mod = Math.sin(voicePhase + t * Math.PI * 4) * depth * 12;
      const py = centerY + mod + offset * 8;

      if (i === 0) {
        ctx.moveTo(x + i, py);
      } else {
        ctx.lineTo(x + i, py);
      }
    }

    const alpha = isActive ? (voice === 0 ? 1 : 0.6) : 0.3;
    ctx.strokeStyle = isActive ? `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
