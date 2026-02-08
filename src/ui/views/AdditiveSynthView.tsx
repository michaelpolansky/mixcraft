/**
 * Additive Synthesizer View
 * Horizontal signal-flow layout: HARMONICS -> LFO -> NOISE -> VELOCITY -> ARP -> AMP -> OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
import {
  Knob,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  HarmonicBarsVisualizer,
  EnvelopeVisualizer,
  WaveformSelector,
  LFOVisualizer,
  NoiseVisualizer,
  Oscilloscope,
  XYPad,
  ArpeggiatorControls,
} from '../components/index.ts';
import { ADDITIVE_PRESETS } from '../../data/presets/additive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import type {
  LFOWaveform,
  AdditiveLFODestination,
  NoiseType,
} from '../../core/types.ts';

// Stage colors following signal flow (cyan/teal theme for additive)
const COLORS = {
  harmonics: '#06b6d4',
  lfo: '#14b8a6',
  noise: '#64748b',
  velocity: '#22d3ee',
  arp: '#0ea5e9',
  amp: '#22c55e',
  output: '#f97316',
};

// Standardized sizes for consistent UI
const SIZES = {
  visualizer: {
    width: 200,
    height: 100,
    compactHeight: 60,
  },
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
  },
  margin: {
    section: 12,
  },
};

// Standard module widths
const MODULE_WIDTH = {
  standard: 224,
  wide: 320,
  extraWide: 440,
};

// Noise type options
const NOISE_TYPES = [
  { value: 'white' as const, label: 'White' },
  { value: 'pink' as const, label: 'Pink' },
  { value: 'brown' as const, label: 'Brown' },
];

// LFO destination options for Additive synth
const ADDITIVE_LFO_DESTINATIONS = [
  { value: 'brightness' as const, label: 'Brightness' },
  { value: 'pitch' as const, label: 'Pitch' },
];

export function AdditiveSynthView() {
  const {
    params,
    engine,
    isInitialized,
    isInitializing,
    initError,
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
    // LFO actions
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setLFODestination,
    // Noise actions
    setNoiseType,
    setNoiseLevel,
    // Glide actions
    setGlideEnabled,
    setGlideTime,
    // Pan action
    setPan,
    // Velocity actions
    setVelocityAmpAmount,
    setVelocityBrightnessAmount,
    // Arpeggiator actions
    setArpEnabled,
    setArpPattern,
    setArpDivision,
    setArpOctaves,
    setArpGate,
  } = useAdditiveSynthStore();

  // Bottom strip state
  const [bottomMode, setBottomMode] = useState<'keys' | 'xy'>('keys');
  const [bottomExpanded, setBottomExpanded] = useState(false);

  // Arp-aware note handlers for keyboard
  const handleNoteOn = useCallback((note: string) => {
    playNote(note);
  }, [playNote]);

  const handleNoteOff = useCallback((note: string) => {
    stopNote(note);
  }, [stopNote]);

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Get analyser for spectrum visualization
  const getAnalyser = useCallback(() => {
    return engine?.getAnalyser() ?? null;
  }, [engine]);

  // Format helpers
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // Harmonic presets
  const HARMONIC_PRESETS = [
    { label: 'Saw', key: 'saw' as const },
    { label: 'Square', key: 'square' as const },
    { label: 'Triangle', key: 'triangle' as const },
    { label: 'Organ', key: 'organ' as const },
  ];

  // XY Pad - controls fundamental (H1) and brightness (sum of high harmonics)
  // X = fundamental volume, Y = high harmonic mix
  const xRange: [number, number] = [0, 1];
  const yRange: [number, number] = [0, 1];

  // Calculate current XY values from harmonics
  const fundamentalLevel = params.harmonics[0] ?? 1;
  const highHarmonicsMix = params.harmonics.slice(4).reduce((sum, h) => sum + h, 0) / 4; // avg of H5-H8

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
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#06b6d4' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Additive Synthesizer</p>
        <button
          onClick={handleStartAudio}
          disabled={isInitializing}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: isInitializing
              ? 'linear-gradient(145deg, #0e7490, #155e75)'
              : 'linear-gradient(145deg, #06b6d4, #0891b2)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: isInitializing ? 'wait' : 'pointer',
            fontWeight: 600,
            boxShadow: isInitializing
              ? '0 4px 12px rgba(6, 182, 212, 0.15)'
              : '0 4px 12px rgba(6, 182, 212, 0.3)',
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
            <h1 style={{ fontSize: '20px', fontWeight: 300, margin: 0, color: '#06b6d4' }}>
              MIXCRAFT
            </h1>
            <span style={{ fontSize: '11px', color: '#666' }}>Additive Synthesizer</span>
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
          </div>
        </div>

        {/* Spectrum Analyzer */}
        <div style={{ padding: '12px 24px', background: '#050508' }}>
          <SpectrumAnalyzer getAnalyser={getAnalyser} width={window.innerWidth - 48} height={80} barCount={100} />
        </div>

        {/* Signal Flow - Horizontal flex wrap */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'flex-start',
          overflow: 'auto',
        }}>
          {/* HARMONICS Stage - extra wide for the bars */}
          <StageCard title="HARMONICS" color={COLORS.harmonics} extraWide>
            <HarmonicBarsVisualizer
              harmonics={params.harmonics}
              onHarmonicChange={setHarmonic}
              width={400}
              height={140}
              accentColor={COLORS.harmonics}
            />
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>PRESETS</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {HARMONIC_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    style={{
                      padding: '4px 8px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '10px',
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

            {/* Glide controls */}
            <div style={{ marginTop: SIZES.gap.md, paddingTop: SIZES.gap.md, borderTop: '1px solid #222' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SIZES.gap.sm }}>
                <button
                  onClick={() => setGlideEnabled(!params.glide.enabled)}
                  style={{
                    padding: '4px 8px',
                    background: params.glide.enabled ? COLORS.harmonics : '#222',
                    border: `1px solid ${params.glide.enabled ? COLORS.harmonics : '#444'}`,
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
                    paramId="additive.glide.time"
                  />
                )}
              </div>
            </div>
          </StageCard>

          {/* LFO Stage */}
          <StageCard title="LFO" color={COLORS.lfo}>
            <LFOVisualizer
              waveform={params.lfo.waveform}
              rate={params.lfo.rate}
              depth={params.lfo.depth}
              width={SIZES.visualizer.width}
              height={SIZES.visualizer.height}
              accentColor={COLORS.lfo}
              compact
            />
            <div style={{ marginTop: SIZES.margin.section }}>
              <WaveformSelector
                value={params.lfo.waveform}
                onChange={(waveform: LFOWaveform) => setLFOWaveform(waveform)}
                accentColor={COLORS.lfo}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm, marginTop: SIZES.margin.section }}>
              <Knob
                label="Rate"
                value={params.lfo.rate}
                min={0.1}
                max={20}
                step={0.1}
                onChange={setLFORate}
                formatValue={(v) => `${v.toFixed(1)} Hz`}
                paramId="additive.lfo.rate"
              />
              <Knob
                label="Depth"
                value={params.lfo.depth}
                min={0}
                max={1}
                step={0.01}
                onChange={setLFODepth}
                formatValue={formatPercent}
                paramId="additive.lfo.depth"
              />
            </div>
            {/* Destination selector */}
            <div style={{ marginTop: SIZES.margin.section }}>
              <div style={{ fontSize: '9px', color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>
                Destination
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {ADDITIVE_LFO_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.value}
                    onClick={() => setLFODestination(dest.value)}
                    style={{
                      padding: '4px 8px',
                      background: params.lfo.destination === dest.value ? COLORS.lfo : '#1a1a1a',
                      border: `1px solid ${params.lfo.destination === dest.value ? COLORS.lfo : '#333'}`,
                      borderRadius: '4px',
                      color: params.lfo.destination === dest.value ? '#fff' : '#888',
                      fontSize: '9px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
            </div>
          </StageCard>

          {/* NOISE Stage */}
          <StageCard title="NOISE" color={COLORS.noise}>
            <NoiseVisualizer
              noiseType={params.noise.type}
              level={params.noise.level}
              width={SIZES.visualizer.width}
              height={SIZES.visualizer.height}
              accentColor={COLORS.noise}
              compact
            />
            <div style={{ display: 'flex', gap: SIZES.gap.xs, marginTop: SIZES.margin.section }}>
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
            <div style={{ marginTop: SIZES.margin.section }}>
              <Knob
                label="Level"
                value={params.noise.level}
                min={0}
                max={1}
                step={0.01}
                onChange={setNoiseLevel}
                formatValue={formatPercent}
                paramId="additive.noise.level"
              />
            </div>
          </StageCard>

          {/* VELOCITY Stage */}
          <StageCard title="VELOCITY" color={COLORS.velocity}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm }}>
              <Knob
                label="Amp Amount"
                value={params.velocity.ampAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={setVelocityAmpAmount}
                formatValue={formatPercent}
                paramId="additive.velocity.ampAmount"
              />
              <Knob
                label="Brightness"
                value={params.velocity.brightnessAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={setVelocityBrightnessAmount}
                formatValue={formatPercent}
                paramId="additive.velocity.brightnessAmount"
              />
            </div>
          </StageCard>

          {/* ARP Stage */}
          <StageCard title="ARP" color={COLORS.arp}>
            <ArpeggiatorControls
              enabled={params.arpeggiator.enabled}
              pattern={params.arpeggiator.pattern}
              division={params.arpeggiator.division}
              octaves={params.arpeggiator.octaves}
              gate={params.arpeggiator.gate}
              onEnabledChange={setArpEnabled}
              onPatternChange={setArpPattern}
              onDivisionChange={setArpDivision}
              onOctavesChange={setArpOctaves}
              onGateChange={setArpGate}
              accentColor={COLORS.arp}
            />
          </StageCard>

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
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <MiniSlider label="A" value={params.amplitudeEnvelope.attack} min={0.001} max={2} onChange={setAmplitudeAttack} color={COLORS.amp} />
              <MiniSlider label="D" value={params.amplitudeEnvelope.decay} min={0.001} max={2} onChange={setAmplitudeDecay} color={COLORS.amp} />
              <MiniSlider label="S" value={params.amplitudeEnvelope.sustain} min={0} max={1} onChange={setAmplitudeSustain} color={COLORS.amp} />
              <MiniSlider label="R" value={params.amplitudeEnvelope.release} min={0.001} max={4} onChange={setAmplitudeRelease} color={COLORS.amp} />
            </div>
          </StageCard>

          {/* FX Stage */}
          <StageCard title="FX" color="#8b5cf6" wide>
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

          {/* OUTPUT Stage */}
          <StageCard title="OUTPUT" color={COLORS.output}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Oscilloscope */}
              <Oscilloscope
                getAnalyser={getAnalyser}
                width={SIZES.visualizer.width}
                height={SIZES.visualizer.compactHeight}
                accentColor={COLORS.output}
              />
              <Knob
                label="Volume"
                value={params.volume}
                min={-40}
                max={0}
                step={0.5}
                onChange={setVolume}
                formatValue={formatDb}
                size={56}
                paramId="volume"
              />
              <Knob
                label="Pan"
                value={params.pan}
                min={-1}
                max={1}
                step={0.01}
                onChange={setPan}
                formatValue={(v) => {
                  if (Math.abs(v) < 0.05) return 'Center';
                  if (v < 0) return `${Math.round(Math.abs(v) * 100)}% L`;
                  return `${Math.round(v * 100)}% R`;
                }}
                paramId="additive.pan"
              />
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
          <Sequencer engine={engine} accentColor="#06b6d4" />
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
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.harmonics}` : '2px solid transparent',
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
                borderBottom: bottomMode === 'keys' ? `2px solid ${COLORS.harmonics}` : '2px solid transparent',
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
              {bottomExpanded ? '\u25BC' : '\u25B2'}
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
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                octave={3}
                octaves={bottomExpanded ? 3 : 1}
              />
            ) : (
              <XYPad
                xValue={fundamentalLevel}
                yValue={highHarmonicsMix}
                xLabel="Fundamental"
                yLabel="Brightness"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setHarmonic(0, v)}
                onYChange={(v) => {
                  // Adjust high harmonics (H5-H8) proportionally
                  for (let i = 4; i < 8; i++) {
                    setHarmonic(i, v);
                  }
                }}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.harmonics}
                formatXValue={formatPercent}
                formatYValue={formatPercent}
              />
            )}
          </div>
        </div>

        <InfoPanel accentColor="#06b6d4" />
      </div>
    </InfoPanelProvider>
  );
}

// Stage card component
function StageCard({
  title,
  color,
  wide = false,
  extraWide = false,
  children
}: {
  title: string;
  color: string;
  wide?: boolean;
  extraWide?: boolean;
  children: React.ReactNode;
}) {
  const width = extraWide ? MODULE_WIDTH.extraWide : wide ? MODULE_WIDTH.wide : MODULE_WIDTH.standard;

  return (
    <div style={{
      background: '#111',
      border: `1px solid ${color}40`,
      borderRadius: '8px',
      padding: '12px',
      width: `${width}px`,
      boxSizing: 'border-box',
      alignSelf: 'flex-start',
      overflow: 'hidden',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: color,
        letterSpacing: '0.5px',
        marginBottom: '12px',
      }}>
        {title}
      </div>
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
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
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
