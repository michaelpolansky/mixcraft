/**
 * Main Synthesizer View
 * Ableton Learning Synths-style centered layout with large interactive visualizations
 */

import { useEffect, useCallback } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import {
  Knob,
  Slider,
  WaveformSelector,
  FilterTypeSelector,
  LFOWaveformSelector,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  OscillatorVisualizer,
  FilterVisualizer,
  EnvelopeVisualizer,
  LFOVisualizer,
  EffectCard,
} from '../components/index.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';

// Module colors
const COLORS = {
  oscillator: '#3b82f6',
  filter: '#06b6d4',
  ampEnvelope: '#22c55e',
  filterEnvelope: '#eab308',
  lfo: '#ef4444',
  effects: '#8b5cf6',
  output: '#f97316',
};

export function SynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setOscillatorType,
    setOctave,
    setDetune,
    setFilterType,
    setFilterCutoff,
    setFilterResonance,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
    setFilterEnvelopeAttack,
    setFilterEnvelopeDecay,
    setFilterEnvelopeSustain,
    setFilterEnvelopeRelease,
    setFilterEnvelopeAmount,
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setDistortionAmount,
    setDistortionMix,
    setDelayTime,
    setDelayFeedback,
    setDelayMix,
    setReverbDecay,
    setReverbMix,
    setChorusRate,
    setChorusDepth,
    setChorusMix,
    setVolume,
    resetToDefaults,
    currentPreset,
    loadPreset,
  } = useSynthStore();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start (requires user gesture)
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Format helpers
  const formatHz = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${Math.round(value)}`;
  };

  const formatMs = (value: number) => {
    if (value >= 1) {
      return `${value.toFixed(2)}s`;
    }
    return `${Math.round(value * 1000)}ms`;
  };

  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  const formatOctave = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
  const formatCents = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  // Not initialized - show start button
  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#4ade80' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Subtractive Synthesizer
        </p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Start Audio Engine
        </button>
        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Click to enable audio (browser requirement)
        </p>
      </div>
    );
  }

  return (
    <InfoPanelProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Centered content column */}
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '24px 20px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 300, margin: 0, color: '#4ade80' }}>
                MIXCRAFT
              </h1>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Subtractive Synthesizer
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <PresetDropdown
                presets={SUBTRACTIVE_PRESETS}
                currentPreset={currentPreset}
                onSelect={loadPreset}
                accentColor="#4ade80"
              />
              <button
                onClick={resetToDefaults}
                style={{
                  padding: '8px 16px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Spectrum Analyzer - Always visible at top */}
          <div style={{ marginBottom: '32px' }}>
            <SpectrumAnalyzer width={600} height={120} barCount={80} />
          </div>

          {/* Oscillator Module */}
          <ModuleSection title="OSCILLATOR" color={COLORS.oscillator}>
            <OscillatorVisualizer
              waveform={params.oscillator.type}
              octave={params.oscillator.octave}
              detune={params.oscillator.detune}
              width={600}
              height={200}
              accentColor={COLORS.oscillator}
            />
            <div style={{ marginTop: '16px' }}>
              <WaveformSelector
                value={params.oscillator.type}
                onChange={setOscillatorType}
              />
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
                <Knob
                  label="Octave"
                  value={params.oscillator.octave}
                  min={PARAM_RANGES.octave.min}
                  max={PARAM_RANGES.octave.max}
                  step={PARAM_RANGES.octave.step}
                  onChange={setOctave}
                  formatValue={formatOctave}
                  paramId="oscillator.octave"
                />
                <Knob
                  label="Detune"
                  value={params.oscillator.detune}
                  min={PARAM_RANGES.detune.min}
                  max={PARAM_RANGES.detune.max}
                  step={PARAM_RANGES.detune.step}
                  onChange={setDetune}
                  formatValue={formatCents}
                  paramId="oscillator.detune"
                />
              </div>
            </div>
          </ModuleSection>

          {/* Filter Module */}
          <ModuleSection title="FILTER" color={COLORS.filter}>
            <FilterVisualizer
              filterType={params.filter.type}
              cutoff={params.filter.cutoff}
              resonance={params.filter.resonance}
              onCutoffChange={setFilterCutoff}
              onResonanceChange={setFilterResonance}
              width={600}
              height={250}
              accentColor={COLORS.filter}
            />
            <div style={{ marginTop: '16px' }}>
              <FilterTypeSelector
                value={params.filter.type}
                onChange={setFilterType}
              />
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
                <Knob
                  label="Cutoff"
                  value={params.filter.cutoff}
                  min={PARAM_RANGES.cutoff.min}
                  max={PARAM_RANGES.cutoff.max}
                  step={PARAM_RANGES.cutoff.step}
                  onChange={setFilterCutoff}
                  formatValue={formatHz}
                  logarithmic
                  paramId="filter.cutoff"
                />
                <Knob
                  label="Resonance"
                  value={params.filter.resonance}
                  min={PARAM_RANGES.resonance.min}
                  max={PARAM_RANGES.resonance.max}
                  step={PARAM_RANGES.resonance.step}
                  onChange={setFilterResonance}
                  formatValue={(v) => v.toFixed(1)}
                  paramId="filter.resonance"
                />
              </div>
            </div>
          </ModuleSection>

          {/* Amplitude Envelope Module */}
          <ModuleSection title="AMPLITUDE ENVELOPE" color={COLORS.ampEnvelope}>
            <EnvelopeVisualizer
              attack={params.amplitudeEnvelope.attack}
              decay={params.amplitudeEnvelope.decay}
              sustain={params.amplitudeEnvelope.sustain}
              release={params.amplitudeEnvelope.release}
              onAttackChange={setAmplitudeAttack}
              onDecayChange={setAmplitudeDecay}
              onSustainChange={setAmplitudeSustain}
              onReleaseChange={setAmplitudeRelease}
              width={600}
              height={200}
              accentColor={COLORS.ampEnvelope}
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
              <Slider
                label="Attack"
                value={params.amplitudeEnvelope.attack}
                min={PARAM_RANGES.attack.min}
                max={PARAM_RANGES.attack.max}
                step={PARAM_RANGES.attack.step}
                onChange={setAmplitudeAttack}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.attack"
              />
              <Slider
                label="Decay"
                value={params.amplitudeEnvelope.decay}
                min={PARAM_RANGES.decay.min}
                max={PARAM_RANGES.decay.max}
                step={PARAM_RANGES.decay.step}
                onChange={setAmplitudeDecay}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.decay"
              />
              <Slider
                label="Sustain"
                value={params.amplitudeEnvelope.sustain}
                min={PARAM_RANGES.sustain.min}
                max={PARAM_RANGES.sustain.max}
                step={PARAM_RANGES.sustain.step}
                onChange={setAmplitudeSustain}
                formatValue={formatPercent}
                paramId="amplitude.sustain"
              />
              <Slider
                label="Release"
                value={params.amplitudeEnvelope.release}
                min={PARAM_RANGES.release.min}
                max={PARAM_RANGES.release.max}
                step={PARAM_RANGES.release.step}
                onChange={setAmplitudeRelease}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.release"
              />
            </div>
          </ModuleSection>

          {/* Filter Envelope Module */}
          <ModuleSection title="FILTER ENVELOPE" color={COLORS.filterEnvelope}>
            <EnvelopeVisualizer
              attack={params.filterEnvelope.attack}
              decay={params.filterEnvelope.decay}
              sustain={params.filterEnvelope.sustain}
              release={params.filterEnvelope.release}
              onAttackChange={setFilterEnvelopeAttack}
              onDecayChange={setFilterEnvelopeDecay}
              onSustainChange={setFilterEnvelopeSustain}
              onReleaseChange={setFilterEnvelopeRelease}
              width={600}
              height={200}
              accentColor={COLORS.filterEnvelope}
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Knob
                label="Amount"
                value={params.filterEnvelope.amount}
                min={PARAM_RANGES.filterEnvAmount.min}
                max={PARAM_RANGES.filterEnvAmount.max}
                step={PARAM_RANGES.filterEnvAmount.step}
                onChange={setFilterEnvelopeAmount}
                formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} oct`}
                size={56}
                paramId="filterEnv.amount"
              />
              <Slider
                label="Attack"
                value={params.filterEnvelope.attack}
                min={PARAM_RANGES.attack.min}
                max={PARAM_RANGES.attack.max}
                step={PARAM_RANGES.attack.step}
                onChange={setFilterEnvelopeAttack}
                formatValue={formatMs}
                logarithmic
                paramId="filterEnv.attack"
              />
              <Slider
                label="Decay"
                value={params.filterEnvelope.decay}
                min={PARAM_RANGES.decay.min}
                max={PARAM_RANGES.decay.max}
                step={PARAM_RANGES.decay.step}
                onChange={setFilterEnvelopeDecay}
                formatValue={formatMs}
                logarithmic
                paramId="filterEnv.decay"
              />
              <Slider
                label="Sustain"
                value={params.filterEnvelope.sustain}
                min={PARAM_RANGES.sustain.min}
                max={PARAM_RANGES.sustain.max}
                step={PARAM_RANGES.sustain.step}
                onChange={setFilterEnvelopeSustain}
                formatValue={formatPercent}
                paramId="filterEnv.sustain"
              />
              <Slider
                label="Release"
                value={params.filterEnvelope.release}
                min={PARAM_RANGES.release.min}
                max={PARAM_RANGES.release.max}
                step={PARAM_RANGES.release.step}
                onChange={setFilterEnvelopeRelease}
                formatValue={formatMs}
                logarithmic
                paramId="filterEnv.release"
              />
            </div>
          </ModuleSection>

          {/* LFO Module */}
          <ModuleSection title="LFO" color={COLORS.lfo}>
            <LFOVisualizer
              waveform={params.lfo.waveform}
              rate={params.lfo.rate}
              depth={params.lfo.depth}
              width={600}
              height={180}
              accentColor={COLORS.lfo}
            />
            <div style={{ marginTop: '16px' }}>
              <LFOWaveformSelector
                value={params.lfo.waveform}
                onChange={setLFOWaveform}
              />
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
                <Knob
                  label="Rate"
                  value={params.lfo.rate}
                  min={PARAM_RANGES.lfoRate.min}
                  max={PARAM_RANGES.lfoRate.max}
                  step={PARAM_RANGES.lfoRate.step}
                  onChange={setLFORate}
                  formatValue={(v) => `${v.toFixed(1)}Hz`}
                  paramId="lfo.rate"
                />
                <Knob
                  label="Depth"
                  value={params.lfo.depth}
                  min={PARAM_RANGES.lfoDepth.min}
                  max={PARAM_RANGES.lfoDepth.max}
                  step={PARAM_RANGES.lfoDepth.step}
                  onChange={setLFODepth}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  paramId="lfo.depth"
                />
              </div>
            </div>
          </ModuleSection>

          {/* Effects Module */}
          <ModuleSection title="EFFECTS" color={COLORS.effects}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <EffectCard
                type="distortion"
                mix={params.effects.distortion.mix}
                param1={params.effects.distortion.amount}
                width={290}
                height={150}
              />
              <EffectCard
                type="delay"
                mix={params.effects.delay.mix}
                param1={params.effects.delay.time}
                param2={params.effects.delay.feedback}
                width={290}
                height={150}
              />
              <EffectCard
                type="reverb"
                mix={params.effects.reverb.mix}
                param1={params.effects.reverb.decay}
                width={290}
                height={150}
              />
              <EffectCard
                type="chorus"
                mix={params.effects.chorus.mix}
                param1={params.effects.chorus.rate}
                param2={params.effects.chorus.depth}
                width={290}
                height={150}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              {/* Distortion Controls */}
              <div>
                <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px', fontWeight: 600 }}>DISTORTION</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Knob label="Amount" value={params.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setDistortionAmount} formatValue={formatPercent} size={48} paramId="distortion.amount" />
                  <Knob label="Mix" value={params.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setDistortionMix} formatValue={formatPercent} size={48} paramId="distortion.mix" />
                </div>
              </div>
              {/* Delay Controls */}
              <div>
                <div style={{ fontSize: '11px', color: '#3b82f6', marginBottom: '8px', fontWeight: 600 }}>DELAY</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Time" value={params.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={44} paramId="delay.time" />
                  <Knob label="FB" value={params.effects.delay.feedback} min={PARAM_RANGES.delayFeedback.min} max={PARAM_RANGES.delayFeedback.max} step={PARAM_RANGES.delayFeedback.step} onChange={setDelayFeedback} formatValue={formatPercent} size={44} paramId="delay.feedback" />
                  <Knob label="Mix" value={params.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setDelayMix} formatValue={formatPercent} size={44} paramId="delay.mix" />
                </div>
              </div>
              {/* Reverb Controls */}
              <div>
                <div style={{ fontSize: '11px', color: '#8b5cf6', marginBottom: '8px', fontWeight: 600 }}>REVERB</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Knob label="Decay" value={params.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={48} paramId="reverb.decay" />
                  <Knob label="Mix" value={params.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setReverbMix} formatValue={formatPercent} size={48} paramId="reverb.mix" />
                </div>
              </div>
              {/* Chorus Controls */}
              <div>
                <div style={{ fontSize: '11px', color: '#06b6d4', marginBottom: '8px', fontWeight: 600 }}>CHORUS</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Rate" value={params.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={44} paramId="chorus.rate" />
                  <Knob label="Depth" value={params.effects.chorus.depth} min={PARAM_RANGES.chorusDepth.min} max={PARAM_RANGES.chorusDepth.max} step={PARAM_RANGES.chorusDepth.step} onChange={setChorusDepth} formatValue={formatPercent} size={44} paramId="chorus.depth" />
                  <Knob label="Mix" value={params.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setChorusMix} formatValue={formatPercent} size={44} paramId="chorus.mix" />
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* Output & Recording */}
          <ModuleSection title="OUTPUT" color={COLORS.output}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
              <Knob
                label="Volume"
                value={params.volume}
                min={PARAM_RANGES.volume.min}
                max={PARAM_RANGES.volume.max}
                step={PARAM_RANGES.volume.step}
                onChange={setVolume}
                formatValue={formatDb}
                size={64}
                paramId="volume"
              />
              <RecordingControl
                sourceNode={engine?.getOutputNode() ?? null}
                accentColor="#ef4444"
              />
            </div>
          </ModuleSection>

          {/* Sequencer */}
          <ModuleSection title="SEQUENCER" color="#4ade80">
            <Sequencer
              engine={engine}
              accentColor="#4ade80"
            />
          </ModuleSection>

          {/* Keyboard - sticky at bottom */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: '#0a0a0f',
              paddingTop: '16px',
              paddingBottom: '24px',
              marginTop: '32px',
            }}
          >
            <PianoKeyboard
              onNoteOn={playNote}
              onNoteOff={stopNote}
              octave={4}
              octaves={2}
            />
          </div>
        </div>

        <InfoPanel />
      </div>
    </InfoPanelProvider>
  );
}

// Simple module section wrapper
function ModuleSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: color,
          letterSpacing: '0.5px',
          marginBottom: '16px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
