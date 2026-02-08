/**
 * NoiseVisualizer - Shows animated noise waveform pattern
 * Different noise types have characteristic visual appearances:
 * - White: Random spikes, equal energy at all frequencies
 * - Pink: Smoother, more low-frequency emphasis (1/f)
 * - Brown: Even smoother, Brownian motion-like (1/f²)
 */

import { memo, useRef, useEffect } from 'react';

interface NoiseVisualizerProps {
  noiseType: 'white' | 'pink' | 'brown';
  level: number;
  width?: number;
  height?: number;
  accentColor?: string;
  compact?: boolean;
}

function NoiseVisualizerComponent({
  noiseType,
  level,
  width = 200,
  height = 100,
  accentColor = '#a855f7',
  compact = false,
}: NoiseVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const brownValueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = compact ? 8 : 12;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;
    const centerY = height / 2;

    // Generate noise samples based on type
    const generateNoiseSample = (): number => {
      switch (noiseType) {
        case 'white':
          // Pure random
          return (Math.random() * 2 - 1) * level;
        case 'pink': {
          // Approximate pink noise with filtered white noise
          // Uses simple 1-pole lowpass with some randomness
          const white = Math.random() * 2 - 1;
          return white * 0.7 * level + (Math.random() * 2 - 1) * 0.3 * level;
        }
        case 'brown': {
          // Brownian motion - integrate white noise
          const delta = (Math.random() * 2 - 1) * 0.1;
          brownValueRef.current += delta;
          // Clamp and decay slightly toward center
          brownValueRef.current = brownValueRef.current * 0.99;
          brownValueRef.current = Math.max(-1, Math.min(1, brownValueRef.current));
          return brownValueRef.current * level;
        }
        default:
          return 0;
      }
    };

    let frameCount = 0;
    const noiseBuffer: number[] = [];
    const bufferSize = Math.floor(drawWidth / 2);

    // Initialize buffer
    for (let i = 0; i < bufferSize; i++) {
      noiseBuffer.push(generateNoiseSample());
    }

    const draw = () => {
      // Clear
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Update buffer every few frames for animation
      if (frameCount % 2 === 0) {
        noiseBuffer.shift();
        noiseBuffer.push(generateNoiseSample());
      }

      // Draw center line
      ctx.strokeStyle = `${accentColor}20`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, centerY);
      ctx.lineTo(width - padding, centerY);
      ctx.stroke();

      // Draw noise waveform
      ctx.beginPath();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;

      for (let i = 0; i < noiseBuffer.length; i++) {
        const x = padding + (i / (noiseBuffer.length - 1)) * drawWidth;
        const sample = noiseBuffer[i] ?? 0;
        const y = centerY - sample * (drawHeight / 2) * 0.8;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw noise type label in compact mode
      if (!compact) {
        ctx.fillStyle = `${accentColor}80`;
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(noiseType.toUpperCase(), padding, padding + 10);
      }

      frameCount++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [noiseType, level, width, height, accentColor, compact]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        borderRadius: 6,
        border: `1px solid ${accentColor}30`,
      }}
    />
  );
}

export const NoiseVisualizer = memo(NoiseVisualizerComponent);
