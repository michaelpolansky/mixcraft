/**
 * Compressor Control
 * Progressive disclosure: simple (threshold/amount) or full (+ attack/release)
 */

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
        GR
      </div>

      {/* Vertical meter */}
      <div
        style={{
          width: '16px',
          height: '80px',
          background: '#1a1a1a',
          borderRadius: '3px',
          border: '1px solid #333',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          color: value < -6 ? '#ef4444' : '#888',
        }}
      >
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
    <div
      style={{
        background: '#141414',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        Compressor
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Main controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Row 1: Threshold + Amount */}
          <div style={{ display: 'flex', gap: '16px' }}>
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
            <div style={{ display: 'flex', gap: '16px' }}>
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
