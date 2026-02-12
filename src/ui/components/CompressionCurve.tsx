/**
 * Compression Transfer Curve
 * Shows the input→output transfer function for a compressor.
 * The curve bends at the threshold, showing how loud signals get "squashed."
 * An animated operating point dot shows where the current signal sits on the curve.
 */

import { useRef, useEffect, memo } from 'react';

interface CompressionCurveProps {
  threshold: number;      // -60 to 0 dB
  ratio: number;          // 1 to 20 (caller converts amount → ratio)
  knee: number;           // dB (fixed at 6 in our system)
  gainReduction: number;  // Current GR in dB (negative)
  width?: number;
  height?: number;
  accentColor?: string;
}

// dB range for the display
const MIN_DB = -60;
const MAX_DB = 0;
const PADDING = 6; // px padding for labels

/**
 * Soft-knee compression transfer function.
 * Returns output dB for a given input dB.
 */
export function outputDb(input: number, threshold: number, ratio: number, knee: number): number {
  if (ratio <= 1) return input; // No compression
  if (input < threshold - knee / 2) return input; // Below knee
  if (input > threshold + knee / 2) {
    // Above knee — linear compression
    return threshold + (input - threshold) / ratio;
  }
  // In knee region — quadratic interpolation
  const x = input - threshold + knee / 2;
  return input - ((1 - 1 / ratio) / (2 * knee)) * x * x;
}

/**
 * Estimate input level from gain reduction amount.
 * Above knee: GR = (input - threshold) * (1 - 1/ratio)
 * Solving: input = threshold + |GR| / (1 - 1/ratio)
 */
export function estimateInputFromGR(gainReduction: number, threshold: number, ratio: number): number {
  if (ratio <= 1 || gainReduction >= 0) return threshold;
  const absGR = Math.abs(gainReduction);
  const input = threshold + absGR / (1 - 1 / ratio);
  return Math.min(MAX_DB, Math.max(MIN_DB, input));
}

export const CompressionCurve = memo(function CompressionCurve({
  threshold,
  ratio,
  knee,
  gainReduction,
  width = 200,
  height = 150,
  accentColor = '#4ade80',
}: CompressionCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const range = MAX_DB - MIN_DB; // 60
    const plotW = width - PADDING;
    const plotH = height - PADDING;

    // Map dB → pixel
    const dbToX = (db: number) => PADDING + ((db - MIN_DB) / range) * plotW;
    const dbToY = (db: number) => PADDING + ((MAX_DB - db) / range) * plotH;

    // Clear
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Grid lines at -50, -40, -30, -20, -10
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (let db = -50; db <= -10; db += 10) {
      const x = dbToX(db);
      const y = dbToY(db);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 1:1 reference diagonal (no compression)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dbToX(MIN_DB), dbToY(MIN_DB));
    ctx.lineTo(dbToX(MAX_DB), dbToY(MAX_DB));
    ctx.stroke();

    // Threshold marker (vertical dashed line)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const threshX = dbToX(threshold);
    ctx.moveTo(threshX, PADDING);
    ctx.lineTo(threshX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transfer curve
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const inputDb = MIN_DB + (i / steps) * range;
      const outDb = outputDb(inputDb, threshold, ratio, knee);
      const x = dbToX(inputDb);
      const y = dbToY(outDb);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point dot (only when compressing)
    if (gainReduction < -0.5) {
      const inputEst = estimateInputFromGR(gainReduction, threshold, ratio);
      const outputEst = outputDb(inputEst, threshold, ratio, knee);
      const dotX = dbToX(inputEst);
      const dotY = dbToY(outputEst);

      // Glow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Corner dB labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('-60', PADDING, height - 2);
    ctx.textAlign = 'right';
    ctx.fillText('0', width - 1, PADDING + 8);
  }, [threshold, ratio, knee, gainReduction, width, height, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg block"
    />
  );
});
