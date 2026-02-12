/**
 * Subtractive synth sections with progressive control visibility
 * Used in ChallengeView for SD1-SD17 challenges
 */

import {
  Knob,
  Slider,
  WaveformSelector,
  FilterTypeSelector,
  LFOWaveformSelector,
  EnvelopeDisplay,
} from '../index.ts';
import { Section } from './Section.tsx';
import { isControlVisible, isSectionVisible } from '../../../data/module-controls.ts';
import { PARAM_RANGES } from '../../../core/types.ts';
import type { SynthParams, SynthAvailableControls, OscillatorType, FilterType, LFOWaveform } from '../../../core/types.ts';
import { formatHz, formatMs, formatPercent, formatDb, formatOctave, formatCents } from '../../utils/formatters.ts';

interface SubtractiveSectionsProps {
  params: SynthParams;
  controls: SynthAvailableControls;
  setOscillatorType: (v: OscillatorType) => void;
  setOctave: (v: number) => void;
  setDetune: (v: number) => void;
  setFilterType: (v: FilterType) => void;
  setFilterCutoff: (v: number) => void;
  setFilterResonance: (v: number) => void;
  setAmplitudeAttack: (v: number) => void;
  setAmplitudeDecay: (v: number) => void;
  setAmplitudeSustain: (v: number) => void;
  setAmplitudeRelease: (v: number) => void;
  setFilterEnvelopeAttack: (v: number) => void;
  setFilterEnvelopeDecay: (v: number) => void;
  setFilterEnvelopeSustain: (v: number) => void;
  setFilterEnvelopeRelease: (v: number) => void;
  setFilterEnvelopeAmount: (v: number) => void;
  setLFORate: (v: number) => void;
  setLFODepth: (v: number) => void;
  setLFOWaveform: (v: LFOWaveform) => void;
  setDistortionAmount: (v: number) => void;
  setDistortionMix: (v: number) => void;
  setDelayTime: (v: number) => void;
  setDelayFeedback: (v: number) => void;
  setDelayMix: (v: number) => void;
  setReverbDecay: (v: number) => void;
  setReverbMix: (v: number) => void;
  setChorusRate: (v: number) => void;
  setChorusDepth: (v: number) => void;
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

export function SubtractiveSections({ params, controls, ...actions }: SubtractiveSectionsProps) {
  return (
    <>
      {isSectionVisible(controls.oscillator) && (
        <Section title="Oscillator">
          {isControlVisible(controls.oscillator, 'waveform') && <WaveformSelector value={params.oscillator.type} onChange={actions.setOscillatorType} accentColor="#3b82f6" />}
          <div className="flex gap-6 mt-4">
            {isControlVisible(controls.oscillator, 'octave') && <Knob label="Octave" value={params.oscillator.octave} min={PARAM_RANGES.octave.min} max={PARAM_RANGES.octave.max} step={PARAM_RANGES.octave.step} onChange={actions.setOctave} formatValue={formatOctave} paramId="oscillator.octave" />}
            {isControlVisible(controls.oscillator, 'detune') && <Knob label="Detune" value={params.oscillator.detune} min={PARAM_RANGES.detune.min} max={PARAM_RANGES.detune.max} step={PARAM_RANGES.detune.step} onChange={actions.setDetune} formatValue={formatCents} paramId="oscillator.detune" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.filter) && (
        <Section title="Filter">
          {isControlVisible(controls.filter, 'type') && <FilterTypeSelector value={params.filter.type} onChange={actions.setFilterType} />}
          <div className="flex gap-6 mt-4">
            {isControlVisible(controls.filter, 'cutoff') && <Knob label="Cutoff" value={params.filter.cutoff} min={PARAM_RANGES.cutoff.min} max={PARAM_RANGES.cutoff.max} onChange={actions.setFilterCutoff} formatValue={formatHz} logarithmic paramId="filter.cutoff" />}
            {isControlVisible(controls.filter, 'resonance') && <Knob label="Resonance" value={params.filter.resonance} min={PARAM_RANGES.resonance.min} max={PARAM_RANGES.resonance.max} step={PARAM_RANGES.resonance.step} onChange={actions.setFilterResonance} formatValue={(v) => v.toFixed(1)} paramId="filter.resonance" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.amplitudeEnvelope) && (
        <Section title="Amplitude Envelope">
          <div className="flex gap-4 items-start">
            <EnvelopeDisplay envelope={params.amplitudeEnvelope} width={120} height={60} />
            <div className="flex gap-3">
              {isControlVisible(controls.amplitudeEnvelope, 'attack') && <Slider label="A" value={params.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={actions.setAmplitudeAttack} formatValue={formatMs} logarithmic height={80} paramId="amplitude.attack" />}
              {isControlVisible(controls.amplitudeEnvelope, 'decay') && <Slider label="D" value={params.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={actions.setAmplitudeDecay} formatValue={formatMs} logarithmic height={80} paramId="amplitude.decay" />}
              {isControlVisible(controls.amplitudeEnvelope, 'sustain') && <Slider label="S" value={params.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={actions.setAmplitudeSustain} formatValue={formatPercent} height={80} paramId="amplitude.sustain" />}
              {isControlVisible(controls.amplitudeEnvelope, 'release') && <Slider label="R" value={params.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={actions.setAmplitudeRelease} formatValue={formatMs} logarithmic height={80} paramId="amplitude.release" />}
            </div>
          </div>
        </Section>
      )}
      {isSectionVisible(controls.filterEnvelope) && (
        <Section title="Filter Envelope">
          <div className="flex gap-4 items-start">
            <div>
              <EnvelopeDisplay envelope={params.filterEnvelope} width={120} height={60} color="#3b82f6" />
              {isControlVisible(controls.filterEnvelope, 'amount') && <div className="mt-2">
                <Knob label="Amount" value={params.filterEnvelope.amount} min={PARAM_RANGES.filterEnvAmount.min} max={PARAM_RANGES.filterEnvAmount.max} step={PARAM_RANGES.filterEnvAmount.step} onChange={actions.setFilterEnvelopeAmount} formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} size={40} paramId="filterEnv.amount" />
              </div>}
            </div>
            <div className="flex gap-3">
              {isControlVisible(controls.filterEnvelope, 'attack') && <Slider label="A" value={params.filterEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={actions.setFilterEnvelopeAttack} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.attack" />}
              {isControlVisible(controls.filterEnvelope, 'decay') && <Slider label="D" value={params.filterEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={actions.setFilterEnvelopeDecay} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.decay" />}
              {isControlVisible(controls.filterEnvelope, 'sustain') && <Slider label="S" value={params.filterEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={actions.setFilterEnvelopeSustain} formatValue={formatPercent} height={80} paramId="filterEnv.sustain" />}
              {isControlVisible(controls.filterEnvelope, 'release') && <Slider label="R" value={params.filterEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={actions.setFilterEnvelopeRelease} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.release" />}
            </div>
          </div>
        </Section>
      )}
      {isSectionVisible(controls.lfo) && (
        <Section title="LFO (Filter Modulation)">
          {isControlVisible(controls.lfo, 'waveform') && <LFOWaveformSelector value={params.lfo.waveform} onChange={actions.setLFOWaveform} compact />}
          <div className="flex gap-6 mt-3">
            {isControlVisible(controls.lfo, 'rate') && <Knob label="Rate" value={params.lfo.rate} min={PARAM_RANGES.lfoRate.min} max={PARAM_RANGES.lfoRate.max} step={PARAM_RANGES.lfoRate.step} onChange={actions.setLFORate} formatValue={(v) => `${v.toFixed(1)}Hz`} paramId="lfo.rate" />}
            {isControlVisible(controls.lfo, 'depth') && <Knob label="Depth" value={params.lfo.depth} min={PARAM_RANGES.lfoDepth.min} max={PARAM_RANGES.lfoDepth.max} step={PARAM_RANGES.lfoDepth.step} onChange={actions.setLFODepth} formatValue={formatPercent} paramId="lfo.depth" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.effects) && (
        <Section title="Effects">
          <div className="grid grid-cols-2 gap-4">
            {isControlVisible(controls.effects, 'distortion') && <EffectBlock label="Distortion" knobs={[
              { label: 'Amt', value: params.effects.distortion.amount, range: PARAM_RANGES.distortionAmount, onChange: actions.setDistortionAmount, format: formatPercent },
              { label: 'Mix', value: params.effects.distortion.mix, range: PARAM_RANGES.distortionMix, onChange: actions.setDistortionMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'delay') && <EffectBlock label="Delay" knobs={[
              { label: 'Time', value: params.effects.delay.time, range: PARAM_RANGES.delayTime, onChange: actions.setDelayTime, format: (v) => `${Math.round(v * 1000)}ms` },
              { label: 'Mix', value: params.effects.delay.mix, range: PARAM_RANGES.delayMix, onChange: actions.setDelayMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'reverb') && <EffectBlock label="Reverb" knobs={[
              { label: 'Decay', value: params.effects.reverb.decay, range: PARAM_RANGES.reverbDecay, onChange: actions.setReverbDecay, format: (v) => `${v.toFixed(1)}s` },
              { label: 'Mix', value: params.effects.reverb.mix, range: PARAM_RANGES.reverbMix, onChange: actions.setReverbMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'chorus') && <EffectBlock label="Chorus" knobs={[
              { label: 'Rate', value: params.effects.chorus.rate, range: PARAM_RANGES.chorusRate, onChange: actions.setChorusRate, format: (v) => `${v.toFixed(1)}Hz` },
              { label: 'Mix', value: params.effects.chorus.mix, range: PARAM_RANGES.chorusMix, onChange: actions.setChorusMix, format: formatPercent },
            ]} />}
          </div>
        </Section>
      )}
      {controls.output !== false && (
        <Section title="Output">
          <Knob label="Volume" value={params.volume} min={PARAM_RANGES.volume.min} max={PARAM_RANGES.volume.max} step={PARAM_RANGES.volume.step} onChange={actions.setVolume} formatValue={formatDb} size={48} />
        </Section>
      )}
    </>
  );
}
