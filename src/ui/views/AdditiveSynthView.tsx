/**
 * Additive Synthesizer View
 * Ableton Learning Synths-style centered layout with large interactive visualizations
 */

import { useEffect, useCallback } from 'react';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
import {
  Knob,
  Slider,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  HarmonicBarsVisualizer,
  EnvelopeVisualizer,
} from '../components/index.ts';
import { ADDITIVE_PRESETS } from '../../data/presets/additive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';

// Module colors
const COLORS = {
  harmonics: '#06b6d4',
  envelope: '#22c55e',
  effects: '#8b5cf6',
  output: '#ef4444',
};

export function AdditiveSynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setHarmonic,
    applyPreset,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
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
  } = useAdditiveSynthStore();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start (requires user gesture)
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Handle first interaction for Web Audio API
  const handleFirstInteraction = useCallback(async () => {
    if (!isInitialized) {
      await startAudio();
    }
  }, [isInitialized, startAudio]);

  // Note handlers
  const handleNoteOn = useCallback(
    async (note: string) => {
      await handleFirstInteraction();
      playNote(note);
    },
    [handleFirstInteraction, playNote]
  );

  const handleNoteOff = useCallback(() => {
    stopNote();
  }, [stopNote]);

  // Get analyser for spectrum visualization
  const getAnalyser = useCallback(() => {
    return engine?.getAnalyser() ?? null;
  }, [engine]);

  // Format helpers
  const formatMs = (value: number) => {
    if (value >= 1) return `${value.toFixed(2)}s`;
    return `${Math.round(value * 1000)}ms`;
  };
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // Harmonic presets matching AdditivePreset type
  const HARMONIC_PRESETS = [
    { label: 'Saw', key: 'saw' as const },
    { label: 'Square', key: 'square' as const },
    { label: 'Triangle', key: 'triangle' as const },
    { label: 'Organ', key: 'organ' as const },
  ];

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
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#06b6d4' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Additive Synthesizer
        </p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #06b6d4, #0891b2)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
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
              <h1 style={{ fontSize: '24px', fontWeight: 300, margin: 0, color: '#06b6d4' }}>
                MIXCRAFT
              </h1>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Additive Synthesizer
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <PresetDropdown
                presets={ADDITIVE_PRESETS}
                currentPreset={currentPreset}
                onSelect={loadPreset}
                accentColor="#06b6d4"
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

          {/* Spectrum Analyzer */}
          <div style={{ marginBottom: '32px' }}>
            <SpectrumAnalyzer
              getAnalyser={getAnalyser}
              width={600}
              height={120}
              barCount={80}
            />
          </div>

          {/* Harmonics Module */}
          <ModuleSection title="HARMONICS" color={COLORS.harmonics}>
            <HarmonicBarsVisualizer
              harmonics={params.harmonics}
              onHarmonicChange={setHarmonic}
              width={600}
              height={250}
              accentColor={COLORS.harmonics}
            />

            {/* Harmonic Presets */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>QUICK PRESETS</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {HARMONIC_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    style={{
                      padding: '6px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = COLORS.harmonics;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.color = '#888';
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </ModuleSection>

          {/* Amplitude Envelope Module */}
          <ModuleSection title="AMPLITUDE ENVELOPE" color={COLORS.envelope}>
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
              accentColor={COLORS.envelope}
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
              <Slider
                label="Attack"
                value={params.amplitudeEnvelope.attack}
                min={0.001}
                max={2}
                step={0.001}
                onChange={setAmplitudeAttack}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.attack"
              />
              <Slider
                label="Decay"
                value={params.amplitudeEnvelope.decay}
                min={0.001}
                max={2}
                step={0.001}
                onChange={setAmplitudeDecay}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.decay"
              />
              <Slider
                label="Sustain"
                value={params.amplitudeEnvelope.sustain}
                min={0}
                max={1}
                step={0.01}
                onChange={setAmplitudeSustain}
                formatValue={formatPercent}
                paramId="amplitude.sustain"
              />
              <Slider
                label="Release"
                value={params.amplitudeEnvelope.release}
                min={0.001}
                max={4}
                step={0.001}
                onChange={setAmplitudeRelease}
                formatValue={formatMs}
                logarithmic
                paramId="amplitude.release"
              />
            </div>
          </ModuleSection>

          {/* Effects Module */}
          <ModuleSection title="EFFECTS" color={COLORS.effects}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Distortion */}
              <EffectGroup title="DISTORTION">
                <Knob
                  label="Amount"
                  value={params.effects.distortion.amount}
                  min={PARAM_RANGES.distortionAmount.min}
                  max={PARAM_RANGES.distortionAmount.max}
                  step={PARAM_RANGES.distortionAmount.step}
                  onChange={setDistortionAmount}
                  formatValue={formatPercent}
                  size={48}
                  paramId="distortion.amount"
                />
                <Knob
                  label="Mix"
                  value={params.effects.distortion.mix}
                  min={PARAM_RANGES.distortionMix.min}
                  max={PARAM_RANGES.distortionMix.max}
                  step={PARAM_RANGES.distortionMix.step}
                  onChange={setDistortionMix}
                  formatValue={formatPercent}
                  size={48}
                  paramId="distortion.mix"
                />
              </EffectGroup>

              {/* Delay */}
              <EffectGroup title="DELAY">
                <Knob
                  label="Time"
                  value={params.effects.delay.time}
                  min={PARAM_RANGES.delayTime.min}
                  max={PARAM_RANGES.delayTime.max}
                  step={PARAM_RANGES.delayTime.step}
                  onChange={setDelayTime}
                  formatValue={(v) => `${Math.round(v * 1000)}ms`}
                  size={48}
                  paramId="delay.time"
                />
                <Knob
                  label="Feedback"
                  value={params.effects.delay.feedback}
                  min={PARAM_RANGES.delayFeedback.min}
                  max={PARAM_RANGES.delayFeedback.max}
                  step={PARAM_RANGES.delayFeedback.step}
                  onChange={setDelayFeedback}
                  formatValue={formatPercent}
                  size={48}
                  paramId="delay.feedback"
                />
                <Knob
                  label="Mix"
                  value={params.effects.delay.mix}
                  min={PARAM_RANGES.delayMix.min}
                  max={PARAM_RANGES.delayMix.max}
                  step={PARAM_RANGES.delayMix.step}
                  onChange={setDelayMix}
                  formatValue={formatPercent}
                  size={48}
                  paramId="delay.mix"
                />
              </EffectGroup>

              {/* Reverb */}
              <EffectGroup title="REVERB">
                <Knob
                  label="Decay"
                  value={params.effects.reverb.decay}
                  min={PARAM_RANGES.reverbDecay.min}
                  max={PARAM_RANGES.reverbDecay.max}
                  step={PARAM_RANGES.reverbDecay.step}
                  onChange={setReverbDecay}
                  formatValue={(v) => `${v.toFixed(1)}s`}
                  size={48}
                  paramId="reverb.decay"
                />
                <Knob
                  label="Mix"
                  value={params.effects.reverb.mix}
                  min={PARAM_RANGES.reverbMix.min}
                  max={PARAM_RANGES.reverbMix.max}
                  step={PARAM_RANGES.reverbMix.step}
                  onChange={setReverbMix}
                  formatValue={formatPercent}
                  size={48}
                  paramId="reverb.mix"
                />
              </EffectGroup>

              {/* Chorus */}
              <EffectGroup title="CHORUS">
                <Knob
                  label="Rate"
                  value={params.effects.chorus.rate}
                  min={PARAM_RANGES.chorusRate.min}
                  max={PARAM_RANGES.chorusRate.max}
                  step={PARAM_RANGES.chorusRate.step}
                  onChange={setChorusRate}
                  formatValue={(v) => `${v.toFixed(1)}Hz`}
                  size={48}
                  paramId="chorus.rate"
                />
                <Knob
                  label="Depth"
                  value={params.effects.chorus.depth}
                  min={PARAM_RANGES.chorusDepth.min}
                  max={PARAM_RANGES.chorusDepth.max}
                  step={PARAM_RANGES.chorusDepth.step}
                  onChange={setChorusDepth}
                  formatValue={formatPercent}
                  size={48}
                  paramId="chorus.depth"
                />
                <Knob
                  label="Mix"
                  value={params.effects.chorus.mix}
                  min={PARAM_RANGES.chorusMix.min}
                  max={PARAM_RANGES.chorusMix.max}
                  step={PARAM_RANGES.chorusMix.step}
                  onChange={setChorusMix}
                  formatValue={formatPercent}
                  size={48}
                  paramId="chorus.mix"
                />
              </EffectGroup>
            </div>
          </ModuleSection>

          {/* Output & Recording */}
          <ModuleSection title="OUTPUT" color={COLORS.output}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
              <Knob
                label="Volume"
                value={params.volume}
                min={-40}
                max={0}
                step={0.5}
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
          <ModuleSection title="SEQUENCER" color="#06b6d4">
            <Sequencer
              engine={engine}
              accentColor="#06b6d4"
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
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
              octave={3}
              octaves={3}
            />
          </div>
        </div>

        <InfoPanel accentColor="#06b6d4" />
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

// Effect group wrapper
function EffectGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#666', marginBottom: '12px', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
