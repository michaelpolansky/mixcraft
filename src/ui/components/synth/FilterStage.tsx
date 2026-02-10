/**
 * FILTER stage with visualizer, type selector, cutoff, resonance, key tracking
 */

import { Knob, FilterTypeSelector, FilterVisualizer, StageCard } from '../index.ts';
import { formatHz, formatPercent } from '../../utils/formatters.ts';
import { PARAM_RANGES } from '../../../core/types.ts';
import type { FilterType } from '../../../core/types.ts';

interface FilterStageProps {
  type: FilterType;
  cutoff: number;
  resonance: number;
  keyTracking: number;
  onTypeChange: (t: FilterType) => void;
  onCutoffChange: (v: number) => void;
  onResonanceChange: (v: number) => void;
  onKeyTrackingChange: (v: number) => void;
  modulatedCutoff?: number;
  color: string;
}

export function FilterStage({
  type,
  cutoff,
  resonance,
  keyTracking,
  onTypeChange,
  onCutoffChange,
  onResonanceChange,
  onKeyTrackingChange,
  modulatedCutoff,
  color,
}: FilterStageProps) {
  return (
    <StageCard title="FILTER" color={color}>
      <FilterVisualizer
        filterType={type}
        cutoff={cutoff}
        resonance={resonance}
        onCutoffChange={onCutoffChange}
        onResonanceChange={onResonanceChange}
        width={200}
        height={100}
        accentColor={color}
        compact
        modulatedCutoff={modulatedCutoff}
      />
      <div className="mt-3">
        <FilterTypeSelector value={type} onChange={onTypeChange} />
      </div>
      <div className="flex flex-col gap-2 mt-3">
        <Knob label="Cutoff" value={cutoff} min={PARAM_RANGES.cutoff.min} max={PARAM_RANGES.cutoff.max} step={1} onChange={onCutoffChange} formatValue={formatHz} logarithmic paramId="filter.cutoff" modulatedValue={modulatedCutoff} />
        <Knob label="Resonance" value={resonance} min={0} max={20} step={0.1} onChange={onResonanceChange} formatValue={(v) => v.toFixed(1)} paramId="filter.resonance" />
        <Knob label="Key Tracking" value={keyTracking} min={0} max={1} step={0.01} onChange={onKeyTrackingChange} formatValue={formatPercent} paramId="filter.keyTracking" />
      </div>
    </StageCard>
  );
}
