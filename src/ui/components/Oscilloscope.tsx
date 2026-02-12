/**
 * Oscilloscope
 * Real-time waveform display showing the shape of the audio signal
 * Filled waveform style like modern DAWs
 */

import { useRef, useEffect, useCallback, memo } from 'react';

interface OscilloscopeProps {
  /** Function to get the AnalyserNode for waveform data */
  getAnalyser?: () => AnalyserNode | null;
  /** Direct analyser reference (alternative to getAnalyser) */
  analyser?: AnalyserNode | null;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Accent color for the waveform fill */
  accentColor?: string;
}

export const Oscilloscope = memo(function Oscilloscope({
  getAnalyser,
  analyser: directAnalyser,
  width = 300,
  height = 120,
  accentColor = '#4ade80',
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Float32Array | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = directAnalyser ?? getAnalyser?.();

    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (!analyser) {
      // No analyser - draw flat line
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Initialize data array if needed
    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.fftSize) {
      dataArrayRef.current = new Float32Array(analyser.fftSize);
    }

    const dataArray = dataArrayRef.current;
    analyser.getFloatTimeDomainData(dataArray as Float32Array<ArrayBuffer>);

    const centerY = height / 2;
    const amplitude = height * 0.4; // Leave some padding

    // Find a good starting point (zero crossing going up) for stable display
    let startIndex = 0;
    for (let i = 0; i < dataArray.length - 1; i++) {
      if ((dataArray[i] ?? 0) <= 0 && (dataArray[i + 1] ?? 0) > 0) {
        startIndex = i;
        break;
      }
    }

    // Number of samples to display (about 2-3 cycles)
    const samplesToShow = Math.min(512, dataArray.length - startIndex);
    const sliceWidth = width / samplesToShow;

    // Draw filled waveform (positive part)
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i < samplesToShow; i++) {
      const sample = dataArray[startIndex + i] ?? 0;
      const x = i * sliceWidth;
      const y = centerY - sample * amplitude;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Close the path back to center
    ctx.lineTo(width, centerY);
    ctx.closePath();

    // Fill with semi-transparent accent color
    ctx.fillStyle = accentColor + '40'; // 25% opacity
    ctx.fill();

    // Draw the waveform stroke
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i < samplesToShow; i++) {
      const sample = dataArray[startIndex + i] ?? 0;
      const x = i * sliceWidth;
      const y = centerY - sample * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Schedule next frame
    animationRef.current = requestAnimationFrame(draw);
  }, [getAnalyser, directAnalyser, width, height, accentColor]);

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
});
