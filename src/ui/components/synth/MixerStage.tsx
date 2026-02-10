/**
 * MIXER stage — 4-channel level mixer (OSC 1, OSC 2, Sub Osc, Noise)
 */

import { Knob, StageCard } from '../index.ts';

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

export function MixerStage({
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
  const fmt = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <StageCard title="MIXER" color="#10b981">
      <div className="flex flex-col gap-2">
        <Knob label="OSC 1" value={osc1Level} min={0} max={1} step={0.01} onChange={onOsc1LevelChange} formatValue={fmt} paramId="oscillator.level" />
        <Knob label="OSC 2" value={osc2Level} min={0} max={1} step={0.01} onChange={onOsc2LevelChange} formatValue={fmt} paramId="osc2.level" modulatedValue={modulatedOsc2Mix} />
        <Knob label="Sub Osc" value={subOscLevel} min={0} max={1} step={0.01} onChange={onSubOscLevelChange} formatValue={fmt} paramId="subOsc.level" />
        <Knob label="Noise" value={noiseLevel} min={0} max={1} step={0.01} onChange={onNoiseLevelChange} formatValue={fmt} paramId="noise.level" />
      </div>
    </StageCard>
  );
}
