/**
 * FM Synthesizer View
 * Horizontal signal-flow layout: FM → LFO → NOISE → VELOCITY → ARP → AMP → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  Knob,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  Sequencer,
  RecordingControl,
  FMVisualizer,
  EnvelopeVisualizer,
  WaveformSelector,
  LFOVisualizer,
  NoiseVisualizer,
  Oscilloscope,
  XYPad,
  ArpeggiatorControls,
  StageCard,
  MiniSlider,
  AudioInitScreen,
  SynthHeader,
} from '../components/index.ts';
import { FM_PRESETS } from '../../data/presets/fm-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import {
  FM_PARAM_RANGES,
  HARMONICITY_PRESETS,
  FM_MOD_SOURCES,
  FM_MOD_DESTINATIONS,
  FM_MOD_SOURCE_LABELS,
  FM_MOD_DEST_LABELS,
  type FMLFODestination,
  type NoiseType,
  type LFOWaveform,
  type FMModSource,
  type FMModDestination,
} from '../../core/types.ts';

// Stage colors following signal flow
const COLORS = {
  fm: '#f97316',
  lfo: '#ef4444',
  noise: '#64748b',
  velocity: '#fb923c',
  arp: '#f59e0b',
  amp: '#22c55e',
  modMatrix: '#a855f7',
  output: '#ef4444',
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


// Noise type options
const NOISE_TYPES = [
  { value: 'white' as const, label: 'White' },
  { value: 'pink' as const, label: 'Pink' },
  { value: 'brown' as const, label: 'Brown' },
];

// LFO destination options for FM synth
const FM_LFO_DESTINATIONS = [
  { value: 'modulationIndex' as const, label: 'Mod Index' },
  { value: 'harmonicity' as const, label: 'Harmonic' },
  { value: 'pitch' as const, label: 'Pitch' },
];

export function FMSynthView() {
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
    setHarmonicity,
    setModulationIndex,
    setCarrierType,
    setModulatorType,
    setModulationEnvelopeAmount,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
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
    setVelocityModIndexAmount,
    // Arpeggiator actions
    setArpEnabled,
    setArpPattern,
    setArpDivision,
    setArpOctaves,
    setArpGate,
    // Mod Matrix
    setModRoute,
  } = useFMSynthStore();

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
  const formatMs = (value: number) => value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  // XY Pad handlers - maps to Harmonicity (X) and Mod Index (Y)
  const xRange: [number, number] = [FM_PARAM_RANGES.harmonicity.min, FM_PARAM_RANGES.harmonicity.max];
  const yRange: [number, number] = [FM_PARAM_RANGES.modulationIndex.min, FM_PARAM_RANGES.modulationIndex.max];

  const normalizeValue = (value: number, min: number, max: number) => (value - min) / (max - min);
  const denormalizeValue = (normalized: number, min: number, max: number) => min + normalized * (max - min);

  // Not initialized - show start button
  if (!isInitialized) {
    return (
      <AudioInitScreen
        title="MIXCRAFT"
        subtitle="FM Synthesizer"
        accentColor="#fb923c"
        isInitializing={isInitializing}
        initError={initError}
        onStart={handleStartAudio}
      />
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
        <SynthHeader
          title="MIXCRAFT"
          subtitle="FM Synthesizer"
          accentColor="#f97316"
          presets={FM_PRESETS}
          currentPreset={currentPreset}
          onPresetSelect={loadPreset}
          onReset={resetToDefaults}
        />

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
          {/* FM Stage - wider for the visualizer */}
          <StageCard title="FM SYNTHESIS" color={COLORS.fm} wide>
            <FMVisualizer
              carrierType={params.carrierType}
              modulatorType={params.modulatorType}
              harmonicity={params.harmonicity}
              modulationIndex={params.modulationIndex}
              width={320}
              height={120}
              accentColor={COLORS.fm}
              compact
            />

            {/* Carrier & Modulator Waveforms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '9px', color: COLORS.fm, marginBottom: '4px', fontWeight: 600 }}>CARRIER</div>
                <WaveformSelector value={params.carrierType} onChange={setCarrierType} accentColor={COLORS.fm} size="compact" />
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px', fontWeight: 600 }}>MODULATOR</div>
                <WaveformSelector value={params.modulatorType} onChange={setModulatorType} accentColor={COLORS.fm} size="compact" />
              </div>
            </div>

            {/* FM Parameters */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Knob
                  label="Harm"
                  value={params.harmonicity}
                  min={FM_PARAM_RANGES.harmonicity.min}
                  max={FM_PARAM_RANGES.harmonicity.max}
                  step={FM_PARAM_RANGES.harmonicity.step}
                  onChange={setHarmonicity}
                  formatValue={(v) => v.toFixed(2)}
                  size={40}
                  paramId="fm.harmonicity"
                />
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80px' }}>
                  {HARMONICITY_PRESETS.slice(0, 4).map((value) => (
                    <button
                      key={value}
                      onClick={() => setHarmonicity(value)}
                      style={{
                        padding: '2px 4px',
                        background: Math.abs(params.harmonicity - value) < 0.01 ? COLORS.fm : '#1a1a1a',
                        border: 'none',
                        borderRadius: '2px',
                        color: Math.abs(params.harmonicity - value) < 0.01 ? '#fff' : '#666',
                        cursor: 'pointer',
                        fontSize: '8px',
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <Knob
                label="Index"
                value={params.modulationIndex}
                min={FM_PARAM_RANGES.modulationIndex.min}
                max={FM_PARAM_RANGES.modulationIndex.max}
                step={FM_PARAM_RANGES.modulationIndex.step}
                onChange={setModulationIndex}
                formatValue={(v) => v.toFixed(1)}
                size={40}
                paramId="fm.modulationIndex"
              />
              <Knob
                label="Env"
                value={params.modulationEnvelopeAmount}
                min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
                max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
                step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
                onChange={setModulationEnvelopeAmount}
                formatValue={(v) => v.toFixed(1)}
                size={40}
                paramId="fm.modEnvAmount"
              />
            </div>

            {/* Glide controls */}
            <div style={{ marginTop: SIZES.gap.md, paddingTop: SIZES.gap.md, borderTop: '1px solid #222' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SIZES.gap.sm }}>
                <button
                  onClick={() => setGlideEnabled(!params.glide.enabled)}
                  style={{
                    padding: '4px 8px',
                    background: params.glide.enabled ? COLORS.fm : '#222',
                    border: `1px solid ${params.glide.enabled ? COLORS.fm : '#444'}`,
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
                    paramId="fm.glide.time"
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
                paramId="fm.lfo.rate"
              />
              <Knob
                label="Depth"
                value={params.lfo.depth}
                min={0}
                max={1}
                step={0.01}
                onChange={setLFODepth}
                formatValue={formatPercent}
                paramId="fm.lfo.depth"
              />
            </div>
            {/* Destination selector */}
            <div style={{ marginTop: SIZES.margin.section }}>
              <div style={{ fontSize: '9px', color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>
                Destination
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {FM_LFO_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.value}
                    onClick={() => setLFODestination(dest.value)}
                    style={{
                      padding: '4px 6px',
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
                paramId="fm.noise.level"
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
                paramId="fm.velocity.ampAmount"
              />
              <Knob
                label="Mod Idx Amt"
                value={params.velocity.modIndexAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={setVelocityModIndexAmount}
                formatValue={formatPercent}
                paramId="fm.velocity.modIndexAmount"
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

          {/* MOD MATRIX Stage */}
          <StageCard title="MOD MATRIX" color={COLORS.modMatrix} wide>
            <FMModMatrixUI
              routes={params.modMatrix.routes}
              onChange={setModRoute}
              accentColor={COLORS.modMatrix}
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
                paramId="fm.pan"
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
          <Sequencer engine={engine} accentColor="#f97316" />
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
                borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.fm}` : '2px solid transparent',
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
                borderBottom: bottomMode === 'keys' ? `2px solid ${COLORS.fm}` : '2px solid transparent',
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
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                octave={3}
                octaves={bottomExpanded ? 3 : 1}
              />
            ) : (
              <XYPad
                xValue={normalizeValue(params.harmonicity, xRange[0], xRange[1])}
                yValue={normalizeValue(params.modulationIndex, yRange[0], yRange[1])}
                xLabel="Harmonicity"
                yLabel="Mod Index"
                xRange={xRange}
                yRange={yRange}
                onXChange={(v) => setHarmonicity(denormalizeValue(v, xRange[0], xRange[1]))}
                onYChange={(v) => setModulationIndex(denormalizeValue(v, yRange[0], yRange[1]))}
                size={bottomExpanded ? 120 : 40}
                accentColor={COLORS.fm}
                formatXValue={(v) => v.toFixed(2)}
                formatYValue={(v) => v.toFixed(1)}
              />
            )}
          </div>
        </div>

        <InfoPanel accentColor="#f97316" />
      </div>
    </InfoPanelProvider>
  );
}

// FM Mod Matrix UI - route-based with 4 slots
interface FMModMatrixUIProps {
  routes: readonly [
    { source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean },
    { source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean },
    { source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean },
    { source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean },
  ];
  onChange: (index: number, route: Partial<{ source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean }>) => void;
  accentColor: string;
}

function FMModMatrixUI({ routes, onChange, accentColor }: FMModMatrixUIProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm }}>
      {routes.map((route, index) => (
        <FMModRouteRow
          key={index}
          index={index}
          route={route}
          onChange={onChange}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}

interface FMModRouteRowProps {
  index: number;
  route: { source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean };
  onChange: (index: number, route: Partial<{ source: FMModSource; destination: FMModDestination; amount: number; enabled: boolean }>) => void;
  accentColor: string;
}

function FMModRouteRow({ index, route, onChange, accentColor }: FMModRouteRowProps) {
  const isActive = route.enabled && Math.abs(route.amount) > 0.01;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: SIZES.gap.xs,
      padding: '4px 6px',
      background: isActive ? `${accentColor}15` : '#1a1a1a',
      borderRadius: '4px',
      border: `1px solid ${isActive ? accentColor : '#333'}`,
    }}>
      {/* Enable toggle */}
      <button
        onClick={() => onChange(index, { enabled: !route.enabled })}
        style={{
          width: 20,
          height: 20,
          fontSize: '10px',
          fontWeight: 700,
          background: route.enabled ? accentColor : '#333',
          border: 'none',
          borderRadius: '3px',
          color: route.enabled ? '#000' : '#888',
          cursor: 'pointer',
        }}
      >
        {index + 1}
      </button>

      {/* Source selector */}
      <select
        value={route.source}
        onChange={(e) => onChange(index, { source: e.target.value as FMModSource })}
        disabled={!route.enabled}
        style={{
          padding: '2px 4px',
          background: '#222',
          border: '1px solid #444',
          borderRadius: '3px',
          color: route.enabled ? '#fff' : '#666',
          fontSize: '9px',
          cursor: route.enabled ? 'pointer' : 'not-allowed',
          flex: 1,
          minWidth: 0,
        }}
      >
        {FM_MOD_SOURCES.map((src) => (
          <option key={src} value={src}>{FM_MOD_SOURCE_LABELS[src]}</option>
        ))}
      </select>

      {/* Arrow */}
      <span style={{ fontSize: '10px', color: route.enabled ? accentColor : '#666' }}>→</span>

      {/* Destination selector */}
      <select
        value={route.destination}
        onChange={(e) => onChange(index, { destination: e.target.value as FMModDestination })}
        disabled={!route.enabled}
        style={{
          padding: '2px 4px',
          background: '#222',
          border: '1px solid #444',
          borderRadius: '3px',
          color: route.enabled ? '#fff' : '#666',
          fontSize: '9px',
          cursor: route.enabled ? 'pointer' : 'not-allowed',
          flex: 1,
          minWidth: 0,
        }}
      >
        {FM_MOD_DESTINATIONS.map((dest) => (
          <option key={dest} value={dest}>{FM_MOD_DEST_LABELS[dest]}</option>
        ))}
      </select>

      {/* Amount slider */}
      <div
        style={{
          width: 60,
          height: 16,
          background: '#222',
          borderRadius: '3px',
          cursor: route.enabled ? 'pointer' : 'not-allowed',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => {
          if (!route.enabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          // Map 0-1 to -1 to +1
          const amount = (x * 2 - 1);
          onChange(index, { amount: Math.round(amount * 100) / 100 });
        }}
      >
        {/* Center line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 1,
          background: '#444',
        }} />
        {/* Fill */}
        {route.enabled && (
          <div style={{
            position: 'absolute',
            top: 2,
            bottom: 2,
            left: route.amount >= 0 ? '50%' : `${(0.5 + route.amount / 2) * 100}%`,
            width: `${Math.abs(route.amount) / 2 * 100}%`,
            background: accentColor,
            borderRadius: '2px',
          }} />
        )}
        {/* Value label */}
        <span style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '8px',
          fontWeight: 600,
          color: route.enabled ? '#fff' : '#666',
          fontFamily: 'monospace',
        }}>
          {route.enabled ? `${route.amount >= 0 ? '+' : ''}${Math.round(route.amount * 100)}` : '---'}
        </span>
      </div>
    </div>
  );
}

