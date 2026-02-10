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

const SIZES = {
  visualizer: { width: 200, height: 100 },
  gap: { sm: 8 },
  margin: { section: 12 },
};

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
        width={SIZES.visualizer.width}
        height={SIZES.visualizer.height}
        accentColor={color}
        compact
      />
      <div style={{ marginTop: SIZES.margin.section }}>
        <WaveformSelector
          value={type}
          onChange={(t: OscillatorType) => onTypeChange(t)}
          accentColor={color}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm, marginTop: SIZES.margin.section }}>
        <Knob label="Octave" value={octave} min={-2} max={2} step={1} onChange={onOctaveChange} formatValue={(v) => v >= 0 ? `+${v}` : `${v}`} paramId="osc2.octave" />
        <Knob label="Detune" value={detune} min={-100} max={100} step={1} onChange={onDetuneChange} formatValue={(v) => `${v} ct`} paramId="osc2.detune" />
      </div>
    </StageCard>
  );
}
