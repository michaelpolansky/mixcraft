/**
 * WaveformIcon Component
 * Small animated Canvas 2D waveform icons for module headers
 * Supports: sine, square, saw, triangle, noise, envelope, filter
 */

import { useEffect, useRef } from 'react';

export type WaveformIconType =
  | 'sine'
  | 'square'
  | 'saw'
  | 'sawtooth' // Alias for saw, compatible with OscillatorType
  | 'triangle'
  | 'noise'
  | 'envelope'
  | 'filter'
  | 'speaker'
  | 'harmonics';

interface WaveformIconProps {
  type: WaveformIconType;
  size?: number;
  color?: string;
  animated?: boolean;
}

export function WaveformIcon({
  type,
  size = 24,
  color = '#888',
  animated = true,
}: WaveformIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const padding = 4;
      const width = size - padding * 2;
      const height = size - padding * 2;
      const centerY = size / 2;

      // Animate phase for continuous motion
      if (animated) {
        phaseRef.current += 0.05;
      }
      const phase = phaseRef.current;

      ctx.beginPath();

      switch (type) {
        case 'sine':
          drawSine(ctx, padding, centerY, width, height / 2, phase);
          break;
        case 'square':
          drawSquare(ctx, padding, centerY, width, height / 2, phase);
          break;
        case 'saw':
        case 'sawtooth':
          drawSaw(ctx, padding, centerY, width, height / 2, phase);
          break;
        case 'triangle':
          drawTriangle(ctx, padding, centerY, width, height / 2, phase);
          break;
        case 'noise':
          drawNoise(ctx, padding, centerY, width, height / 2);
          break;
        case 'envelope':
          drawEnvelope(ctx, padding, padding, width, height);
          break;
        case 'filter':
          drawFilter(ctx, padding, padding, width, height);
          break;
        case 'speaker':
          drawSpeaker(ctx, padding, padding, width, height);
          break;
        case 'harmonics':
          drawHarmonics(ctx, padding, padding, width, height, phase);
          break;
      }

      ctx.stroke();

      if (animated && (type === 'sine' || type === 'square' || type === 'saw' || type === 'sawtooth' || type === 'triangle' || type === 'harmonics')) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, size, color, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        display: 'block',
      }}
    />
  );
}

// Drawing functions
function drawSine(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  amplitude: number,
  phase: number
) {
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const px = x + (i / steps) * width;
    const py = centerY - Math.sin((i / steps) * Math.PI * 2 + phase) * amplitude;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
}

function drawSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  amplitude: number,
  phase: number
) {
  const offset = ((phase % (Math.PI * 2)) / (Math.PI * 2)) * width;
  const halfWidth = width / 2;

  // Draw one full cycle with phase offset
  const start = -offset;
  const segments: Array<{ x: number; y: number }> = [];

  // Create points for square wave
  for (let i = 0; i <= 2; i++) {
    const cycleX = start + i * halfWidth;
    const high = i % 2 === 0;
    segments.push({ x: cycleX, y: centerY - (high ? amplitude : -amplitude) });
    segments.push({ x: cycleX + halfWidth * 0.45, y: centerY - (high ? amplitude : -amplitude) });
    segments.push({ x: cycleX + halfWidth * 0.45, y: centerY - (high ? -amplitude : amplitude) });
  }

  // Draw only visible parts
  let started = false;
  for (const seg of segments) {
    const clampedX = Math.max(x, Math.min(x + width, seg.x + offset));
    if (seg.x + offset >= x && seg.x + offset <= x + width) {
      if (!started) {
        ctx.moveTo(clampedX, seg.y);
        started = true;
      } else {
        ctx.lineTo(clampedX, seg.y);
      }
    }
  }
}

function drawSaw(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  amplitude: number,
  phase: number
) {
  const cycles = 1.5;
  const cycleWidth = width / cycles;
  const offset = ((phase % (Math.PI * 2)) / (Math.PI * 2)) * cycleWidth;

  for (let c = -1; c <= cycles + 1; c++) {
    const startX = x + c * cycleWidth - offset;
    const endX = startX + cycleWidth;

    // Only draw if visible
    if (endX < x || startX > x + width) continue;

    // Sawtooth: ramp up then reset
    const clampedStartX = Math.max(x, startX);
    const clampedEndX = Math.min(x + width, endX);

    const startProgress = (clampedStartX - startX) / cycleWidth;
    const endProgress = (clampedEndX - startX) / cycleWidth;

    const startY = centerY - (startProgress * 2 - 1) * amplitude;
    const endY = centerY - (endProgress * 2 - 1) * amplitude;

    ctx.moveTo(clampedStartX, startY);
    ctx.lineTo(clampedEndX, endY);

    // Vertical reset line
    if (endX <= x + width && endX >= x) {
      ctx.moveTo(endX, centerY - amplitude);
      ctx.lineTo(endX, centerY + amplitude);
    }
  }
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  amplitude: number,
  phase: number
) {
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 + phase;
    const normalized = ((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let y: number;
    if (normalized < Math.PI) {
      y = (normalized / Math.PI) * 2 - 1;
    } else {
      y = 1 - ((normalized - Math.PI) / Math.PI) * 2;
    }
    const px = x + (i / steps) * width;
    const py = centerY - y * amplitude;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  amplitude: number
) {
  // Random noise pattern (regenerates each frame for animated effect)
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const px = x + (i / steps) * width;
    const py = centerY + (Math.random() * 2 - 1) * amplitude;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
}

function drawEnvelope(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // ADSR envelope shape
  const attackEnd = x + width * 0.15;
  const decayEnd = x + width * 0.35;
  const sustainEnd = x + width * 0.7;
  const releaseEnd = x + width;
  const sustainLevel = y + height * 0.4;

  ctx.moveTo(x, y + height);
  ctx.lineTo(attackEnd, y); // Attack
  ctx.lineTo(decayEnd, sustainLevel); // Decay
  ctx.lineTo(sustainEnd, sustainLevel); // Sustain
  ctx.lineTo(releaseEnd, y + height); // Release
}

function drawFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // Low-pass filter response curve
  const cutoffX = x + width * 0.5;
  const flatY = y + height * 0.2;

  ctx.moveTo(x, flatY);
  ctx.lineTo(cutoffX - width * 0.1, flatY);

  // Resonance peak
  ctx.quadraticCurveTo(
    cutoffX,
    y,
    cutoffX + width * 0.1,
    flatY + height * 0.1
  );

  // Roll-off
  ctx.quadraticCurveTo(
    cutoffX + width * 0.3,
    y + height * 0.6,
    x + width,
    y + height
  );
}

function drawSpeaker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Speaker cone (trapezoid shape)
  const coneLeft = x + width * 0.15;
  const coneRight = x + width * 0.55;
  const coneTopSmall = centerY - height * 0.15;
  const coneBottomSmall = centerY + height * 0.15;
  const coneTopLarge = y + height * 0.1;
  const coneBottomLarge = y + height * 0.9;

  ctx.moveTo(coneLeft, coneTopSmall);
  ctx.lineTo(coneRight, coneTopLarge);
  ctx.lineTo(coneRight, coneBottomLarge);
  ctx.lineTo(coneLeft, coneBottomSmall);
  ctx.closePath();
  ctx.stroke();

  // Sound waves
  ctx.beginPath();
  const waveX1 = x + width * 0.7;
  const waveX2 = x + width * 0.85;

  // First wave
  ctx.arc(centerX, centerY, width * 0.25, -Math.PI * 0.3, Math.PI * 0.3, false);
  ctx.stroke();

  // Second wave
  ctx.beginPath();
  ctx.arc(centerX, centerY, width * 0.38, -Math.PI * 0.3, Math.PI * 0.3, false);
}

function drawHarmonics(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  phase: number
) {
  // Vertical bars representing harmonics
  const barCount = 8;
  const barWidth = width / (barCount * 2);
  const gap = barWidth;

  for (let i = 0; i < barCount; i++) {
    const barX = x + i * (barWidth + gap);
    // Animate bar heights with different phases
    const animatedHeight = (0.3 + 0.7 * Math.abs(Math.sin(phase + i * 0.5))) * height * (1 - i * 0.08);
    const barY = y + height - animatedHeight;

    ctx.moveTo(barX, y + height);
    ctx.lineTo(barX, barY);
    ctx.lineTo(barX + barWidth, barY);
    ctx.lineTo(barX + barWidth, y + height);
  }
}
