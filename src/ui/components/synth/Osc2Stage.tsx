/**
 * OSC 2 stage
 */

import { Knob, WaveformSelector, OscillatorVisualizer, StageCard } from '../index.ts';
import type { OscillatorType } from '../../../core/types.ts';

interface Osc2StageProps {
  type: OscillatorType;
  octave: number;
  detune: number;
  onTypeChange: (t: OscillatorType) => void;
  onOctaveChange: (v: number) => void;
  onDetuneChange: (v: number) => void;
  color: string;
}

export function Osc2Stage({
  type,
  octave,
  detune,
  onTypeChange,
  onOctaveChange,
  onDetuneChange,
  color,
}: Osc2StageProps) {
  return (
    <StageCard title="OSC 2" color={color}>
      <OscillatorVisualizer
        waveform={type}
        octave={octave}
        detune={detune}
        width={200}
        height={100}
        accentColor={color}
        compact
      />
      <div className="mt-3">
        <WaveformSelector
          value={type}
          onChange={(t: OscillatorType) => onTypeChange(t)}
          accentColor={color}
        />
      </div>
      <div className="flex flex-col gap-2 mt-3">
        <Knob label="Octave" value={octave} min={-2} max={2} step={1} onChange={onOctaveChange} formatValue={(v) => v >= 0 ? `+${v}` : `${v}`} paramId="osc2.octave" />
        <Knob label="Detune" value={detune} min={-100} max={100} step={1} onChange={onDetuneChange} formatValue={(v) => `${v} ct`} paramId="osc2.detune" />
      </div>
    </StageCard>
  );
}
