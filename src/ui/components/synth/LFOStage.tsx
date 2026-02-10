/**
 * Generic LFO stage (used for LFO 1 and LFO 2)
 */

import { Knob, WaveformSelector, LFOVisualizer, StageCard } from '../index.ts';
import { cn } from '../../utils/cn.ts';
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
  sync?: boolean;
  syncDivision?: LFOSyncDivision;
  onSyncChange?: (v: boolean) => void;
  onSyncDivisionChange?: (v: LFOSyncDivision) => void;
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
  visualizerDepthOverride?: number;
}

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
        width={200}
        height={100}
        accentColor={color}
        compact
      />
      <div className="mt-3">
        <WaveformSelector value={waveform} onChange={onWaveformChange} accentColor={color} />
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {/* Rate knob or Division selector when synced */}
        {sync === undefined || !sync ? (
          <Knob label="Rate" value={rate} min={0.1} max={20} step={0.1} onChange={onRateChange} formatValue={(v) => `${v.toFixed(1)} Hz`} paramId={`${paramPrefix}.rate`} modulatedValue={modulatedRate} />
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-tertiary uppercase tracking-wide">Division</span>
            <select
              value={syncDivision}
              onChange={(e) => onSyncDivisionChange?.(e.target.value as LFOSyncDivision)}
              className="py-1 px-2 bg-bg-tertiary rounded-sm text-text-primary text-base cursor-pointer"
              style={{ border: `1px solid ${color}` }}
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
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => onSyncChange(!sync)}
            className={cn(
              'py-1 px-3 rounded-sm text-sm cursor-pointer font-semibold border',
              sync
                ? 'text-text-primary'
                : 'bg-bg-quaternary border-border-bright text-text-tertiary'
            )}
            style={sync ? { background: color, borderColor: color } : undefined}
          >
            {sync ? 'SYNC ON' : 'SYNC OFF'}
          </button>
        </div>
      )}

      {/* Enable toggle (LFO 2) */}
      {onEnabledChange && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => onEnabledChange(!enabled)}
            className={cn(
              'py-1 px-3 rounded-sm text-sm cursor-pointer font-semibold border',
              enabled
                ? 'text-text-primary'
                : 'bg-bg-quaternary border-border-bright text-text-tertiary'
            )}
            style={enabled ? { background: color, borderColor: color } : undefined}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
    </StageCard>
  );
}
