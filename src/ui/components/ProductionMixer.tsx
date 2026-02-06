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
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '16px',
        background: '#0a0a0a',
        borderRadius: '12px',
      }}
    >
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
      <div
        style={{
          width: '1px',
          background: '#333',
          alignSelf: 'stretch',
          margin: '0 4px',
        }}
      />

      {/* Master section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: '#1a1a1a',
          borderRadius: '8px',
          minWidth: '60px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: '#fff',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Master
        </span>

        {/* Spacer to align with strips */}
        <div style={{ flex: 1 }} />

        {/* Master meter (stereo-style) */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <div
            style={{
              width: '12px',
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
                height: `${masterMeterHeight}%`,
                background: masterMeterColor,
                transition: 'height 50ms ease-out',
              }}
            />
          </div>
          <div
            style={{
              width: '12px',
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
                height: `${masterMeterHeight}%`,
                background: masterMeterColor,
                transition: 'height 50ms ease-out',
              }}
            />
          </div>
        </div>

        {/* dB scale markers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            fontSize: '8px',
            color: '#666',
            fontFamily: 'monospace',
          }}
        >
          <span>0</span>
          <span>-12</span>
          <span>-24</span>
        </div>
      </div>
    </div>
  );
}
