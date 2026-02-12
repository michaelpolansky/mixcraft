/**
 * Per-track strip for multi-track mixing challenges.
 * Renders EQ (simple 3-band or parametric), compressor, volume, pan, and reverb controls.
 */

import { memo } from 'react';
import type { MixingTrack, ParametricBand, ParametricEQParams } from '../../../core/types.ts';
import type { TrackEQParams } from '../../stores/mixing-store.ts';
import { ParametricEQControl } from '../ParametricEQControl.tsx';

interface MixingTrackStripProps {
  track: MixingTrack;
  params: TrackEQParams;
  isParametricMode: boolean;
  parametricEQ?: ParametricEQParams;
  gainReduction: number;
  showCompressor: boolean;
  showVolume: boolean;
  showPan: boolean;
  showReverb: boolean;
  onEQLowChange: (trackId: string, value: number) => void;
  onEQMidChange: (trackId: string, value: number) => void;
  onEQHighChange: (trackId: string, value: number) => void;
  onParametricBandChange: (trackId: string, index: number, band: Partial<ParametricBand>) => void;
  onVolumeChange: (trackId: string, value: number) => void;
  onPanChange: (trackId: string, value: number) => void;
  onReverbMixChange: (trackId: string, value: number) => void;
  onReverbSizeChange: (trackId: string, value: number) => void;
  onCompressorThresholdChange: (trackId: string, value: number) => void;
  onCompressorAmountChange: (trackId: string, value: number) => void;
}

function EQSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  labelWidth = 'w-8',
  valueWidth = 'w-10',
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  labelWidth?: string;
  valueWidth?: string;
  formatValue: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm text-text-tertiary ${labelWidth}`}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className={`text-base text-text-tertiary ${valueWidth} text-right`}>
        {formatValue(value)}
      </span>
    </div>
  );
}

function formatSignedDb(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
}

function formatDb(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`;
}

function formatPan(v: number): string {
  if (v === 0) return 'C';
  return v < 0 ? `L${Math.abs(v * 100).toFixed(0)}` : `R${(v * 100).toFixed(0)}`;
}

export const MixingTrackStrip = memo(function MixingTrackStrip({
  track,
  params,
  isParametricMode,
  parametricEQ,
  gainReduction,
  showCompressor,
  showVolume,
  showPan,
  showReverb,
  onEQLowChange,
  onEQMidChange,
  onEQHighChange,
  onParametricBandChange,
  onVolumeChange,
  onPanChange,
  onReverbMixChange,
  onReverbSizeChange,
  onCompressorThresholdChange,
  onCompressorAmountChange,
}: MixingTrackStripProps) {
  const grAbs = Math.abs(gainReduction);

  return (
    <div
      className="flex-1 bg-bg-tertiary rounded-xl p-4"
      style={{ borderTop: `3px solid ${track.color ?? '#666'}` }}
    >
      <div
        className="text-xl font-medium mb-4"
        style={{ color: track.color ?? '#fff' }}
      >
        {track.name}
      </div>

      {/* Per-track EQ */}
      <div className="mb-4">
        {isParametricMode && parametricEQ ? (
          <ParametricEQControl
            bands={parametricEQ.bands}
            onBandChange={(index, bandParams) => onParametricBandChange(track.id, index, bandParams)}
          />
        ) : (
          <>
            <div className="text-base text-text-muted mb-2">EQ</div>
            <div className="flex flex-col gap-2">
              <EQSlider label="Low" value={params.low} min={-12} max={12} step={0.5}
                onChange={(v) => onEQLowChange(track.id, v)} formatValue={formatSignedDb} />
              <EQSlider label="Mid" value={params.mid} min={-12} max={12} step={0.5}
                onChange={(v) => onEQMidChange(track.id, v)} formatValue={formatSignedDb} />
              <EQSlider label="High" value={params.high} min={-12} max={12} step={0.5}
                onChange={(v) => onEQHighChange(track.id, v)} formatValue={formatSignedDb} />
            </div>
          </>
        )}
      </div>

      {/* Per-Track Compressor */}
      {showCompressor && (
        <div className="mb-4">
          <div className="text-base text-text-muted mb-2">Compressor</div>
          <div className="flex flex-col gap-2">
            <EQSlider label="Thresh" value={params.compressorThreshold} min={-60} max={0} step={1}
              labelWidth="w-10" onChange={(v) => onCompressorThresholdChange(track.id, v)}
              formatValue={(v) => `${v} dB`} />
            <EQSlider label="Amt" value={params.compressorAmount} min={0} max={100} step={5}
              labelWidth="w-10" valueWidth="w-8" onChange={(v) => onCompressorAmountChange(track.id, v)}
              formatValue={(v) => `${v}%`} />
            {/* Mini GR meter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-tertiary w-10">GR</span>
              <div className="flex-1 h-3 bg-[#0a0a0a] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${Math.min(100, grAbs * 5)}%`,
                    background: grAbs > 10 ? '#ef4444' : grAbs > 4 ? '#eab308' : '#22c55e',
                    transition: 'width 0.05s ease',
                  }}
                />
              </div>
              <span className="text-sm text-text-tertiary w-10 text-right font-mono">
                {gainReduction.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Volume */}
      {showVolume && (
        <div className={showPan ? 'mb-4' : ''}>
          <div className="text-base text-text-muted mb-2">Volume</div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-24"
              max="6"
              step="0.5"
              value={params.volume}
              onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-base text-text-tertiary w-10 text-right">
              {formatDb(params.volume)}
            </span>
          </div>
        </div>
      )}

      {/* Pan */}
      {showPan && (
        <div className={showReverb ? 'mb-4' : ''}>
          <div className="text-base text-text-muted mb-2">Pan</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">L</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={params.pan}
              onChange={(e) => onPanChange(track.id, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-text-muted">R</span>
            <span className="text-base text-text-tertiary w-8 text-right">
              {formatPan(params.pan)}
            </span>
          </div>
        </div>
      )}

      {/* Reverb */}
      {showReverb && (
        <div>
          <div className="text-base text-text-muted mb-2">Reverb</div>
          <div className="flex flex-col gap-2">
            <EQSlider label="Mix" value={params.reverbMix} min={0} max={100} step={5}
              labelWidth="w-7" valueWidth="w-8" onChange={(v) => onReverbMixChange(track.id, v)}
              formatValue={(v) => `${v.toFixed(0)}%`} />
            <EQSlider label="Size" value={params.reverbSize} min={0} max={100} step={5}
              labelWidth="w-7" valueWidth="w-8" onChange={(v) => onReverbSizeChange(track.id, v)}
              formatValue={(v) => `${v.toFixed(0)}%`} />
          </div>
        </div>
      )}
    </div>
  );
});
