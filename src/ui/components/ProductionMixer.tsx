/**
 * ProductionMixer - Container for multiple LayerStrips
 * Shows 2-4 layers side by side with master output
 */

import { useEffect, useRef, useState } from 'react';
import { LayerStrip } from './LayerStrip.tsx';
import type { LayerState } from '../../core/production-source.ts';
import type { ProductionSource } from '../../core/production-source.ts';

interface ProductionMixerProps {
  layers: LayerState[];
  source: ProductionSource | null;
  onVolumeChange: (layerId: string, volume: number) => void;
  onPanChange: (layerId: string, pan: number) => void;
  onMuteToggle: (layerId: string) => void;
  onSoloToggle: (layerId: string) => void;
  onEQLowChange: (layerId: string, db: number) => void;
  onEQHighChange: (layerId: string, db: number) => void;
  showPan: boolean;
  showEQ: boolean;
}

export function ProductionMixer({
  layers,
  source,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onEQLowChange,
  onEQHighChange,
  showPan,
  showEQ,
}: ProductionMixerProps) {
  const [layerLevels, setLayerLevels] = useState<Record<string, number>>({});
  const [masterLevel, setMasterLevel] = useState(-Infinity);
  const animationRef = useRef<number | null>(null);

  // Poll levels for meters
  useEffect(() => {
    if (!source) return;

    const updateLevels = () => {
      const levels: Record<string, number> = {};
      for (const layer of layers) {
        levels[layer.id] = source.getLayerLevel(layer.id);
      }
      setLayerLevels(levels);
      setMasterLevel(source.getMasterLevel());
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [source, layers]);

  // Calculate master meter height
  const masterMeterHeight = Math.max(0, Math.min(100, ((masterLevel + 60) / 66) * 100));
  const masterMeterColor =
    masterLevel > -6 ? '#ef4444' : masterLevel > -12 ? '#eab308' : '#4ade80';

  return (
    <div className="flex gap-2 p-4 bg-[#0a0a0a] rounded-xl">
      {/* Layer strips */}
      {layers.map((layer) => (
        <LayerStrip
          key={layer.id}
          state={layer}
          level={layerLevels[layer.id] ?? -Infinity}
          onVolumeChange={(v) => onVolumeChange(layer.id, v)}
          onPanChange={(p) => onPanChange(layer.id, p)}
          onMuteToggle={() => onMuteToggle(layer.id)}
          onSoloToggle={() => onSoloToggle(layer.id)}
          onEQLowChange={(db) => onEQLowChange(layer.id, db)}
          onEQHighChange={(db) => onEQHighChange(layer.id, db)}
          showPan={showPan}
          showEQ={showEQ}
        />
      ))}

      {/* Divider */}
      <div className="w-px bg-[#333] self-stretch mx-1" />

      {/* Master section */}
      <div className="flex flex-col items-center gap-2 p-3 bg-[#1a1a1a] rounded-lg min-w-[60px]">
        <span className="text-[11px] text-white font-medium uppercase tracking-wider">
          Master
        </span>

        {/* Spacer to align with strips */}
        <div className="flex-1" />

        {/* Master meter (stereo-style) */}
        <div className="flex gap-0.5">
          <div className="w-3 h-[120px] bg-[#0a0a0a] rounded relative overflow-hidden">
            <div
              style={{
                height: `${masterMeterHeight}%`,
                background: masterMeterColor,
                transition: 'height 50ms ease-out',
              }}
              className="absolute bottom-0 left-0 right-0"
            />
          </div>
          <div className="w-3 h-[120px] bg-[#0a0a0a] rounded relative overflow-hidden">
            <div
              style={{
                height: `${masterMeterHeight}%`,
                background: masterMeterColor,
                transition: 'height 50ms ease-out',
              }}
              className="absolute bottom-0 left-0 right-0"
            />
          </div>
        </div>

        {/* dB scale markers */}
        <div className="flex flex-col items-end text-[8px] text-[#666] font-mono">
          <span>0</span>
          <span>-12</span>
          <span>-24</span>
        </div>
      </div>
    </div>
  );
}
