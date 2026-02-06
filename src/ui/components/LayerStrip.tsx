/**
 * LayerStrip - Channel strip for a single production layer
 * Displays volume fader, mute/solo, pan knob, and EQ controls
 */

import { useCallback } from 'react';
import { Slider } from './Slider.tsx';
import { Knob } from './Knob.tsx';
import type { LayerState } from '../../core/production-source.ts';
import { LAYER_RANGES } from '../../core/production-source.ts';

interface LayerStripProps {
  state: LayerState;
  level: number; // Current meter level in dB
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onEQLowChange: (db: number) => void;
  onEQHighChange: (db: number) => void;
  showPan: boolean;
  showEQ: boolean;
}

export function LayerStrip({
  state,
  level,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onEQLowChange,
  onEQHighChange,
  showPan,
  showEQ,
}: LayerStripProps) {
  const formatVolume = useCallback((v: number) => {
    if (v <= -60) return '-∞';
    return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
  }, []);

  const formatPan = useCallback((v: number) => {
    if (Math.abs(v) < 0.05) return 'C';
    const pct = Math.abs(Math.round(v * 100));
    return v < 0 ? `L${pct}` : `R${pct}`;
  }, []);

  const formatEQ = useCallback((v: number) => {
    return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
  }, []);

  // Calculate meter height (0 to 100%)
  const meterHeight = Math.max(0, Math.min(100, ((level + 60) / 66) * 100));
  const meterColor = level > -6 ? '#ef4444' : level > -12 ? '#eab308' : '#4ade80';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        background: '#1a1a1a',
        borderRadius: '8px',
        minWidth: '80px',
      }}
    >
      {/* Layer name */}
      <span
        style={{
          fontSize: '11px',
          color: '#fff',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textAlign: 'center',
        }}
      >
        {state.name}
      </span>

      {/* EQ section (if enabled) */}
      {showEQ && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Knob
            value={state.eqHigh}
            min={LAYER_RANGES.eqHigh.min}
            max={LAYER_RANGES.eqHigh.max}
            step={0.5}
            label="HI"
            onChange={onEQHighChange}
            formatValue={formatEQ}
            size={40}
          />
          <Knob
            value={state.eqLow}
            min={LAYER_RANGES.eqLow.min}
            max={LAYER_RANGES.eqLow.max}
            step={0.5}
            label="LO"
            onChange={onEQLowChange}
            formatValue={formatEQ}
            size={40}
          />
        </div>
      )}

      {/* Pan knob (if enabled) */}
      {showPan && (
        <Knob
          value={state.pan}
          min={LAYER_RANGES.pan.min}
          max={LAYER_RANGES.pan.max}
          step={0.05}
          label="PAN"
          onChange={onPanChange}
          formatValue={formatPan}
          size={48}
        />
      )}

      {/* Volume fader with meter */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '4px' }}>
        {/* Meter */}
        <div
          style={{
            width: '8px',
            height: '120px',
            background: '#0a0a0a',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${meterHeight}%`,
              background: meterColor,
              transition: 'height 50ms ease-out',
            }}
          />
        </div>

        {/* Fader */}
        <Slider
          value={state.volume}
          min={LAYER_RANGES.volume.min}
          max={LAYER_RANGES.volume.max}
          step={0.5}
          label=""
          onChange={onVolumeChange}
          formatValue={formatVolume}
          height={120}
        />
      </div>

      {/* Mute/Solo buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onMuteToggle}
          style={{
            width: '28px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            background: state.muted ? '#f97316' : '#333',
            color: state.muted ? '#fff' : '#888',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'background 100ms ease',
          }}
        >
          M
        </button>
        <button
          onClick={onSoloToggle}
          style={{
            width: '28px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            background: state.solo ? '#eab308' : '#333',
            color: state.solo ? '#000' : '#888',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'background 100ms ease',
          }}
        >
          S
        </button>
      </div>

      {/* Volume readout */}
      <span
        style={{
          fontSize: '10px',
          color: '#4ade80',
          fontFamily: 'monospace',
        }}
      >
        {formatVolume(state.volume)} dB
      </span>
    </div>
  );
}
