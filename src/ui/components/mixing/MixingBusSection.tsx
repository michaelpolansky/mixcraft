/**
 * Bus Processing section for multi-track mixing challenges.
 * Renders master EQ sliders and bus compressor.
 */

import type { EQParams, CompressorFullParams } from '../../../core/types.ts';
import { CompressorControl } from '../CompressorControl.tsx';

interface MixingBusSectionProps {
  showBusEQ: boolean;
  showBusCompressor: boolean;
  busEQParams: EQParams;
  compressorParams: CompressorFullParams;
  gainReduction: number;
  onBusEQLowChange: (value: number) => void;
  onBusEQMidChange: (value: number) => void;
  onBusEQHighChange: (value: number) => void;
  onCompressorThresholdChange: (value: number) => void;
  onCompressorAmountChange: (value: number) => void;
}

function formatSignedDb(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`;
}

function BusEQBand({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1">
      <div className="text-base text-text-muted mb-1">{label}</div>
      <input
        type="range"
        min="-12"
        max="12"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="text-base text-text-tertiary text-center">
        {formatSignedDb(value)}
      </div>
    </div>
  );
}

export function MixingBusSection({
  showBusEQ,
  showBusCompressor,
  busEQParams,
  compressorParams,
  gainReduction,
  onBusEQLowChange,
  onBusEQMidChange,
  onBusEQHighChange,
  onCompressorThresholdChange,
  onCompressorAmountChange,
}: MixingBusSectionProps) {
  return (
    <div className="bg-bg-tertiary rounded-xl p-4 mb-6">
      <div className="text-xl font-medium mb-4">Bus Processing</div>

      {/* Bus EQ */}
      {showBusEQ && (
        <div className={showBusCompressor ? 'mb-4' : ''}>
          <div className="text-md text-text-tertiary mb-3">Master EQ</div>
          <div className="flex gap-4">
            <BusEQBand label="Low" value={busEQParams.low} onChange={onBusEQLowChange} />
            <BusEQBand label="Mid" value={busEQParams.mid} onChange={onBusEQMidChange} />
            <BusEQBand label="High" value={busEQParams.high} onChange={onBusEQHighChange} />
          </div>
        </div>
      )}

      {/* Bus Compressor */}
      {showBusCompressor && (
        <CompressorControl
          params={compressorParams}
          gainReduction={gainReduction}
          showAdvanced={false}
          onThresholdChange={onCompressorThresholdChange}
          onAmountChange={onCompressorAmountChange}
        />
      )}
    </div>
  );
}
