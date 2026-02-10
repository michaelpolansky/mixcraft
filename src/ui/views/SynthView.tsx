/**
 * Main Synthesizer View
 * Horizontal signal-flow layout: OSC → FILTER → AMP → MOD → FX → OUTPUT
 */

import { useEffect, useCallback, useState } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import { useModulatedValues } from '../hooks/useModulatedValues.ts';
import {
  SpectrumAnalyzer,
  InfoPanel,
  Sequencer,
  Tooltip,
  ModMatrixGrid,
  ArpeggiatorControls,
  StageCard,
  EffectMini,
  AudioInitScreen,
  SynthHeader,
  VelocityControls,
  OscillatorStage,
  Osc2Stage,
  SubOscStage,
  NoiseStage,
  MixerStage,
  FilterStage,
  EnvelopeStage,
  LFOStage,
  OutputStage,
  BottomControlStrip,
} from '../components/index.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';
import { InfoPanelProvider, useInfoPanel } from '../context/InfoPanelContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { formatPercent } from '../utils/formatters.ts';
import { cn } from '../utils/cn.ts';

// Stage colors following signal flow
const COLORS = {
  oscillator: '#3b82f6',
  subOsc: '#1e40af',
  osc2: '#60a5fa',
  noise: '#64748b',
  filter: '#06b6d4',
  amp: '#22c55e',
  filterEnv: '#eab308',
  lfo: '#ef4444',
  lfo2: '#dc2626',
  velocity: '#fb923c',
  pitchEnv: '#f472b6',
  modEnv: '#a855f7',
  pwmEnv: '#14b8a6',
  effects: '#8b5cf6',
  output: '#f97316',
  modMatrix: '#a855f7',
  arp: '#f59e0b',
};

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
    setOscillatorType, setOctave, setDetune, setPulseWidth,
    setFilterType, setFilterCutoff, setFilterResonance, setFilterKeyTracking,
    setAmplitudeAttack, setAmplitudeDecay, setAmplitudeSustain, setAmplitudeRelease,
    setFilterEnvelopeAttack, setFilterEnvelopeDecay, setFilterEnvelopeSustain, setFilterEnvelopeRelease, setFilterEnvelopeAmount,
    setLFORate, setLFODepth, setLFOWaveform, setLFOSync, setLFOSyncDivision,
    setPitchEnvelopeAttack, setPitchEnvelopeDecay, setPitchEnvelopeSustain, setPitchEnvelopeRelease, setPitchEnvelopeAmount,
    setModEnvelopeAttack, setModEnvelopeDecay, setModEnvelopeSustain, setModEnvelopeRelease, setModEnvelopeAmount,
    setPWMEnvelopeAttack, setPWMEnvelopeDecay, setPWMEnvelopeSustain, setPWMEnvelopeRelease, setPWMEnvelopeAmount,
    setDistortionAmount, setDistortionMix,
    setDelayTime, setDelayFeedback, setDelayMix,
    setReverbDecay, setReverbMix,
    setChorusRate, setChorusDepth, setChorusMix,
    setVolume, resetToDefaults, currentPreset, loadPreset,
    setNoiseType, setNoiseLevel,
    setGlideEnabled, setGlideTime,
    setVelocityAmpAmount, setVelocityFilterAmount,
    randomize,
    setSubOscType, setSubOscOctave, setSubOscLevel,
    setOsc2Type, setOsc2Octave, setOsc2Detune, setOsc2Level,
    setUnisonEnabled, setUnisonVoices, setUnisonDetune, setUnisonSpread,
    setArpEnabled, setArpPattern, setArpDivision, setArpOctaves, setArpGate,
    arpNoteOn, arpNoteOff,
    setOsc1Level,
    setLfo2Rate, setLfo2Depth, setLfo2Type, setLfo2Enabled,
    setPan,
    setMatrixAmount,
  } = useSynthStore();

  const [bottomMode, setBottomMode] = useState<'keys' | 'xy'>('keys');
  const [bottomExpanded, setBottomExpanded] = useState(false);
  const modulatedValues = useModulatedValues();

  useEffect(() => { initEngine(); }, [initEngine]);

  const handleStartAudio = useCallback(async () => { await startAudio(); }, [startAudio]);

  const { toast } = useToast();
  const handleLoadPreset = useCallback((presetName: string) => {
    loadPreset(presetName);
    toast.success(`Loaded preset: ${presetName}`);
  }, [loadPreset, toast]);

  const handleNoteOn = useCallback((note: string) => { arpNoteOn(note); }, [arpNoteOn]);
  const handleNoteOff = useCallback((note: string) => { arpNoteOff(note); }, [arpNoteOff]);

  if (!isInitialized) {
    return (
      <AudioInitScreen
        title="MIXCRAFT"
        subtitle="Subtractive Synthesizer"
        accentColor="#4ade80"
        isInitializing={isInitializing}
        initError={initError}
        onStart={handleStartAudio}
      />
    );
  }

  return (
    <InfoPanelProvider>
      <div className="min-h-screen bg-[#0a0a0f] text-text-primary font-sans flex flex-col">
        <SynthHeader
          title="MIXCRAFT"
          subtitle="Subtractive Synthesizer"
          accentColor="#4ade80"
          presets={SUBTRACTIVE_PRESETS}
          currentPreset={currentPreset}
          onPresetSelect={handleLoadPreset}
          onRandomize={randomize}
          onReset={resetToDefaults}
          helpButton={<HelpModeButton />}
        />

        <Tooltip accentColor="#4ade80" />

        <div className="py-3 px-6 bg-[#050508]">
          <SpectrumAnalyzer width={window.innerWidth - 48} height={80} barCount={100} />
        </div>

        {/* Signal Flow */}
        <div className="flex-1 p-4 flex flex-wrap gap-4 content-start overflow-auto">
          <OscillatorStage
            params={params}
            setOscillatorType={setOscillatorType}
            setOctave={setOctave}
            setDetune={setDetune}
            setPulseWidth={setPulseWidth}
            setGlideEnabled={setGlideEnabled}
            setGlideTime={setGlideTime}
            setUnisonEnabled={setUnisonEnabled}
            setUnisonVoices={setUnisonVoices}
            setUnisonDetune={setUnisonDetune}
            setUnisonSpread={setUnisonSpread}
            modulatedPitch={modulatedValues?.pitch}
            color={COLORS.oscillator}
          />

          <EnvelopeStage
            title="PITCH ENV" color={COLORS.pitchEnv} paramPrefix="pitchEnv"
            attack={params.pitchEnvelope.attack} decay={params.pitchEnvelope.decay}
            sustain={params.pitchEnvelope.sustain} release={params.pitchEnvelope.release}
            onAttackChange={setPitchEnvelopeAttack} onDecayChange={setPitchEnvelopeDecay}
            onSustainChange={setPitchEnvelopeSustain} onReleaseChange={setPitchEnvelopeRelease}
            amount={params.pitchEnvelope.amount} onAmountChange={setPitchEnvelopeAmount}
            amountMin={-24} amountMax={24} amountStep={1}
            amountFormat={(v) => `${v > 0 ? '+' : ''}${v} st`}
            isTriggered={isPlaying}
          />

          <EnvelopeStage
            title="PWM ENV" color={COLORS.pwmEnv} paramPrefix="pwmEnv"
            attack={params.pwmEnvelope.attack} decay={params.pwmEnvelope.decay}
            sustain={params.pwmEnvelope.sustain} release={params.pwmEnvelope.release}
            onAttackChange={setPWMEnvelopeAttack} onDecayChange={setPWMEnvelopeDecay}
            onSustainChange={setPWMEnvelopeSustain} onReleaseChange={setPWMEnvelopeRelease}
            amount={params.pwmEnvelope.amount} onAmountChange={setPWMEnvelopeAmount}
            amountFormat={formatPercent}
            isTriggered={isPlaying}
          />

          <Osc2Stage
            type={params.oscillator2.type} octave={params.oscillator2.octave} detune={params.oscillator2.detune}
            onTypeChange={setOsc2Type} onOctaveChange={setOsc2Octave} onDetuneChange={setOsc2Detune}
            color={COLORS.osc2}
          />

          <SubOscStage
            type={params.subOsc.type} octave={params.subOsc.octave as -1 | -2}
            onTypeChange={setSubOscType} onOctaveChange={setSubOscOctave}
            color={COLORS.subOsc}
          />

          <NoiseStage
            type={params.noise.type} level={params.noise.level}
            onTypeChange={setNoiseType}
            color={COLORS.noise}
          />

          <MixerStage
            osc1Level={params.oscillator.level} osc2Level={params.oscillator2.level}
            subOscLevel={params.subOsc.level} noiseLevel={params.noise.level}
            onOsc1LevelChange={setOsc1Level} onOsc2LevelChange={setOsc2Level}
            onSubOscLevelChange={setSubOscLevel} onNoiseLevelChange={setNoiseLevel}
            modulatedOsc2Mix={modulatedValues?.osc2Mix}
          />

          <FilterStage
            type={params.filter.type} cutoff={params.filter.cutoff}
            resonance={params.filter.resonance} keyTracking={params.filter.keyTracking}
            onTypeChange={setFilterType} onCutoffChange={setFilterCutoff}
            onResonanceChange={setFilterResonance} onKeyTrackingChange={setFilterKeyTracking}
            modulatedCutoff={modulatedValues?.filterCutoff}
            color={COLORS.filter}
          />

          <EnvelopeStage
            title="FILTER ENV" color={COLORS.filterEnv} paramPrefix="filterEnv"
            attack={params.filterEnvelope.attack} decay={params.filterEnvelope.decay}
            sustain={params.filterEnvelope.sustain} release={params.filterEnvelope.release}
            onAttackChange={setFilterEnvelopeAttack} onDecayChange={setFilterEnvelopeDecay}
            onSustainChange={setFilterEnvelopeSustain} onReleaseChange={setFilterEnvelopeRelease}
            amount={params.filterEnvelope.amount} onAmountChange={setFilterEnvelopeAmount}
            amountMin={-4} amountMax={4} amountStep={0.1}
            amountFormat={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`}
            isTriggered={isPlaying}
          />

          <EnvelopeStage
            title="AMP" color={COLORS.amp} paramPrefix="amp"
            attack={params.amplitudeEnvelope.attack} decay={params.amplitudeEnvelope.decay}
            sustain={params.amplitudeEnvelope.sustain} release={params.amplitudeEnvelope.release}
            onAttackChange={setAmplitudeAttack} onDecayChange={setAmplitudeDecay}
            onSustainChange={setAmplitudeSustain} onReleaseChange={setAmplitudeRelease}
            isTriggered={isPlaying}
            visualizerHeight={100}
          />

          <LFOStage
            title="LFO" color={COLORS.lfo} paramPrefix="lfo"
            waveform={params.lfo.waveform} rate={params.lfo.rate} depth={params.lfo.depth}
            onWaveformChange={setLFOWaveform} onRateChange={setLFORate} onDepthChange={setLFODepth}
            modulatedRate={modulatedValues?.lfo1Rate}
            sync={params.lfo.sync} syncDivision={params.lfo.syncDivision}
            onSyncChange={setLFOSync} onSyncDivisionChange={setLFOSyncDivision}
          />

          <LFOStage
            title="LFO 2" color={COLORS.lfo2} paramPrefix="lfo2"
            waveform={params.lfo2.type} rate={params.lfo2.rate} depth={params.lfo2.depth}
            onWaveformChange={setLfo2Type} onRateChange={setLfo2Rate} onDepthChange={setLfo2Depth}
            modulatedRate={modulatedValues?.lfo2Rate}
            enabled={params.lfo2.enabled} onEnabledChange={setLfo2Enabled}
            visualizerDepthOverride={params.lfo2.enabled ? params.lfo2.depth : 0}
          />

          {/* ARP */}
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

          {/* VELOCITY */}
          <StageCard title="VELOCITY" color={COLORS.velocity}>
            <VelocityControls
              ampAmount={params.velocity.ampAmount}
              secondaryAmount={params.velocity.filterAmount}
              secondaryLabel="Filter"
              onAmpAmountChange={setVelocityAmpAmount}
              onSecondaryAmountChange={setVelocityFilterAmount}
              color={COLORS.velocity}
            />
          </StageCard>

          {/* FX */}
          <StageCard title="FX" color={COLORS.effects} wide>
            <div className="grid grid-cols-2 gap-3">
              <EffectMini name="DIST" color="#ef4444" knobs={[
                { label: 'Amt', value: params.effects.distortion.amount, onChange: setDistortionAmount, max: 1 },
                { label: 'Mix', value: params.effects.distortion.mix, onChange: setDistortionMix, max: 1 },
              ]} />
              <EffectMini name="DELAY" color="#3b82f6" knobs={[
                { label: 'Time', value: params.effects.delay.time, onChange: setDelayTime, max: 1 },
                { label: 'FB', value: params.effects.delay.feedback, onChange: setDelayFeedback, max: 0.9 },
                { label: 'Mix', value: params.effects.delay.mix, onChange: setDelayMix, max: 1 },
              ]} />
              <EffectMini name="REVERB" color="#8b5cf6" knobs={[
                { label: 'Decay', value: params.effects.reverb.decay, onChange: setReverbDecay, max: 10 },
                { label: 'Mix', value: params.effects.reverb.mix, onChange: setReverbMix, max: 1 },
              ]} />
              <EffectMini name="CHORUS" color="#06b6d4" knobs={[
                { label: 'Rate', value: params.effects.chorus.rate, onChange: setChorusRate, max: 10 },
                { label: 'Depth', value: params.effects.chorus.depth, onChange: setChorusDepth, max: 1 },
                { label: 'Mix', value: params.effects.chorus.mix, onChange: setChorusMix, max: 1 },
              ]} />
            </div>
          </StageCard>

          {/* MOD MATRIX */}
          <StageCard title="MOD MATRIX" color={COLORS.modMatrix} wide>
            <ModMatrixGrid
              grid={params.modMatrix.grid}
              onChange={setMatrixAmount}
              accentColor={COLORS.modMatrix}
            />
          </StageCard>

          <EnvelopeStage
            title="MOD ENV" color={COLORS.modEnv} paramPrefix="modEnv"
            attack={params.modEnvelope.attack} decay={params.modEnvelope.decay}
            sustain={params.modEnvelope.sustain} release={params.modEnvelope.release}
            onAttackChange={setModEnvelopeAttack} onDecayChange={setModEnvelopeDecay}
            onSustainChange={setModEnvelopeSustain} onReleaseChange={setModEnvelopeRelease}
            amount={params.modEnvelope.amount} onAmountChange={setModEnvelopeAmount}
            amountFormat={formatPercent}
            isTriggered={isPlaying}
          />

          <OutputStage
            volume={params.volume} pan={params.pan}
            onVolumeChange={setVolume} onPanChange={setPan}
            engine={engine}
            modulatedAmplitude={modulatedValues?.amplitude}
            modulatedPan={modulatedValues?.pan}
            color={COLORS.output}
          />
        </div>

        {/* Sequencer */}
        <div className="py-3 px-6 border-t border-border-subtle">
          <Sequencer engine={engine} accentColor="#4ade80" />
        </div>

        <BottomControlStrip
          mode={bottomMode}
          expanded={bottomExpanded}
          onModeChange={setBottomMode}
          onExpandedChange={setBottomExpanded}
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
          filterCutoff={params.filter.cutoff}
          filterResonance={params.filter.resonance}
          onFilterCutoffChange={setFilterCutoff}
          onFilterResonanceChange={setFilterResonance}
          filterColor={COLORS.filter}
        />

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
      className={cn(
        'py-1.5 px-3 rounded-sm cursor-pointer text-base font-semibold flex items-center gap-1',
        helpMode
          ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 border-none text-white'
          : 'bg-bg-secondary border border-border-medium text-text-muted'
      )}
      title={helpMode ? 'Disable help tooltips' : 'Enable help tooltips'}
    >
      <span className="text-xl">?</span>
      {helpMode ? 'Help ON' : 'Help'}
    </button>
  );
}
