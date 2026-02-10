/**
 * Generic LFO stage (used for LFO 1 and LFO 2)
 */

import { Knob, WaveformSelector, LFOVisualizer, StageCard } from '../index.ts';
import { formatPercent } from '../../utils/formatters.ts';
import type { LFOWaveform, LFOSyncDivision } from '../../../core/types.ts';

const LFO_SYNC_DIVISIONS: { value: LFOSyncDivision; label: string }[] = [
  { value: '1n', label: '1' },
  { value: '2n', label: '1/2' },
  { value: '4n', label: '1/4' },
  { value: '8n', label: '1/8' },
  { value: '16n', label: '1/16' },
  { value: '32n', label: '1/32' },
];

interface LFOStageProps {
  title: string;
  color: string;
  waveform: LFOWaveform;
  rate: number;
  depth: number;
  onWaveformChange: (w: LFOWaveform) => void;
  onRateChange: (v: number) => void;
  onDepthChange: (v: number) => void;
  paramPrefix: string;
  modulatedRate?: number;
  // LFO 1 sync options
  sync?: boolean;
  syncDivision?: LFOSyncDivision;
  onSyncChange?: (v: boolean) => void;
  onSyncDivisionChange?: (v: LFOSyncDivision) => void;
  // LFO 2 enable toggle
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
  /** For LFO 2 that dims visualizer when disabled */
  visualizerDepthOverride?: number;
}

const SIZES = {
  visualizer: { width: 200, height: 100 },
  gap: { sm: 8 },
  margin: { section: 12 },
};

export function LFOStage({
  title,
  color,
  waveform,
  rate,
  depth,
  onWaveformChange,
  onRateChange,
  onDepthChange,
  paramPrefix,
  modulatedRate,
  sync,
  syncDivision,
  onSyncChange,
  onSyncDivisionChange,
  enabled,
  onEnabledChange,
  visualizerDepthOverride,
}: LFOStageProps) {
  return (
    <StageCard title={title} color={color}>
      <LFOVisualizer
        waveform={waveform}
        rate={rate}
        depth={visualizerDepthOverride !== undefined ? visualizerDepthOverride : depth}
        width={SIZES.visualizer.width}
        height={SIZES.visualizer.height}
        accentColor={color}
        compact
      />
      <div style={{ marginTop: SIZES.margin.section }}>
        <WaveformSelector value={waveform} onChange={onWaveformChange} accentColor={color} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm, marginTop: SIZES.margin.section }}>
        {/* Rate knob or Division selector when synced */}
        {sync === undefined || !sync ? (
          <Knob label="Rate" value={rate} min={0.1} max={20} step={0.1} onChange={onRateChange} formatValue={(v) => `${v.toFixed(1)} Hz`} paramId={`${paramPrefix}.rate`} modulatedValue={modulatedRate} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Division</span>
            <select
              value={syncDivision}
              onChange={(e) => onSyncDivisionChange?.(e.target.value as LFOSyncDivision)}
              style={{
                padding: '4px 8px',
                background: '#1a1a1a',
                border: `1px solid ${color}`,
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {LFO_SYNC_DIVISIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        )}
        <Knob label="Depth" value={depth} min={0} max={1} step={0.01} onChange={onDepthChange} formatValue={formatPercent} paramId={`${paramPrefix}.depth`} />
      </div>

      {/* Sync toggle (LFO 1) */}
      {onSyncChange && (
        <div style={{ marginTop: SIZES.margin.section, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => onSyncChange(!sync)}
            style={{
              padding: '4px 12px',
              background: sync ? color : '#222',
              border: `1px solid ${sync ? color : '#444'}`,
              borderRadius: '4px',
              color: sync ? '#fff' : '#888',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {sync ? 'SYNC ON' : 'SYNC OFF'}
          </button>
        </div>
      )}

      {/* Enable toggle (LFO 2) */}
      {onEnabledChange && (
        <div style={{ marginTop: SIZES.margin.section, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => onEnabledChange(!enabled)}
            style={{
              padding: '4px 12px',
              background: enabled ? color : '#222',
              border: `1px solid ${enabled ? color : '#444'}`,
              borderRadius: '4px',
              color: enabled ? '#fff' : '#888',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
    </StageCard>
  );
}
