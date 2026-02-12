/**
 * LayerStrip - Channel strip for a single production layer
 * Displays volume fader, mute/solo, pan knob, and EQ controls
 */

import { useCallback } from 'react';
import { Slider } from './Slider.tsx';
import { Knob } from './Knob.tsx';
import { cn } from '../utils/cn.ts';
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
    <div className="flex flex-col items-center gap-2 p-3 bg-[#1a1a1a] rounded-lg min-w-[80px]">
      {/* Layer name */}
      <span className="text-[11px] text-white font-medium uppercase tracking-wide text-center">
        {state.name}
      </span>

      {/* EQ section (if enabled) */}
      {showEQ && (
        <div className="flex gap-1">
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
      <div className="flex items-stretch gap-1">
        {/* Meter */}
        <div className="w-2 h-[120px] bg-[#0a0a0a] rounded relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 transition-[height] duration-[50ms] ease-out"
            style={{
              height: `${meterHeight}%`,
              background: meterColor,
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
      <div className="flex gap-1">
        <button
          onClick={onMuteToggle}
          className={cn(
            'w-7 h-6 border-none rounded text-[11px] font-bold cursor-pointer transition-colors duration-100',
            state.muted ? 'bg-[#f97316] text-white' : 'bg-[#333] text-[#888]'
          )}
        >
          M
        </button>
        <button
          onClick={onSoloToggle}
          className={cn(
            'w-7 h-6 border-none rounded text-[11px] font-bold cursor-pointer transition-colors duration-100',
            state.solo ? 'bg-[#eab308] text-black' : 'bg-[#333] text-[#888]'
          )}
        >
          S
        </button>
      </div>

      {/* Volume readout */}
      <span className="text-[10px] text-[#4ade80] font-mono">
        {formatVolume(state.volume)} dB
      </span>
    </div>
  );
}
