/**
 * Shared effects + output section for FM and Additive challenge views
 */

import { Knob } from '../index.ts';
import { Section } from './Section.tsx';
import { PARAM_RANGES } from '../../../core/types.ts';
import { formatPercent, formatDb } from '../../utils/formatters.ts';

interface FMAdditiveEffectsSectionProps {
  effects: {
    distortion: { amount: number; mix: number };
    delay: { time: number; feedback: number; mix: number };
    reverb: { decay: number; mix: number };
    chorus: { rate: number; depth: number; mix: number };
  };
  volume: number;
  setDistortionAmount: (v: number) => void;
  setDistortionMix: (v: number) => void;
  setDelayTime: (v: number) => void;
  setDelayMix: (v: number) => void;
  setReverbDecay: (v: number) => void;
  setReverbMix: (v: number) => void;
  setChorusRate: (v: number) => void;
  setChorusMix: (v: number) => void;
  setVolume: (v: number) => void;
}

/** Single effect block within the Effects section */
function EffectBlock({ label, knobs }: {
  label: string;
  knobs: { label: string; value: number; range: { min: number; max: number; step?: number }; onChange: (v: number) => void; format: (v: number) => string }[];
}) {
  return (
    <div>
      <div className="text-sm text-text-muted mb-2 uppercase">{label}</div>
      <div className="flex gap-3">
        {knobs.map((k) => (
          <Knob key={k.label} label={k.label} value={k.value} min={k.range.min} max={k.range.max} step={k.range.step} onChange={k.onChange} formatValue={k.format} size={36} />
        ))}
      </div>
    </div>
  );
}

export function FMAdditiveEffectsSection({
  effects, volume,
  setDistortionAmount, setDistortionMix,
  setDelayTime, setDelayMix,
  setReverbDecay, setReverbMix,
  setChorusRate, setChorusMix,
  setVolume,
}: FMAdditiveEffectsSectionProps) {
  return (
    <>
      <Section title="Effects">
        <div className="grid grid-cols-2 gap-4">
          <EffectBlock label="Distortion" knobs={[
            { label: 'Amt', value: effects.distortion.amount, range: PARAM_RANGES.distortionAmount, onChange: setDistortionAmount, format: formatPercent },
            { label: 'Mix', value: effects.distortion.mix, range: PARAM_RANGES.distortionMix, onChange: setDistortionMix, format: formatPercent },
          ]} />
          <EffectBlock label="Delay" knobs={[
            { label: 'Time', value: effects.delay.time, range: PARAM_RANGES.delayTime, onChange: setDelayTime, format: (v) => `${Math.round(v * 1000)}ms` },
            { label: 'Mix', value: effects.delay.mix, range: PARAM_RANGES.delayMix, onChange: setDelayMix, format: formatPercent },
          ]} />
          <EffectBlock label="Reverb" knobs={[
            { label: 'Decay', value: effects.reverb.decay, range: PARAM_RANGES.reverbDecay, onChange: setReverbDecay, format: (v) => `${v.toFixed(1)}s` },
            { label: 'Mix', value: effects.reverb.mix, range: PARAM_RANGES.reverbMix, onChange: setReverbMix, format: formatPercent },
          ]} />
          <EffectBlock label="Chorus" knobs={[
            { label: 'Rate', value: effects.chorus.rate, range: PARAM_RANGES.chorusRate, onChange: setChorusRate, format: (v) => `${v.toFixed(1)}Hz` },
            { label: 'Mix', value: effects.chorus.mix, range: PARAM_RANGES.chorusMix, onChange: setChorusMix, format: formatPercent },
          ]} />
        </div>
      </Section>
      <Section title="Output">
        <Knob label="Volume" value={volume} min={PARAM_RANGES.volume.min} max={PARAM_RANGES.volume.max} step={PARAM_RANGES.volume.step} onChange={setVolume} formatValue={formatDb} size={48} />
      </Section>
    </>
  );
}
