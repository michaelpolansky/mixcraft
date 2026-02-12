/**
 * Dual waveform visualization for FM synthesis
 * Shows carrier and modulator waveforms side-by-side using Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { OscillatorType } from '../../core/types.ts';

interface CarrierModulatorVizProps {
  carrierType: OscillatorType;
  modulatorType: OscillatorType;
  harmonicity: number;
  modulationIndex: number;
}

/**
 * Draw a waveform on a canvas context
 * Draws 2 full cycles of the specified waveform type
 */
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  type: OscillatorType,
  width: number,
  height: number,
  color: string
) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const centerY = height / 2;
  const amplitude = height * 0.4;
  const cycles = 2;

  ctx.beginPath();

  for (let x = 0; x <= width; x++) {
    const phase = (x / width) * cycles * Math.PI * 2;
    let y: number;

    switch (type) {
      case 'sine':
        y = centerY - Math.sin(phase) * amplitude;
        break;
      case 'square':
        y = centerY - Math.sign(Math.sin(phase)) * amplitude;
        break;
      case 'sawtooth':
        // Sawtooth: linear ramp from -1 to 1, then reset
        const sawPhase = ((phase / (Math.PI * 2)) % 1);
        y = centerY - (sawPhase * 2 - 1) * amplitude;
        break;
      case 'triangle':
        // Triangle: up then down
        const triPhase = ((phase / (Math.PI * 2)) % 1);
        const triValue = triPhase < 0.5
          ? triPhase * 4 - 1
          : 3 - triPhase * 4;
        y = centerY - triValue * amplitude;
        break;
      default:
        y = centerY;
    }

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

export function CarrierModulatorViz({
  carrierType,
  modulatorType,
  harmonicity,
}: CarrierModulatorVizProps) {
  const carrierCanvasRef = useRef<HTMLCanvasElement>(null);
  const modulatorCanvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = 140;
  const canvasHeight = 60;

  // Draw carrier waveform
  useEffect(() => {
    const canvas = carrierCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWaveform(ctx, carrierType, canvasWidth, canvasHeight, '#00ff88');
  }, [carrierType]);

  // Draw modulator waveform
  useEffect(() => {
    const canvas = modulatorCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWaveform(ctx, modulatorType, canvasWidth, canvasHeight, '#ff8800');
  }, [modulatorType]);

  return (
    <div className="flex gap-4 justify-center">
      {/* Carrier waveform */}
      <div className="flex flex-col items-center">
        <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1 text-center">
          Carrier
        </div>
        <div className="bg-[#0a0a0a] rounded-md p-2 border border-[#222]">
          <canvas
            ref={carrierCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="block"
          />
        </div>
      </div>

      {/* Modulator waveform */}
      <div className="flex flex-col items-center">
        <div className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1 text-center">
          Modulator ({harmonicity.toFixed(1)}x)
        </div>
        <div className="bg-[#0a0a0a] rounded-md p-2 border border-[#222]">
          <canvas
            ref={modulatorCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="block"
          />
        </div>
      </div>
    </div>
  );
}
