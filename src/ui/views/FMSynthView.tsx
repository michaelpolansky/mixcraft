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
  GlideControls,
  VelocityControls,
} from '../components/index.ts';
import { FM_PRESETS } from '../../data/presets/fm-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { cn } from '../utils/cn.ts';
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
      <div className="min-h-screen bg-[#0a0a0f] text-text-primary font-sans flex flex-col">
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
        <div className="py-3 px-6 bg-[#050508]">
          <SpectrumAnalyzer getAnalyser={getAnalyser} width={window.innerWidth - 48} height={80} barCount={100} />
        </div>

        {/* Signal Flow - Horizontal flex wrap */}
        <div className="flex-1 p-4 flex flex-wrap gap-4 content-start overflow-auto">
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
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: COLORS.fm }}>CARRIER</div>
                <WaveformSelector value={params.carrierType} onChange={setCarrierType} accentColor={COLORS.fm} size="compact" />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1 text-text-muted">MODULATOR</div>
                <WaveformSelector value={params.modulatorType} onChange={setModulatorType} accentColor={COLORS.fm} size="compact" />
              </div>
            </div>

            {/* FM Parameters */}
            <div className="flex gap-3 mt-3 justify-center items-start">
              <div className="flex flex-col items-center gap-1">
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
                <div className="flex gap-0.5 flex-wrap justify-center max-w-[80px]">
                  {HARMONICITY_PRESETS.slice(0, 4).map((value) => {
                    const isActive = Math.abs(params.harmonicity - value) < 0.01;
                    return (
                      <button
                        key={value}
                        onClick={() => setHarmonicity(value)}
                        className={cn(
                          'py-0.5 px-1 border-none rounded-sm cursor-pointer text-[8px]',
                          isActive ? 'text-text-primary' : 'bg-bg-tertiary text-text-muted'
                        )}
                        style={isActive ? { background: COLORS.fm } : undefined}
                      >
                        {value}
                      </button>
                    );
                  })}
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
            <GlideControls
              enabled={params.glide.enabled}
              time={params.glide.time}
              onEnabledChange={setGlideEnabled}
              onTimeChange={setGlideTime}
              color={COLORS.fm}
            />
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
            <div className="mt-3">
              <WaveformSelector
                value={params.lfo.waveform}
                onChange={(waveform: LFOWaveform) => setLFOWaveform(waveform)}
                accentColor={COLORS.lfo}
              />
            </div>
            <div className="flex flex-col gap-2 mt-3">
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
            <div className="mt-3">
              <div className="text-xs text-text-tertiary mb-1 uppercase">
                Destination
              </div>
              <div className="flex gap-0.5">
                {FM_LFO_DESTINATIONS.map((dest) => {
                  const isActive = params.lfo.destination === dest.value;
                  return (
                    <button
                      key={dest.value}
                      onClick={() => setLFODestination(dest.value)}
                      className={cn(
                        'py-1 px-1.5 rounded-sm cursor-pointer text-xs font-medium border',
                        isActive
                          ? 'text-text-primary'
                          : 'bg-bg-tertiary border-border-medium text-text-tertiary'
                      )}
                      style={isActive ? {
                        background: COLORS.lfo,
                        borderColor: COLORS.lfo,
                      } : undefined}
                    >
                      {dest.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </StageCard>

          {/* NOISE Stage */}
          <StageCard title="NOISE" color={COLORS.noise}>
            <NoiseVisualizer
              noiseType={params.noise.type}
              level={params.noise.level}
              width={200}
              height={100}
              accentColor={COLORS.noise}
              compact
            />
            <div className="flex gap-1 mt-3">
              {NOISE_TYPES.map((nt) => {
                const isActive = params.noise.type === nt.value;
                return (
                  <button
                    key={nt.value}
                    onClick={() => setNoiseType(nt.value)}
                    className={cn(
                      'py-1.5 px-2.5 rounded-sm cursor-pointer text-sm font-medium border',
                      isActive
                        ? 'text-text-primary'
                        : 'bg-bg-tertiary border-border-medium text-text-tertiary'
                    )}
                    style={isActive ? {
                      background: COLORS.noise,
                      borderColor: COLORS.noise,
                    } : undefined}
                  >
                    {nt.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
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
            <VelocityControls
              ampAmount={params.velocity.ampAmount}
              secondaryAmount={params.velocity.modIndexAmount}
              secondaryLabel="Mod Idx"
              onAmpAmountChange={setVelocityAmpAmount}
              onSecondaryAmountChange={setVelocityModIndexAmount}
              color={COLORS.velocity}
            />
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
            <div className="grid grid-cols-2 gap-2 mt-3">
              <MiniSlider label="A" value={params.amplitudeEnvelope.attack} min={0.001} max={2} onChange={setAmplitudeAttack} color={COLORS.amp} />
              <MiniSlider label="D" value={params.amplitudeEnvelope.decay} min={0.001} max={2} onChange={setAmplitudeDecay} color={COLORS.amp} />
              <MiniSlider label="S" value={params.amplitudeEnvelope.sustain} min={0} max={1} onChange={setAmplitudeSustain} color={COLORS.amp} />
              <MiniSlider label="R" value={params.amplitudeEnvelope.release} min={0.001} max={4} onChange={setAmplitudeRelease} color={COLORS.amp} />
            </div>
          </StageCard>

          {/* OUTPUT Stage */}
          <StageCard title="OUTPUT" color={COLORS.output}>
            <div className="flex flex-col items-center gap-3">
              {/* Oscilloscope */}
              <Oscilloscope
                getAnalyser={getAnalyser}
                width={200}
                height={60}
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
        <div className="py-3 px-6 border-t border-border-subtle">
          <Sequencer engine={engine} accentColor="#f97316" />
        </div>

        {/* Bottom Control Strip */}
        <div className="border-t border-border-subtle bg-[#0d0d12]">
          {/* Tabs */}
          <div className="flex border-b border-border-subtle">
            <button
              onClick={() => setBottomMode('xy')}
              className={cn(
                'py-2 px-4 border-none cursor-pointer text-base font-semibold',
                bottomMode === 'xy' ? 'bg-bg-tertiary text-text-primary' : 'bg-transparent text-text-muted'
              )}
              style={{ borderBottom: bottomMode === 'xy' ? `2px solid ${COLORS.fm}` : '2px solid transparent' }}
            >
              XY
            </button>
            <button
              onClick={() => setBottomMode('keys')}
              className={cn(
                'py-2 px-4 border-none cursor-pointer text-base font-semibold',
                bottomMode === 'keys' ? 'bg-bg-tertiary text-text-primary' : 'bg-transparent text-text-muted'
              )}
              style={{ borderBottom: bottomMode === 'keys' ? `2px solid ${COLORS.fm}` : '2px solid transparent' }}
            >
              KEYS
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setBottomExpanded(!bottomExpanded)}
              className="py-2 px-4 bg-transparent border-none text-text-muted cursor-pointer text-base"
            >
              {bottomExpanded ? '\u25BC' : '\u25B2'}
            </button>
          </div>

          {/* Content */}
          <div
            className="transition-[height] duration-200 overflow-hidden flex items-center justify-center py-2 px-6"
            style={{ height: bottomExpanded ? '140px' : '50px' }}
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
    <div className="flex flex-col gap-2">
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
    <div
      className={cn(
        'flex items-center gap-1 py-1 px-1.5 rounded-sm border',
        isActive ? '' : 'bg-bg-tertiary border-border-medium'
      )}
      style={isActive ? {
        background: `${accentColor}15`,
        borderColor: accentColor,
      } : undefined}
    >
      {/* Enable toggle */}
      <button
        onClick={() => onChange(index, { enabled: !route.enabled })}
        className={cn(
          'w-5 h-5 text-sm font-bold border-none rounded-sm cursor-pointer',
          route.enabled ? 'text-black' : 'bg-border-medium text-text-tertiary'
        )}
        style={route.enabled ? { background: accentColor } : undefined}
      >
        {index + 1}
      </button>

      {/* Source selector */}
      <select
        value={route.source}
        onChange={(e) => onChange(index, { source: e.target.value as FMModSource })}
        disabled={!route.enabled}
        className={cn(
          'py-0.5 px-1 bg-bg-quaternary border border-border-bright rounded-sm text-xs flex-1 min-w-0',
          route.enabled ? 'text-text-primary cursor-pointer' : 'text-text-muted cursor-not-allowed'
        )}
      >
        {FM_MOD_SOURCES.map((src) => (
          <option key={src} value={src}>{FM_MOD_SOURCE_LABELS[src]}</option>
        ))}
      </select>

      {/* Arrow */}
      <span
        className="text-sm"
        style={{ color: route.enabled ? accentColor : '#666' }}
      >
        →
      </span>

      {/* Destination selector */}
      <select
        value={route.destination}
        onChange={(e) => onChange(index, { destination: e.target.value as FMModDestination })}
        disabled={!route.enabled}
        className={cn(
          'py-0.5 px-1 bg-bg-quaternary border border-border-bright rounded-sm text-xs flex-1 min-w-0',
          route.enabled ? 'text-text-primary cursor-pointer' : 'text-text-muted cursor-not-allowed'
        )}
      >
        {FM_MOD_DESTINATIONS.map((dest) => (
          <option key={dest} value={dest}>{FM_MOD_DEST_LABELS[dest]}</option>
        ))}
      </select>

      {/* Amount slider */}
      <div
        className={cn(
          'w-[60px] h-4 bg-bg-quaternary rounded-sm relative overflow-hidden',
          route.enabled ? 'cursor-pointer' : 'cursor-not-allowed'
        )}
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
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-bright" />
        {/* Fill */}
        {route.enabled && (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-sm"
            style={{
              left: route.amount >= 0 ? '50%' : `${(0.5 + route.amount / 2) * 100}%`,
              width: `${Math.abs(route.amount) / 2 * 100}%`,
              background: accentColor,
            }}
          />
        )}
        {/* Value label */}
        <span
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-semibold font-mono',
            route.enabled ? 'text-text-primary' : 'text-text-muted'
          )}
        >
          {route.enabled ? `${route.amount >= 0 ? '+' : ''}${Math.round(route.amount * 100)}` : '---'}
        </span>
      </div>
    </div>
  );
}
