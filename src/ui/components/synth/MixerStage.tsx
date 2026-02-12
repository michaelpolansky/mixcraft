/**
 * MIXER stage — 4-channel level mixer (OSC 1, OSC 2, Sub Osc, Noise)
 */

import { memo } from 'react';
import { Knob, StageCard } from '../index.ts';
import { formatPercent } from '../../utils/formatters.ts';

interface MixerStageProps {
  osc1Level: number;
  osc2Level: number;
  subOscLevel: number;
  noiseLevel: number;
  onOsc1LevelChange: (v: number) => void;
  onOsc2LevelChange: (v: number) => void;
  onSubOscLevelChange: (v: number) => void;
  onNoiseLevelChange: (v: number) => void;
  modulatedOsc2Mix?: number;
}

export const MixerStage = memo(function MixerStage({
  osc1Level,
  osc2Level,
  subOscLevel,
  noiseLevel,
  onOsc1LevelChange,
  onOsc2LevelChange,
  onSubOscLevelChange,
  onNoiseLevelChange,
  modulatedOsc2Mix,
}: MixerStageProps) {
  return (
    <StageCard title="MIXER" color="#10b981">
      <div className="flex flex-col gap-2">
        <Knob label="OSC 1" value={osc1Level} min={0} max={1} step={0.01} onChange={onOsc1LevelChange} formatValue={formatPercent} paramId="oscillator.level" />
        <Knob label="OSC 2" value={osc2Level} min={0} max={1} step={0.01} onChange={onOsc2LevelChange} formatValue={formatPercent} paramId="osc2.level" modulatedValue={modulatedOsc2Mix} />
        <Knob label="Sub Osc" value={subOscLevel} min={0} max={1} step={0.01} onChange={onSubOscLevelChange} formatValue={formatPercent} paramId="subOsc.level" />
        <Knob label="Noise" value={noiseLevel} min={0} max={1} step={0.01} onChange={onNoiseLevelChange} formatValue={formatPercent} paramId="noise.level" />
      </div>
    </StageCard>
  );
});
