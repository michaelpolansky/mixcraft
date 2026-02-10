/**
 * Effects Visualizer
 * Shows the signal chain with active effects and their parameters
 * Visualizes effect characteristics (delay taps, reverb decay, etc.)
 */

import { useRef, useEffect, useCallback } from 'react';
import type { EffectsParams } from '../../core/types.ts';

interface EffectsVisualizerProps {
  /** Effects parameters */
  effects: EffectsParams;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color */
  accentColor?: string;
}

export function EffectsVisualizer({
  effects,
  width = 450,
  height = 150,
  accentColor = '#4ade80',
}: EffectsVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update phase for animations
    phaseRef.current += 0.02;

    const padding = 16;
    const effectWidth = (width - padding * 2) / 4;
    const effectHeight = height - padding * 2 - 20;

    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Draw each effect section
    const effectsData = [
      {
        name: 'DISTORTION',
        active: effects.distortion.mix > 0.01,
        mix: effects.distortion.mix,
        param: effects.distortion.amount,
        paramLabel: 'drive',
        color: '#ef4444', // red
        drawViz: (x: number, y: number, w: number, h: number) => {
          // Draw waveshaping curve
          const amount = effects.distortion.amount;
          ctx.beginPath();
          for (let i = 0; i <= w; i++) {
            const input = (i / w) * 2 - 1; // -1 to 1
            // Soft clipping approximation
            const k = amount * 10 + 1;
            const output = Math.tanh(input * k) / Math.tanh(k);
            const px = x + i;
            const py = y + h / 2 - output * (h / 2 - 4);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = effects.distortion.mix > 0.01 ? '#ef4444' : '#444';
          ctx.lineWidth = 2;
          ctx.stroke();
        },
      },
      {
        name: 'DELAY',
        active: effects.delay.mix > 0.01,
        mix: effects.delay.mix,
        param: effects.delay.time,
        paramLabel: `${Math.round(effects.delay.time * 1000)}ms`,
        color: '#3b82f6', // blue
        drawViz: (x: number, y: number, w: number, h: number) => {
          // Draw delay taps
          const time = effects.delay.time;
          const feedback = effects.delay.feedback;
          const active = effects.delay.mix > 0.01;

          // Original signal
          ctx.fillStyle = active ? '#3b82f6' : '#444';
          ctx.fillRect(x + 4, y + h - 20, 8, 20);

          // Delay taps (echoes)
          for (let i = 1; i <= 4; i++) {
            const tapX = x + 4 + (i * (w - 16) / 4);
            const tapHeight = 20 * Math.pow(feedback, i);
            const alpha = active ? 1 - i * 0.2 : 0.3;
            ctx.fillStyle = active ? `rgba(59, 130, 246, ${alpha})` : '#333';
            ctx.fillRect(tapX, y + h - tapHeight, 6, tapHeight);
          }

          // Time arrow
          ctx.strokeStyle = '#444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + h + 4);
          ctx.lineTo(x + w - 4, y + h + 4);
          ctx.stroke();
        },
      },
      {
        name: 'REVERB',
        active: effects.reverb.mix > 0.01,
        mix: effects.reverb.mix,
        param: effects.reverb.decay,
        paramLabel: `${effects.reverb.decay.toFixed(1)}s`,
        color: '#8b5cf6', // purple
        drawViz: (x: number, y: number, w: number, h: number) => {
          // Draw decay envelope
          const decay = effects.reverb.decay;
          const active = effects.reverb.mix > 0.01;

          ctx.beginPath();
          ctx.moveTo(x + 4, y + 4);

          for (let i = 0; i <= w - 8; i++) {
            const t = i / (w - 8);
            // Exponential decay curve
            const amplitude = Math.exp(-t * 3 / decay);
            // Add some "diffusion" noise
            const noise = Math.sin(phaseRef.current + i * 0.3) * 0.1 * amplitude;
            const py = y + 4 + (1 - amplitude + noise) * (h - 8);
            ctx.lineTo(x + 4 + i, py);
          }

          ctx.lineTo(x + w - 4, y + h - 4);
          ctx.lineTo(x + 4, y + h - 4);
          ctx.closePath();

          ctx.fillStyle = active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(68, 68, 68, 0.3)';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x + 4, y + 4);
          for (let i = 0; i <= w - 8; i++) {
            const t = i / (w - 8);
            const amplitude = Math.exp(-t * 3 / decay);
            const py = y + 4 + (1 - amplitude) * (h - 8);
            ctx.lineTo(x + 4 + i, py);
          }
          ctx.strokeStyle = active ? '#8b5cf6' : '#444';
          ctx.lineWidth = 2;
          ctx.stroke();
        },
      },
      {
        name: 'CHORUS',
        active: effects.chorus.mix > 0.01,
        mix: effects.chorus.mix,
        param: effects.chorus.rate,
        paramLabel: `${effects.chorus.rate.toFixed(1)}Hz`,
        color: '#06b6d4', // cyan
        drawViz: (x: number, y: number, w: number, h: number) => {
          // Draw modulated copies
          const rate = effects.chorus.rate;
          const depth = effects.chorus.depth;
          const active = effects.chorus.mix > 0.01;
          const centerY = y + h / 2;

          // Original signal (straight line)
          ctx.strokeStyle = '#444';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x + 4, centerY);
          ctx.lineTo(x + w - 4, centerY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Modulated voices
          for (let voice = 0; voice < 2; voice++) {
            const voicePhase = phaseRef.current * rate + voice * Math.PI;
            ctx.beginPath();
            for (let i = 0; i <= w - 8; i++) {
              const t = i / (w - 8);
              const mod = Math.sin(voicePhase + t * Math.PI * 4) * depth * 15;
              const py = centerY + mod + (voice === 0 ? -8 : 8);
              if (i === 0) ctx.moveTo(x + 4 + i, py);
              else ctx.lineTo(x + 4 + i, py);
            }
            ctx.strokeStyle = active ? `rgba(6, 182, 212, ${0.8 - voice * 0.3})` : '#444';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        },
      },
    ];

    // Draw effect blocks
    effectsData.forEach((effect, index) => {
      const x = padding + index * effectWidth;
      const y = padding;

      // Background
      ctx.fillStyle = effect.active ? 'rgba(255, 255, 255, 0.03)' : '#1a1a1a';
      ctx.strokeStyle = effect.active ? effect.color + '60' : '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 2, y, effectWidth - 4, effectHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Effect name
      ctx.fillStyle = effect.active ? effect.color : '#555';
      ctx.font = '9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(effect.name, x + effectWidth / 2, y + 14);

      // Mix indicator
      const mixBarWidth = effectWidth - 16;
      const mixBarHeight = 4;
      const mixBarY = y + 20;

      ctx.fillStyle = '#333';
      ctx.fillRect(x + 8, mixBarY, mixBarWidth, mixBarHeight);

      ctx.fillStyle = effect.active ? effect.color : '#444';
      ctx.fillRect(x + 8, mixBarY, mixBarWidth * effect.mix, mixBarHeight);

      // Visualization area
      const vizY = y + 30;
      const vizHeight = effectHeight - 50;
      effect.drawViz(x + 4, vizY, effectWidth - 8, vizHeight);

      // Parameter label
      ctx.fillStyle = effect.active ? '#888' : '#555';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(effect.paramLabel, x + effectWidth / 2, y + effectHeight - 6);
    });

    // Signal flow arrows
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const arrowX = padding + (i + 1) * effectWidth;
      const arrowY = padding + effectHeight / 2;
      ctx.beginPath();
      ctx.moveTo(arrowX - 4, arrowY);
      ctx.lineTo(arrowX + 4, arrowY);
      ctx.moveTo(arrowX + 2, arrowY - 3);
      ctx.lineTo(arrowX + 4, arrowY);
      ctx.lineTo(arrowX + 2, arrowY + 3);
      ctx.stroke();
    }

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [effects, width, height, accentColor]);

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
      width={width}
      height={height}
      className="rounded-lg block"
    />
  );
}
