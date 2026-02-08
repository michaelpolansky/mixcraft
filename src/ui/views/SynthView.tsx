/**
 * Main Synthesizer View
 * Horizontal signal-flow layout: OSC → FILTER → AMP → MOD → FX → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import { useModulatedValues } from '../hooks/useModulatedValues.ts';
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
  XYPad,
  Oscilloscope,
  Tooltip,
} from '../components/index.ts';
import type { LFOSyncDivision, LFOWaveform, NoiseType, OscillatorType, ModSource, ModDestination } from '../../core/types.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';
import { InfoPanelProvider, useInfoPanel } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';

// Stage colors following signal flow
const COLORS = {
  oscillator: '#3b82f6',
  subOsc: '#1e40af',   // Darker blue for sub oscillator
  osc2: '#60a5fa',     // Lighter blue for oscillator 2
  noise: '#64748b',    // Slate gray for noise
  filter: '#06b6d4',
  amp: '#22c55e',
  filterEnv: '#eab308',
  lfo: '#ef4444',
  lfo2: '#dc2626',     // Deeper red for LFO 2
  velocity: '#fb923c', // Orange for velocity
  pitchEnv: '#f472b6', // Pink for pitch envelope
  modEnv: '#a855f7',   // Purple for mod envelope
  pwmEnv: '#14b8a6',   // Teal for PWM envelope
  effects: '#8b5cf6',
  output: '#f97316',
  modMatrix: '#a855f7', // Purple for mod matrix
};

// LFO sync division options
const LFO_SYNC_DIVISIONS = [
  { value: '1n' as const, label: '1' },
  { value: '2n' as const, label: '1/2' },
  { value: '4n' as const, label: '1/4' },
  { value: '8n' as const, label: '1/8' },
  { value: '16n' as const, label: '1/16' },
  { value: '32n' as const, label: '1/32' },
];

// Noise type options
const NOISE_TYPES = [
  { value: 'white' as const, label: 'White' },
  { value: 'pink' as const, label: 'Pink' },
  { value: 'brown' as const, label: 'Brown' },
];

export function SynthView() {
  const {
    params,
    engine,
    isInitialized,
    isInitializing,
    initError,
    isPlaying,
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
    setPitchEnvelopeAttack,
    setPitchEnvelopeDecay,
    setPitchEnvelopeSustain,
    setPitchEnvelopeRelease,
    setPitchEnvelopeAmount,
    setModEnvelopeAttack,
    setModEnvelopeDecay,
    setModEnvelopeSustain,
    setModEnvelopeRelease,
    setModEnvelopeAmount,
    setPWMEnvelopeAttack,
    setPWMEnvelopeDecay,
    setPWMEnvelopeSustain,
    setPWMEnvelopeRelease,
    setPWMEnvelopeAmount,
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
    setNoiseType,
    setNoiseLevel,
    setGlideEnabled,
    setGlideTime,
    setLFOSync,
    setLFOSyncDivision,
    setPulseWidth,
    setFilterKeyTracking,
    setVelocityAmpAmount,
    setVelocityFilterAmount,
    randomize,
    setSubOscEnabled,
    setSubOscType,
    setSubOscOctave,
    setSubOscLevel,
    setOsc2Enabled,
    setOsc2Type,
    setOsc2Octave,
    setOsc2Detune,
    setOsc2Mix,
    setLfo2Rate,
    setLfo2Depth,
    setLfo2Type,
    setLfo2Enabled,
    setPan,
    setModRouteSource,
    setModRouteDestination,
    setModRouteAmount,
    setModRouteEnabled,
  } = useSynthStore();

  // Bottom strip state: 'keys' or 'xy'
  const [bottomMode, setBottomMode] = useState<'keys' | 'xy'>('keys');
  const [bottomExpanded, setBottomExpanded] = useState(false);

  // Real-time modulated values for UI display
  const modulatedValues = useModulatedValues();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Format helpers
  const formatHz = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`;
  const formatMs = (value: number) => value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // XY Pad handlers - maps to Filter Cutoff (X) and Resonance (Y)
  const xRange: [number, number] = [PARAM_RANGES.cutoff.min, PARAM_RANGES.cutoff.max];
  const yRange: [number, number] = [PARAM_RANGES.resonance.min, PARAM_RANGES.resonance.max];

  const normalizeValue = (value: number, min: number, max: number) => (value - min) / (max - min);
  const denormalizeValue = (normalized: number, min: number, max: number) => min + normalized * (max - min);

  // Not initialized - show start button
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#4ade80' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Subtractive Synthesizer</p>
        <button
          onClick={handleStartAudio}
          disabled={isInitializing}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: isInitializing
              ? 'linear-gradient(145deg, #166534, #14532d)'
              : 'linear-gradient(145deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: isInitializing ? 'wait' : 'pointer',
            fontWeight: 600,
            boxShadow: isInitializing
              ? '0 4px 12px rgba(34, 197, 94, 0.15)'
              : '0 4px 12px rgba(34, 197, 94, 0.3)',
            opacity: isInitializing ? 0.8 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {isInitializing ? 'Starting Audio...' : 'Start Audio Engine'}
        </button>
        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Click to enable audio (browser requirement)
        </p>
        {initError && (
          <div style={{
            marginTop: '24px',
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '13px',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            {initError}
          </div>
        )}
      </div>
    );
  }

  return (
    <InfoPanelProvider>
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          paddingLeft: '120px', // Room for fixed menu button
          borderBottom: '1px solid #1a1a1a',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 300, margin: 0, color: '#4ade80' }}>
              MIXCRAFT
            </h1>
            <span style={{ fontSize: '11px', color: '#666' }}>Subtractive Synthesizer</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PresetDropdown
              presets={SUBTRACTIVE_PRESETS}
              currentPreset={currentPreset}
              onSelect={loadPreset}
              accentColor="#4ade80"
            />
            <button
              onClick={randomize}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(145deg, #8b5cf6, #7c3aed)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Randomize
            </button>
            <button
              onClick={resetToDefaults}
              style={{
                padding: '6px 12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Reset
            </button>
            <HelpModeButton />
          </div>
        </div>

        {/* Floating tooltip (shows when Help Mode is ON) */}
        <Tooltip accentColor="#4ade80" />

        {/* Spectrum Analyzer */}
        <div style={{ padding: '12px 24px', background: '#050508' }}>
          <SpectrumAnalyzer width={window.innerWidth - 48} height={80} barCount={100} />
        </div>

        {/* Signal Flow - Horizontal flex wrap with stacked modules */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'flex-start',
          overflow: 'auto',
        }}>
          {/* OSC Stack: OSC + PITCH ENV + PWM ENV */}
          <StackedModule>
          <StageCard title="OSC" color={COLORS.oscillator} noBorderRadius="bottom">
            <OscillatorVisualizer
              waveform={params.oscillator.type}
              octave={params.oscillator.octave}
              detune={params.oscillator.detune}
              width={200}
              height={120}
              accentColor={COLORS.oscillator}
              compact
            />
            <div style={{ marginTop: '12px' }}>
              <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              <Knob label="Oct" value={params.oscillator.octave} min={-2} max={2} step={1} onChange={setOctave} formatValue={(v) => v >= 0 ? `+${v}` : `${v}`} size={40} paramId="oscillator.octave" />
              <Knob label="Detune" value={params.oscillator.detune} min={-100} max={100} step={1} onChange={setDetune} formatValue={(v) => `${v}`} size={40} paramId="oscillator.detune" />
              {params.oscillator.type === 'square' && (
                <Knob label="PW" value={params.oscillator.pulseWidth} min={0.1} max={0.9} step={0.01} onChange={setPulseWidth} formatValue={(v) => `${Math.round(v * 100)}%`} size={40} paramId="oscillator.pulseWidth" />
              )}
            </div>
            {/* Glide controls */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #222' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <button
                  onClick={() => setGlideEnabled(!params.glide.enabled)}
                  style={{
                    padding: '4px 8px',
                    background: params.glide.enabled ? COLORS.oscillator : '#222',
                    border: `1px solid ${params.glide.enabled ? COLORS.oscillator : '#444'}`,
                    borderRadius: '4px',
                    color: params.glide.enabled ? '#fff' : '#888',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  GLIDE
                </button>
                {params.glide.enabled && (
                  <Knob
                    label="Time"
                    value={params.glide.time}
                    min={0.01}
                    max={1}
                    step={0.01}
                    onChange={setGlideTime}
                    formatValue={(v) => `${Math.round(v * 1000)}ms`}
                    size={32}
                    paramId="glide.time"
                  />
                )}
              </div>
            </div>
          </StageCard>

          {/* PITCH ENV - stacked below OSC */}
          <StageCard title="PITCH ENV" color={COLORS.pitchEnv} compact noBorderRadius="both">
            <EnvelopeVisualizer
              attack={params.pitchEnvelope.attack}
              decay={params.pitchEnvelope.decay}
              sustain={params.pitchEnvelope.sustain}
              release={params.pitchEnvelope.release}
              onAttackChange={setPitchEnvelopeAttack}
              onDecayChange={setPitchEnvelopeDecay}
              onSustainChange={setPitchEnvelopeSustain}
              onReleaseChange={setPitchEnvelopeRelease}
              width={200}
              height={60}
              accentColor={COLORS.pitchEnv}
              compact
              isTriggered={isPlaying}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <MiniSlider label="A" value={params.pitchEnvelope.attack} min={0.001} max={2} onChange={setPitchEnvelopeAttack} color={COLORS.pitchEnv} />
              <MiniSlider label="D" value={params.pitchEnvelope.decay} min={0.001} max={2} onChange={setPitchEnvelopeDecay} color={COLORS.pitchEnv} />
              <Knob label="Amt" value={params.pitchEnvelope.amount} min={-24} max={24} step={1} onChange={setPitchEnvelopeAmount} formatValue={(v) => `${v > 0 ? '+' : ''}${v}st`} size={32} paramId="pitchEnv.amount" />
            </div>
          </StageCard>

          {/* PWM ENV - stacked below PITCH ENV */}
          <StageCard title="PWM ENV" color={COLORS.pwmEnv} compact noBorderRadius="top">
            <EnvelopeVisualizer
              attack={params.pwmEnvelope.attack}
              decay={params.pwmEnvelope.decay}
              sustain={params.pwmEnvelope.sustain}
              release={params.pwmEnvelope.release}
              onAttackChange={setPWMEnvelopeAttack}
              onDecayChange={setPWMEnvelopeDecay}
              onSustainChange={setPWMEnvelopeSustain}
              onReleaseChange={setPWMEnvelopeRelease}
              width={200}
              height={60}
              accentColor={COLORS.pwmEnv}
              compact
              isTriggered={isPlaying}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <MiniSlider label="A" value={params.pwmEnvelope.attack} min={0.001} max={2} onChange={setPWMEnvelopeAttack} color={COLORS.pwmEnv} />
              <MiniSlider label="D" value={params.pwmEnvelope.decay} min={0.001} max={2} onChange={setPWMEnvelopeDecay} color={COLORS.pwmEnv} />
              <Knob label="Amt" value={params.pwmEnvelope.amount} min={0} max={1} step={0.01} onChange={setPWMEnvelopeAmount} formatValue={formatPercent} size={32} paramId="pwmEnv.amount" />
            </div>
            <div style={{ fontSize: '8px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
              Pulse width (square osc)
            </div>
          </StageCard>
          </StackedModule>

          {/* SUB OSC Stage */}
          <StageCard title="SUB OSC" color={COLORS.subOsc}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Enable toggle */}
              <button
                onClick={() => setSubOscEnabled(!params.subOsc.enabled)}
                style={{
                  padding: '6px 16px',
                  background: params.subOsc.enabled ? COLORS.subOsc : '#222',
                  border: `1px solid ${params.subOsc.enabled ? COLORS.subOsc : '#444'}`,
                  borderRadius: '4px',
                  color: params.subOsc.enabled ? '#fff' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {params.subOsc.enabled ? 'ON' : 'OFF'}
              </button>

              {params.subOsc.enabled && (
                <>
                  {/* Waveform visualizer */}
                  <OscillatorVisualizer
                    waveform={params.subOsc.type}
                    octave={params.subOsc.octave}
                    detune={0}
                    width={200}
                    height={100}
                    accentColor={COLORS.subOsc}
                    compact
                  />

                  {/* Type selector */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['sine', 'square'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSubOscType(t)}
                        style={{
                          padding: '6px 12px',
                          background: params.subOsc.type === t ? COLORS.subOsc : '#1a1a1a',
                          border: `1px solid ${params.subOsc.type === t ? COLORS.subOsc : '#333'}`,
                          borderRadius: '4px',
                          color: params.subOsc.type === t ? '#fff' : '#888',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Octave selector */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {([-1, -2] as const).map((oct) => (
                      <button
                        key={oct}
                        onClick={() => setSubOscOctave(oct)}
                        style={{
                          padding: '6px 12px',
                          background: params.subOsc.octave === oct ? COLORS.subOsc : '#1a1a1a',
                          border: `1px solid ${params.subOsc.octave === oct ? COLORS.subOsc : '#333'}`,
                          borderRadius: '4px',
                          color: params.subOsc.octave === oct ? '#fff' : '#888',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {oct} Oct
                      </button>
                    ))}
                  </div>

                  {/* Level knob */}
                  <Knob
                    label="Level"
                    value={params.subOsc.level}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setSubOscLevel}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                    size={48}
                    paramId="subOsc.level"
                  />
                </>
              )}

              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                Adds low-end weight
              </div>
            </div>
          </StageCard>

          {/* OSC 2 Stage */}
          <StageCard title="OSC 2" color={COLORS.osc2}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Enable toggle */}
              <button
                onClick={() => setOsc2Enabled(!params.oscillator2.enabled)}
                style={{
                  padding: '6px 16px',
                  background: params.oscillator2.enabled ? COLORS.osc2 : '#222',
                  border: `1px solid ${params.oscillator2.enabled ? COLORS.osc2 : '#444'}`,
                  borderRadius: '4px',
                  color: params.oscillator2.enabled ? '#000' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {params.oscillator2.enabled ? 'ON' : 'OFF'}
              </button>

              {params.oscillator2.enabled && (
                <>
                  {/* Waveform visualizer */}
                  <OscillatorVisualizer
                    waveform={params.oscillator2.type}
                    octave={params.oscillator2.octave}
                    detune={params.oscillator2.detune}
                    width={200}
                    height={100}
                    accentColor={COLORS.osc2}
                    compact
                  />

                  {/* Waveform selector */}
                  <WaveformSelector
                    value={params.oscillator2.type}
                    onChange={(t: OscillatorType) => setOsc2Type(t)}
                  />

                  {/* Control knobs */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Knob
                      label="Oct"
                      value={params.oscillator2.octave}
                      min={-2}
                      max={2}
                      step={1}
                      onChange={setOsc2Octave}
                      formatValue={(v) => v >= 0 ? `+${v}` : `${v}`}
                      size={36}
                      paramId="osc2.octave"
                    />
                    <Knob
                      label="Detune"
                      value={params.oscillator2.detune}
                      min={-100}
                      max={100}
                      step={1}
                      onChange={setOsc2Detune}
                      formatValue={(v) => `${v}`}
                      size={36}
                      paramId="osc2.detune"
                    />
                    <Knob
                      label="Mix"
                      value={params.oscillator2.mix}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={setOsc2Mix}
                      formatValue={(v) => `${Math.round(v * 100)}%`}
                      size={36}
                      paramId="osc2.mix"
                      modulatedValue={modulatedValues?.osc2Mix}
                    />
                  </div>
                </>
              )}

              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                Layered oscillator
              </div>
            </div>
          </StageCard>

          {/* NOISE Stage */}
          <StageCard title="NOISE" color={COLORS.noise}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Noise Type Selector */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {NOISE_TYPES.map((nt) => (
                  <button
                    key={nt.value}
                    onClick={() => setNoiseType(nt.value)}
                    style={{
                      padding: '6px 10px',
                      background: params.noise.type === nt.value ? COLORS.noise : '#1a1a1a',
                      border: `1px solid ${params.noise.type === nt.value ? COLORS.noise : '#333'}`,
                      borderRadius: '4px',
                      color: params.noise.type === nt.value ? '#fff' : '#888',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {nt.label}
                  </button>
                ))}
              </div>
              {/* Level Knob */}
              <Knob
                label="Level"
                value={params.noise.level}
                min={0}
                max={1}
                step={0.01}
                onChange={setNoiseLevel}
                formatValue={(v) => `${Math.round(v * 100)}%`}
                size={48}
                paramId="noise.level"
              />
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                Adds texture and transients
              </div>
            </div>
          </StageCard>

          {/* FILTER Stack: FILTER + FILTER ENV */}
          <StackedModule>
          <StageCard title="FILTER" color={COLORS.filter} noBorderRadius="bottom">
            <FilterVisualizer
              filterType={params.filter.type}
              cutoff={params.filter.cutoff}
              resonance={params.filter.resonance}
              onCutoffChange={setFilterCutoff}
              onResonanceChange={setFilterResonance}
              width={200}
              height={120}
              accentColor={COLORS.filter}
              compact
              modulatedCutoff={modulatedValues?.filterCutoff}
            />
            <div style={{ marginTop: '12px' }}>
              <FilterTypeSelector value={params.filter.type} onChange={setFilterType} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              <Knob label="Cutoff" value={params.filter.cutoff} min={PARAM_RANGES.cutoff.min} max={PARAM_RANGES.cutoff.max} step={1} onChange={setFilterCutoff} formatValue={formatHz} logarithmic size={40} paramId="filter.cutoff" modulatedValue={modulatedValues?.filterCutoff} />
              <Knob label="Res" value={params.filter.resonance} min={0} max={20} step={0.1} onChange={setFilterResonance} formatValue={(v) => v.toFixed(1)} size={40} paramId="filter.resonance" />
              <Knob label="Key" value={params.filter.keyTracking} min={0} max={1} step={0.01} onChange={setFilterKeyTracking} formatValue={formatPercent} size={40} paramId="filter.keyTracking" />
            </div>
          </StageCard>

          {/* FILTER ENV - stacked below FILTER */}
          <StageCard title="FILTER ENV" color={COLORS.filterEnv} compact noBorderRadius="top">
            <EnvelopeVisualizer
              attack={params.filterEnvelope.attack}
              decay={params.filterEnvelope.decay}
              sustain={params.filterEnvelope.sustain}
              release={params.filterEnvelope.release}
              onAttackChange={setFilterEnvelopeAttack}
              onDecayChange={setFilterEnvelopeDecay}
              onSustainChange={setFilterEnvelopeSustain}
              onReleaseChange={setFilterEnvelopeRelease}
              width={200}
              height={60}
              accentColor={COLORS.filterEnv}
              compact
              isTriggered={isPlaying}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <MiniSlider label="A" value={params.filterEnvelope.attack} min={0.001} max={2} onChange={setFilterEnvelopeAttack} color={COLORS.filterEnv} />
              <MiniSlider label="D" value={params.filterEnvelope.decay} min={0.001} max={2} onChange={setFilterEnvelopeDecay} color={COLORS.filterEnv} />
              <Knob label="Amt" value={params.filterEnvelope.amount} min={-4} max={4} step={0.1} onChange={setFilterEnvelopeAmount} formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} size={32} paramId="filterEnv.amount" />
            </div>
          </StageCard>
          </StackedModule>

          {/* AMP Stage */}
          <StageCard title="AMP" color={COLORS.amp}>
            <EnvelopeVisualizer
              attack={params.amplitudeEnvelope.attack}
              decay={params.amplitudeEnvelope.decay}
              sustain={params.amplitudeEnvelope.sustain}
              release={params.amplitudeEnvelope.release}
              onAttackChange={setAmplitudeAttack}
              onDecayChange={setAmplitudeDecay}
              onSustainChange={setAmplitudeSustain}
              onReleaseChange={setAmplitudeRelease}
              width={200}
              height={120}
              accentColor={COLORS.amp}
              compact
              isTriggered={isPlaying}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <MiniSlider label="A" value={params.amplitudeEnvelope.attack} min={0.001} max={2} onChange={setAmplitudeAttack} />
              <MiniSlider label="D" value={params.amplitudeEnvelope.decay} min={0.001} max={2} onChange={setAmplitudeDecay} />
              <MiniSlider label="S" value={params.amplitudeEnvelope.sustain} min={0} max={1} onChange={setAmplitudeSustain} />
              <MiniSlider label="R" value={params.amplitudeEnvelope.release} min={0.001} max={4} onChange={setAmplitudeRelease} />
            </div>
          </StageCard>

          {/* LFO Stage */}
          <StageCard title="LFO" color={COLORS.lfo}>
            <LFOVisualizer
              waveform={params.lfo.waveform}
              rate={params.lfo.rate}
              depth={params.lfo.depth}
              width={200}
              height={100}
              accentColor={COLORS.lfo}
              compact
            />
            <div style={{ marginTop: '12px' }}>
              <LFOWaveformSelector value={params.lfo.waveform} onChange={setLFOWaveform} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              {/* Show Rate knob when not synced, Division selector when synced */}
              {!params.lfo.sync ? (
                <Knob label="Rate" value={params.lfo.rate} min={0.1} max={20} step={0.1} onChange={setLFORate} formatValue={(v) => `${v.toFixed(1)}`} size={40} paramId="lfo.rate" modulatedValue={modulatedValues?.lfo1Rate} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: '#888' }}>Division</span>
                  <select
                    value={params.lfo.syncDivision}
                    onChange={(e) => setLFOSyncDivision(e.target.value as LFOSyncDivision)}
                    style={{
                      padding: '4px 8px',
                      background: '#1a1a1a',
                      border: `1px solid ${COLORS.lfo}`,
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {LFO_SYNC_DIVISIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <Knob label="Depth" value={params.lfo.depth} min={0} max={1} step={0.01} onChange={setLFODepth} formatValue={formatPercent} size={40} paramId="lfo.depth" />
            </div>
            {/* Sync toggle */}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setLFOSync(!params.lfo.sync)}
                style={{
                  padding: '4px 12px',
                  background: params.lfo.sync ? COLORS.lfo : '#222',
                  border: `1px solid ${params.lfo.sync ? COLORS.lfo : '#444'}`,
                  borderRadius: '4px',
                  color: params.lfo.sync ? '#fff' : '#888',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {params.lfo.sync ? 'SYNC ON' : 'SYNC OFF'}
              </button>
            </div>
          </StageCard>

          {/* LFO 2 Stage */}
          <StageCard title="LFO 2" color={COLORS.lfo2}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Enable toggle */}
              <button
                onClick={() => setLfo2Enabled(!params.lfo2.enabled)}
                style={{
                  padding: '6px 16px',
                  background: params.lfo2.enabled ? COLORS.lfo2 : '#222',
                  border: `1px solid ${params.lfo2.enabled ? COLORS.lfo2 : '#444'}`,
                  borderRadius: '4px',
                  color: params.lfo2.enabled ? '#fff' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {params.lfo2.enabled ? 'ON' : 'OFF'}
              </button>

              {params.lfo2.enabled && (
                <>
                  {/* LFO Waveform Selector */}
                  <LFOWaveformSelector
                    value={params.lfo2.type}
                    onChange={(waveform: LFOWaveform) => setLfo2Type(waveform)}
                  />

                  {/* Rate and Depth knobs */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Knob
                      label="Rate"
                      value={params.lfo2.rate}
                      min={0.1}
                      max={20}
                      step={0.1}
                      onChange={setLfo2Rate}
                      formatValue={(v) => `${v.toFixed(1)} Hz`}
                      size={40}
                      paramId="lfo2.rate"
                      modulatedValue={modulatedValues?.lfo2Rate}
                    />
                    <Knob
                      label="Depth"
                      value={params.lfo2.depth}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={setLfo2Depth}
                      formatValue={formatPercent}
                      size={40}
                      paramId="lfo2.depth"
                    />
                  </div>
                </>
              )}

              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                Secondary modulation source
              </div>
            </div>
          </StageCard>

          {/* VELOCITY Stage */}
          <StageCard title="VELOCITY" color={COLORS.velocity}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginBottom: '4px' }}>
                How note velocity affects sound
              </div>
              <Knob
                label="Amp"
                value={params.velocity.ampAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={setVelocityAmpAmount}
                formatValue={formatPercent}
                size={48}
                paramId="velocity.ampAmount"
              />
              <Knob
                label="Filter"
                value={params.velocity.filterAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={setVelocityFilterAmount}
                formatValue={formatPercent}
                size={48}
                paramId="velocity.filterAmount"
              />
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                0% = no velocity effect
              </div>
            </div>
          </StageCard>

          {/* FX Stage */}
          <StageCard title="FX" color={COLORS.effects} wide>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <EffectMini
                name="DIST"
                color="#ef4444"
                knobs={[
                  { label: 'Amt', value: params.effects.distortion.amount, onChange: setDistortionAmount, max: 1 },
                  { label: 'Mix', value: params.effects.distortion.mix, onChange: setDistortionMix, max: 1 },
                ]}
              />
              <EffectMini
                name="DELAY"
                color="#3b82f6"
                knobs={[
                  { label: 'Time', value: params.effects.delay.time, onChange: setDelayTime, max: 1 },
                  { label: 'FB', value: params.effects.delay.feedback, onChange: setDelayFeedback, max: 0.9 },
                  { label: 'Mix', value: params.effects.delay.mix, onChange: setDelayMix, max: 1 },
                ]}
              />
              <EffectMini
                name="REVERB"
                color="#8b5cf6"
                knobs={[
                  { label: 'Decay', value: params.effects.reverb.decay, onChange: setReverbDecay, max: 10 },
                  { label: 'Mix', value: params.effects.reverb.mix, onChange: setReverbMix, max: 1 },
                ]}
              />
              <EffectMini
                name="CHORUS"
                color="#06b6d4"
                knobs={[
                  { label: 'Rate', value: params.effects.chorus.rate, onChange: setChorusRate, max: 10 },
                  { label: 'Depth', value: params.effects.chorus.depth, onChange: setChorusDepth, max: 1 },
                  { label: 'Mix', value: params.effects.chorus.mix, onChange: setChorusMix, max: 1 },
                ]}
              />
            </div>
          </StageCard>

          {/* MOD MATRIX Stack: MOD MATRIX + MOD ENV */}
          <StackedModule>
          <StageCard title="MOD MATRIX" color={COLORS.modMatrix} noBorderRadius="bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {params.modMatrix.routes.map((route, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    background: route.enabled ? 'rgba(168, 85, 247, 0.1)' : '#0d0d12',
                    borderRadius: '4px',
                    border: `1px solid ${route.enabled ? COLORS.modMatrix + '40' : '#222'}`,
                  }}
                >
                  {/* Enable checkbox */}
                  <input
                    type="checkbox"
                    checked={route.enabled}
                    onChange={() => setModRouteEnabled(i, !route.enabled)}
                    style={{
                      width: '14px',
                      height: '14px',
                      cursor: 'pointer',
                      accentColor: COLORS.modMatrix,
                    }}
                  />
                  {/* Source dropdown */}
                  <select
                    value={route.source}
                    onChange={(e) => setModRouteSource(i, e.target.value as ModSource)}
                    disabled={!route.enabled}
                    style={{
                      padding: '3px 4px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '3px',
                      color: route.enabled ? '#fff' : '#666',
                      fontSize: '10px',
                      cursor: 'pointer',
                      minWidth: '60px',
                    }}
                  >
                    <option value="lfo1">LFO 1</option>
                    <option value="lfo2">LFO 2</option>
                    <option value="ampEnv">Amp Env</option>
                    <option value="filterEnv">Filter Env</option>
                  </select>
                  {/* Arrow */}
                  <span style={{ color: route.enabled ? COLORS.modMatrix : '#444', fontSize: '12px' }}>→</span>
                  {/* Destination dropdown */}
                  <select
                    value={route.destination}
                    onChange={(e) => setModRouteDestination(i, e.target.value as ModDestination)}
                    disabled={!route.enabled}
                    style={{
                      padding: '3px 4px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '3px',
                      color: route.enabled ? '#fff' : '#666',
                      fontSize: '10px',
                      cursor: 'pointer',
                      minWidth: '70px',
                    }}
                  >
                    <option value="pitch">Pitch</option>
                    <option value="pan">Pan</option>
                    <option value="amplitude">Amplitude</option>
                    <option value="filterCutoff">Filter Cutoff</option>
                    <option value="osc2Mix">OSC2 Mix</option>
                    <option value="lfo1Rate">LFO1 Rate</option>
                    <option value="lfo2Rate">LFO2 Rate</option>
                  </select>
                  {/* Amount knob */}
                  <Knob
                    label=""
                    value={route.amount}
                    min={-1}
                    max={1}
                    step={0.01}
                    onChange={(v) => setModRouteAmount(i, v)}
                    formatValue={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
                    size={28}
                    paramId={`modMatrix.route${i}.amount`}
                  />
                </div>
              ))}
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
                Route modulation sources to destinations
              </div>
            </div>
          </StageCard>

          {/* MOD ENV - stacked below MOD MATRIX */}
          <StageCard title="MOD ENV" color={COLORS.modEnv} compact noBorderRadius="top">
            <EnvelopeVisualizer
              attack={params.modEnvelope.attack}
              decay={params.modEnvelope.decay}
              sustain={params.modEnvelope.sustain}
              release={params.modEnvelope.release}
              onAttackChange={setModEnvelopeAttack}
              onDecayChange={setModEnvelopeDecay}
              onSustainChange={setModEnvelopeSustain}
              onReleaseChange={setModEnvelopeRelease}
              width={200}
              height={60}
              accentColor={COLORS.modEnv}
              compact
              isTriggered={isPlaying}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <MiniSlider label="A" value={params.modEnvelope.attack} min={0.001} max={2} onChange={setModEnvelopeAttack} color={COLORS.modEnv} />
              <MiniSlider label="D" value={params.modEnvelope.decay} min={0.001} max={2} onChange={setModEnvelopeDecay} color={COLORS.modEnv} />
              <Knob label="Amt" value={params.modEnvelope.amount} min={0} max={1} step={0.01} onChange={setModEnvelopeAmount} formatValue={formatPercent} size={32} paramId="modEnv.amount" />
            </div>
          </StageCard>
          </StackedModule>

          {/* OUTPUT Stage */}
          <StageCard title="OUTPUT" color={COLORS.output}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Oscilloscope */}
              <Oscilloscope
                getAnalyser={() => engine?.getAnalyser() ?? null}
                width={200}
                height={80}
                accentColor={COLORS.output}
              />
              {/* Volume and Pan knobs */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Knob
                  label="Volume"
                  value={params.volume}
                  min={-40}
                  max={0}
                  step={0.5}
                  onChange={setVolume}
                  formatValue={formatDb}
                  size={48}
                  paramId="volume"
                />
                {/* Pan with L/R labels */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '9px', color: params.pan < 0 ? COLORS.output : '#666', fontWeight: params.pan < 0 ? 600 : 400 }}>L</span>
                    <Knob
                      label="Pan"
                      value={params.pan}
                      min={-1}
                      max={1}
                      step={0.01}
                      onChange={setPan}
                      formatValue={(v) => {
                        if (Math.abs(v) < 0.05) return 'C';
                        if (v < 0) return `${Math.round(Math.abs(v) * 100)}L`;
                        return `${Math.round(v * 100)}R`;
                      }}
                      size={40}
                      paramId="pan"
                      modulatedValue={modulatedValues?.pan}
                    />
                    <span style={{ fontSize: '9px', color: params.pan > 0 ? COLORS.output : '#666', fontWeight: params.pan > 0 ? 600 : 400 }}>R</span>
                  </div>
                </div>
              </div>
              <RecordingControl
                sourceNode={engine?.getOutputNode() ?? null}
                accentColor={COLORS.output}
                compact
              />
            </div>
          </StageCard>
        </div>

        {/* Sequencer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #1a1a1a' }}>
          <Sequencer engine={engine} accentColor="#4ade80" />
        </div>

        {/* Bottom Control Strip */}
        <div style={{
          borderTop: '1px solid #1a1a1a',
          background: '#0d0d12',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
            <button
              onClick={() => setBottomMode('xy')}
              style={{
                padding: '8px 16px',
                background: bottomMode === 'xy' ? '#1a1a1a' : 'transparent',
                border: 'none',
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.filter}` : '2px solid transparent',
                color: bottomMode === 'xy' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              XY
            </button>
            <button
              onClick={() => setBottomMode('keys')}
              style={{
                padding: '8px 16px',
                background: bottomMode === 'keys' ? '#1a1a1a' : 'transparent',
                border: 'none',
                borderBottom: bottomMode === 'keys' ? `2px solid #4ade80` : '2px solid transparent',
                color: bottomMode === 'keys' ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              KEYS
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setBottomExpanded(!bottomExpanded)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {bottomExpanded ? '▼' : '▲'}
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              height: bottomExpanded ? '140px' : '50px',
              transition: 'height 0.2s ease',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 24px',
            }}
            onClick={() => !bottomExpanded && setBottomExpanded(true)}
          >
            {bottomMode === 'keys' ? (
              <PianoKeyboard
                onNoteOn={playNote}
                onNoteOff={stopNote}
                octave={4}
                octaves={bottomExpanded ? 3 : 1}
              />
            ) : (
              <XYPad
                xValue={normalizeValue(params.filter.cutoff, xRange[0], xRange[1])}
                yValue={normalizeValue(params.filter.resonance, yRange[0], yRange[1])}
                xLabel="Cutoff"
                yLabel="Resonance"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setFilterCutoff(denormalizeValue(v, xRange[0], xRange[1]))}
                onYChange={(v) => setFilterResonance(denormalizeValue(v, yRange[0], yRange[1]))}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.filter}
                formatXValue={formatHz}
                formatYValue={(v) => v.toFixed(1)}
              />
            )}
          </div>
        </div>

        <InfoPanel />
      </div>
    </InfoPanelProvider>
  );
}

// Help mode toggle button
function HelpModeButton() {
  const { helpMode, toggleHelpMode } = useInfoPanel();

  return (
    <button
      onClick={toggleHelpMode}
      style={{
        padding: '6px 12px',
        background: helpMode
          ? 'linear-gradient(145deg, #06b6d4, #0891b2)'
          : '#1a1a1a',
        border: helpMode ? 'none' : '1px solid #333',
        borderRadius: '4px',
        color: helpMode ? '#fff' : '#888',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      title={helpMode ? 'Disable help tooltips' : 'Enable help tooltips'}
    >
      <span style={{ fontSize: '14px' }}>?</span>
      {helpMode ? 'Help ON' : 'Help'}
    </button>
  );
}

// Standard module widths
const MODULE_WIDTH = {
  standard: 224,  // 200px visualizer + 12px padding each side
  wide: 320,      // FX and mod matrix
  compact: 224,   // Stacked envelope modules (same as parent)
};

// Stage card component
function StageCard({
  title,
  color,
  wide = false,
  compact = false,
  noBorderRadius,
  children
}: {
  title: string;
  color: string;
  wide?: boolean;
  compact?: boolean;
  noBorderRadius?: 'top' | 'bottom' | 'both';
  children: React.ReactNode;
}) {
  const borderRadius = noBorderRadius === 'both' ? '0' :
    noBorderRadius === 'top' ? '0 0 8px 8px' :
    noBorderRadius === 'bottom' ? '8px 8px 0 0' : '8px';

  const width = wide ? MODULE_WIDTH.wide : MODULE_WIDTH.standard;

  return (
    <div style={{
      background: '#111',
      border: `1px solid ${color}40`,
      borderRadius,
      padding: compact ? '8px' : '12px',
      width: `${width}px`,
      boxSizing: 'border-box',
      alignSelf: 'flex-start',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: color,
        letterSpacing: '0.5px',
        marginBottom: compact ? '8px' : '12px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// Stacked module - vertically connects a main module with its envelope(s)
function StackedModule({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0px', // No gap - cards connect visually
      alignSelf: 'flex-start',
    }}>
      {children}
    </div>
  );
}

// Mini slider for ADSR
function MiniSlider({
  label,
  value,
  min,
  max,
  onChange,
  color = COLORS.amp,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '10px', color: '#666', width: '12px' }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: '4px',
          background: '#222',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          onChange(min + x * (max - min));
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${percent}%`,
          background: color,
          borderRadius: '2px',
        }} />
      </div>
    </div>
  );
}

// Mini effect control
function EffectMini({
  name,
  color,
  knobs,
}: {
  name: string;
  color: string;
  knobs: Array<{ label: string; value: number; onChange: (v: number) => void; max: number }>;
}) {
  return (
    <div>
      <div style={{ fontSize: '9px', color, marginBottom: '6px', fontWeight: 600 }}>{name}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {knobs.map((k) => (
          <Knob
            key={k.label}
            label={k.label}
            value={k.value}
            min={0}
            max={k.max}
            step={0.01}
            onChange={k.onChange}
            formatValue={(v) => `${Math.round((v / k.max) * 100)}%`}
            size={32}
            paramId={`effect.${name.toLowerCase()}.${k.label.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
