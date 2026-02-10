/**
 * Generic envelope stage for SynthView (PITCH ENV, PWM ENV, FILTER ENV, AMP, MOD ENV)
 */

import { Knob, EnvelopeVisualizer, StageCard } from '../index.ts';
import { formatMs, formatPercent } from '../../utils/formatters.ts';

interface EnvelopeStageProps {
  title: string;
  color: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (v: number) => void;
  onDecayChange: (v: number) => void;
  onSustainChange: (v: number) => void;
  onReleaseChange: (v: number) => void;
  amount?: number;
  onAmountChange?: (v: number) => void;
  amountMin?: number;
  amountMax?: number;
  amountStep?: number;
  amountFormat?: (v: number) => string;
  paramPrefix: string;
  isTriggered?: boolean;
  visualizerWidth?: number;
  visualizerHeight?: number;
}

const SIZES = {
  visualizer: { width: 200, compactHeight: 60 },
  gap: { sm: 8 },
};

export function EnvelopeStage({
  title,
  color,
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  amount,
  onAmountChange,
  amountMin = 0,
  amountMax = 1,
  amountStep = 0.01,
  amountFormat = formatPercent,
  paramPrefix,
  isTriggered,
  visualizerWidth = SIZES.visualizer.width,
  visualizerHeight = SIZES.visualizer.compactHeight,
}: EnvelopeStageProps) {
  return (
    <StageCard title={title} color={color}>
      <EnvelopeVisualizer
        attack={attack}
        decay={decay}
        sustain={sustain}
        release={release}
        onAttackChange={onAttackChange}
        onDecayChange={onDecayChange}
        onSustainChange={onSustainChange}
        onReleaseChange={onReleaseChange}
        width={visualizerWidth}
        height={visualizerHeight}
        accentColor={color}
        compact
        isTriggered={isTriggered}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm, marginTop: SIZES.gap.sm }}>
        <Knob label="Attack" value={attack} min={0.001} max={2} step={0.001} onChange={onAttackChange} formatValue={formatMs} paramId={`${paramPrefix}.attack`} />
        <Knob label="Decay" value={decay} min={0.001} max={2} step={0.001} onChange={onDecayChange} formatValue={formatMs} paramId={`${paramPrefix}.decay`} />
        <Knob label="Sustain" value={sustain} min={0} max={1} step={0.01} onChange={onSustainChange} formatValue={formatPercent} paramId={`${paramPrefix}.sustain`} />
        <Knob label="Release" value={release} min={0.001} max={4} step={0.001} onChange={onReleaseChange} formatValue={formatMs} paramId={`${paramPrefix}.release`} />
        {amount !== undefined && onAmountChange && (
          <Knob label="Amount" value={amount} min={amountMin} max={amountMax} step={amountStep} onChange={onAmountChange} formatValue={amountFormat} paramId={`${paramPrefix}.amount`} />
        )}
      </div>
    </StageCard>
  );
}
