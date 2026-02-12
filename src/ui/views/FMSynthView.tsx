/**
 * FM Synthesizer View
 * Horizontal signal-flow layout: FM → LFO → NOISE → VELOCITY → ARP → MOD MATRIX → AMP → OUTPUT
 */

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  Knob,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  Sequencer,
  FMVisualizer,
  EnvelopeVisualizer,
  WaveformSelector,
  XYPad,
  ArpeggiatorControls,
  StageCard,
  MiniSlider,
  AudioInitScreen,
  SynthHeader,
  GlideControls,
  VelocityControls,
  LFOStage,
  NoiseStage,
  OutputStage,
} from '../components/index.ts';
import { FMModMatrix } from '../components/synth/FMModMatrix.tsx';
import { FM_PRESETS } from '../../data/presets/fm-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { cn } from '../utils/cn.ts';
import {
  FM_PARAM_RANGES,
  HARMONICITY_PRESETS,
  type FMLFODestination,
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

// LFO destination options for FM synth
const FM_LFO_DESTINATIONS = [
  { value: 'modulationIndex', label: 'Mod Index' },
  { value: 'harmonicity', label: 'Harmonic' },
  { value: 'pitch', label: 'Pitch' },
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
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setLFODestination,
    setNoiseType,
    setNoiseLevel,
    setGlideEnabled,
    setGlideTime,
    setPan,
    setVelocityAmpAmount,
    setVelocityModIndexAmount,
    setArpEnabled,
    setArpPattern,
    setArpDivision,
    setArpOctaves,
    setArpGate,
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

  const sourceNode = useMemo(() => engine?.getOutputNode() ?? null, [engine]);

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
                <div className="text-xs font-semibold mb-1 text-[#f97316]">CARRIER</div>
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
                          isActive ? 'bg-[#f97316] text-text-primary' : 'bg-bg-tertiary text-text-muted'
                        )}
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
          <LFOStage
            title="LFO"
            color={COLORS.lfo}
            paramPrefix="fm.lfo"
            waveform={params.lfo.waveform}
            rate={params.lfo.rate}
            depth={params.lfo.depth}
            onWaveformChange={setLFOWaveform}
            onRateChange={setLFORate}
            onDepthChange={setLFODepth}
            destinations={FM_LFO_DESTINATIONS}
            currentDestination={params.lfo.destination}
            onDestinationChange={(v) => setLFODestination(v as FMLFODestination)}
          />

          {/* NOISE Stage */}
          <NoiseStage
            type={params.noise.type}
            level={params.noise.level}
            onTypeChange={setNoiseType}
            color={COLORS.noise}
            onLevelChange={setNoiseLevel}
            paramId="fm.noise.level"
          />

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
            <FMModMatrix
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
          <OutputStage
            volume={params.volume}
            pan={params.pan}
            onVolumeChange={setVolume}
            onPanChange={setPan}
            getAnalyser={getAnalyser}
            sourceNode={sourceNode}
            color={COLORS.output}
          />
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
                'py-2 px-4 border-none border-b-2 cursor-pointer text-base font-semibold',
                bottomMode === 'xy' ? 'bg-bg-tertiary text-text-primary border-b-[#f97316]' : 'bg-transparent text-text-muted border-b-transparent'
              )}
            >
              XY
            </button>
            <button
              onClick={() => setBottomMode('keys')}
              className={cn(
                'py-2 px-4 border-none border-b-2 cursor-pointer text-base font-semibold',
                bottomMode === 'keys' ? 'bg-bg-tertiary text-text-primary border-b-[#f97316]' : 'bg-transparent text-text-muted border-b-transparent'
              )}
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
            className={cn(
              'transition-[height] duration-200 overflow-hidden flex items-center justify-center py-2 px-6',
              bottomExpanded ? 'h-[140px]' : 'h-[50px]'
            )}
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
