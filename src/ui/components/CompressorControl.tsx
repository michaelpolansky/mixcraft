/**
 * Compressor Control
 * Progressive disclosure: simple (threshold/amount) or full (+ attack/release)
 */

import { cn } from '../utils/cn.ts';
import { Knob } from './Knob.tsx';
import type { CompressorFullParams } from '../../core/mixing-effects.ts';
import { COMPRESSOR_RANGES } from '../../core/mixing-effects.ts';

interface CompressorControlProps {
  params: CompressorFullParams;
  gainReduction: number;
  showAdvanced: boolean; // Show attack/release controls
  onThresholdChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  onAttackChange?: (value: number) => void;
  onReleaseChange?: (value: number) => void;
}

interface GainReductionMeterProps {
  value: number; // Negative dB value
}

function GainReductionMeter({ value }: GainReductionMeterProps) {
  // Map -30dB to 0dB range
  const maxReduction = 30;
  const percent = Math.min(100, (Math.abs(value) / maxReduction) * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-text-muted uppercase">
        GR
      </div>

      {/* Vertical meter */}
      <div className="w-4 h-20 bg-bg-tertiary rounded-sm border border-border-medium relative overflow-hidden">
        {/* Fill from top down */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${percent}%`,
            background: percent > 50 ? '#ef4444' : percent > 20 ? '#eab308' : '#22c55e',
            transition: 'height 0.05s ease',
          }}
        />
      </div>

      {/* Value display */}
      <div className={cn('text-sm font-mono', value < -6 ? 'text-danger' : 'text-text-muted')}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}

export function CompressorControl({
  params,
  gainReduction,
  showAdvanced,
  onThresholdChange,
  onAmountChange,
  onAttackChange,
  onReleaseChange,
}: CompressorControlProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
      {/* Header */}
      <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 text-center">
        Compressor
      </div>

      <div className="flex items-start gap-4">
        {/* Main controls */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Threshold + Amount */}
          <div className="flex gap-4">
            <Knob
              value={params.threshold}
              min={COMPRESSOR_RANGES.threshold.min}
              max={COMPRESSOR_RANGES.threshold.max}
              onChange={onThresholdChange}
              label="Threshold"
              size={50}
              formatValue={(v) => `${v.toFixed(0)} dB`}
            />
            <Knob
              value={params.amount}
              min={COMPRESSOR_RANGES.amount.min}
              max={COMPRESSOR_RANGES.amount.max}
              onChange={onAmountChange}
              label="Amount"
              size={50}
              formatValue={(v) => `${v.toFixed(0)}%`}
            />
          </div>

          {/* Row 2: Attack + Release (if advanced) */}
          {showAdvanced && onAttackChange && onReleaseChange && (
            <div className="flex gap-4">
              <Knob
                value={params.attack * 1000} // Show in ms
                min={COMPRESSOR_RANGES.attack.min * 1000}
                max={COMPRESSOR_RANGES.attack.max * 1000}
                onChange={(v) => onAttackChange(v / 1000)}
                label="Attack"
                size={50}
                formatValue={(v) => `${v.toFixed(0)} ms`}
              />
              <Knob
                value={params.release * 1000} // Show in ms
                min={COMPRESSOR_RANGES.release.min * 1000}
                max={COMPRESSOR_RANGES.release.max * 1000}
                onChange={(v) => onReleaseChange(v / 1000)}
                label="Release"
                size={50}
                formatValue={(v) => `${v.toFixed(0)} ms`}
              />
            </div>
          )}
        </div>

        {/* Gain reduction meter */}
        <GainReductionMeter value={gainReduction} />
      </div>
    </div>
  );
}
