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

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    textAlign: 'center',
  };

  const canvasContainerStyle: React.CSSProperties = {
    background: '#0a0a0a',
    borderRadius: '6px',
    padding: '8px',
    border: '1px solid #222',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
      }}
    >
      {/* Carrier waveform */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={labelStyle}>Carrier</div>
        <div style={canvasContainerStyle}>
          <canvas
            ref={carrierCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ display: 'block' }}
          />
        </div>
      </div>

      {/* Modulator waveform */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={labelStyle}>
          Modulator ({harmonicity.toFixed(1)}x)
        </div>
        <div style={canvasContainerStyle}>
          <canvas
            ref={modulatorCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
