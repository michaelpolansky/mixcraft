/**
 * Main Synthesizer View
 * Complete subtractive synth interface with real-time spectrum analysis
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
  EnvelopeDisplay,
  PianoKeyboard,
  InfoPanel,
  XYPad,
  PresetDropdown,
  Sequencer,
  ModuleCard,
  MODULE_COLORS,
  WaveformIcon,
  RecordingControl,
} from '../components/index.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES } from '../../core/types.ts';


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

  // XY Pad value conversions (using logarithmic scale for cutoff)
  const cutoffRange: [number, number] = [200, 8000];
  const resonanceRange: [number, number] = [0, 20];

  // Convert actual cutoff to normalized (logarithmic)
  const cutoffToNormalized = (cutoff: number): number => {
    const minLog = Math.log(cutoffRange[0]);
    const maxLog = Math.log(cutoffRange[1]);
    return (Math.log(cutoff) - minLog) / (maxLog - minLog);
  };

  // Convert normalized to actual cutoff (logarithmic)
  const normalizedToCutoff = (normalized: number): number => {
    const minLog = Math.log(cutoffRange[0]);
    const maxLog = Math.log(cutoffRange[1]);
    return Math.exp(minLog + normalized * (maxLog - minLog));
  };

  // Resonance is linear
  const resonanceToNormalized = (resonance: number): number => {
    return (resonance - resonanceRange[0]) / (resonanceRange[1] - resonanceRange[0]);
  };

  const normalizedToResonance = (normalized: number): number => {
    return resonanceRange[0] + normalized * (resonanceRange[1] - resonanceRange[0]);
  };

  // XY Pad change handlers
  const handleXYPadXChange = useCallback((normalized: number) => {
    const cutoff = normalizedToCutoff(normalized);
    setFilterCutoff(Math.round(cutoff));
  }, [setFilterCutoff]);

  const handleXYPadYChange = useCallback((normalized: number) => {
    const resonance = normalizedToResonance(normalized);
    setFilterResonance(Math.round(resonance * 10) / 10);
  }, [setFilterResonance]);

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
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 300,
            marginBottom: '8px',
            color: '#4ade80',
          }}
        >
          MIXCRAFT
        </h1>
        <p
          style={{
            color: '#666',
            marginBottom: '32px',
          }}
        >
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
        <p
          style={{
            color: '#444',
            fontSize: '12px',
            marginTop: '16px',
          }}
        >
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
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
    <div style={{ padding: '24px', flex: 1 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 300,
              margin: 0,
              color: '#4ade80',
            }}
          >
            MIXCRAFT
          </h1>
          <span
            style={{
              fontSize: '12px',
              color: '#666',
            }}
          >
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

      {/* Main Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          maxWidth: '1200px',
        }}
      >
        {/* Left Column - Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* XY Pad - Filter Control */}
          <ModuleCard
            title="Filter XY Pad"
            color={MODULE_COLORS.xypad}
            icon={<WaveformIcon type="filter" size={20} color={MODULE_COLORS.xypad} animated={false} />}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <XYPad
                xValue={cutoffToNormalized(params.filter.cutoff)}
                yValue={resonanceToNormalized(params.filter.resonance)}
                xLabel="Cutoff"
                yLabel="Resonance"
                xRange={cutoffRange}
                yRange={resonanceRange}
                onXChange={handleXYPadXChange}
                onYChange={handleXYPadYChange}
                size={200}
                accentColor="#4ade80"
                formatXValue={formatHz}
                formatYValue={(v) => v.toFixed(1)}
              />
            </div>
          </ModuleCard>

          {/* Oscillator Section */}
          <ModuleCard
            title="Oscillator"
            color={MODULE_COLORS.oscillator}
            icon={<WaveformIcon type={params.oscillator.type} size={20} color={MODULE_COLORS.oscillator} />}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <WaveformSelector
                value={params.oscillator.type}
                onChange={setOscillatorType}
              />

              <div style={{ display: 'flex', gap: '24px' }}>
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
          </ModuleCard>

          {/* Filter Section */}
          <ModuleCard
            title="Filter"
            color={MODULE_COLORS.filter}
            icon={<WaveformIcon type="filter" size={20} color={MODULE_COLORS.filter} animated={false} />}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <FilterTypeSelector
                value={params.filter.type}
                onChange={setFilterType}
              />

              <div style={{ display: 'flex', gap: '24px' }}>
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
          </ModuleCard>

          {/* Amplitude Envelope */}
          <ModuleCard
            title="Amplitude Envelope"
            color={MODULE_COLORS.ampEnvelope}
            icon={<WaveformIcon type="envelope" size={20} color={MODULE_COLORS.ampEnvelope} animated={false} />}
          >
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <EnvelopeDisplay
                envelope={params.amplitudeEnvelope}
                width={140}
                height={70}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider
                  label="A"
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
                  label="D"
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
                  label="S"
                  value={params.amplitudeEnvelope.sustain}
                  min={PARAM_RANGES.sustain.min}
                  max={PARAM_RANGES.sustain.max}
                  step={PARAM_RANGES.sustain.step}
                  onChange={setAmplitudeSustain}
                  formatValue={formatPercent}
                  paramId="amplitude.sustain"
                />
                <Slider
                  label="R"
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
            </div>
          </ModuleCard>

          {/* Filter Envelope */}
          <ModuleCard
            title="Filter Envelope"
            color={MODULE_COLORS.filterEnvelope}
            icon={<WaveformIcon type="envelope" size={20} color={MODULE_COLORS.filterEnvelope} animated={false} />}
          >
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <EnvelopeDisplay
                  envelope={params.filterEnvelope}
                  width={140}
                  height={70}
                  color="#3b82f6"
                />
                <Knob
                  label="Amount"
                  value={params.filterEnvelope.amount}
                  min={PARAM_RANGES.filterEnvAmount.min}
                  max={PARAM_RANGES.filterEnvAmount.max}
                  step={PARAM_RANGES.filterEnvAmount.step}
                  onChange={setFilterEnvelopeAmount}
                  formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} oct`}
                  size={48}
                  paramId="filterEnv.amount"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider
                  label="A"
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
                  label="D"
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
                  label="S"
                  value={params.filterEnvelope.sustain}
                  min={PARAM_RANGES.sustain.min}
                  max={PARAM_RANGES.sustain.max}
                  step={PARAM_RANGES.sustain.step}
                  onChange={setFilterEnvelopeSustain}
                  formatValue={formatPercent}
                  paramId="filterEnv.sustain"
                />
                <Slider
                  label="R"
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
            </div>
          </ModuleCard>

          {/* LFO */}
          <ModuleCard
            title="LFO (Filter Modulation)"
            color={MODULE_COLORS.lfo}
            icon={<WaveformIcon type="sine" size={20} color={MODULE_COLORS.lfo} />}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <LFOWaveformSelector
                value={params.lfo.waveform}
                onChange={setLFOWaveform}
              />

              <div style={{ display: 'flex', gap: '24px' }}>
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
          </ModuleCard>

          {/* Effects */}
          <ModuleCard
            title="Effects"
            color={MODULE_COLORS.effects}
            icon={<WaveformIcon type="noise" size={20} color={MODULE_COLORS.effects} animated={false} />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Distortion */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Distortion</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Amt" value={params.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setDistortionAmount} formatValue={formatPercent} size={40} paramId="distortion.amount" />
                  <Knob label="Mix" value={params.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setDistortionMix} formatValue={formatPercent} size={40} paramId="distortion.mix" />
                </div>
              </div>
              {/* Delay */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Delay</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Time" value={params.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={40} paramId="delay.time" />
                  <Knob label="FB" value={params.effects.delay.feedback} min={PARAM_RANGES.delayFeedback.min} max={PARAM_RANGES.delayFeedback.max} step={PARAM_RANGES.delayFeedback.step} onChange={setDelayFeedback} formatValue={formatPercent} size={40} paramId="delay.feedback" />
                  <Knob label="Mix" value={params.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setDelayMix} formatValue={formatPercent} size={40} paramId="delay.mix" />
                </div>
              </div>
              {/* Reverb */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Reverb</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Decay" value={params.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={40} paramId="reverb.decay" />
                  <Knob label="Mix" value={params.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setReverbMix} formatValue={formatPercent} size={40} paramId="reverb.mix" />
                </div>
              </div>
              {/* Chorus */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Chorus</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Rate" value={params.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={40} paramId="chorus.rate" />
                  <Knob label="Depth" value={params.effects.chorus.depth} min={PARAM_RANGES.chorusDepth.min} max={PARAM_RANGES.chorusDepth.max} step={PARAM_RANGES.chorusDepth.step} onChange={setChorusDepth} formatValue={formatPercent} size={40} paramId="chorus.depth" />
                  <Knob label="Mix" value={params.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setChorusMix} formatValue={formatPercent} size={40} paramId="chorus.mix" />
                </div>
              </div>
            </div>
          </ModuleCard>

          {/* Volume */}
          <ModuleCard
            title="Output"
            color={MODULE_COLORS.output}
            icon={<WaveformIcon type="speaker" size={20} color={MODULE_COLORS.output} animated={false} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Knob
                  label="Volume"
                  value={params.volume}
                  min={PARAM_RANGES.volume.min}
                  max={PARAM_RANGES.volume.max}
                  step={PARAM_RANGES.volume.step}
                  onChange={setVolume}
                  formatValue={formatDb}
                  size={56}
                  paramId="volume"
                />
              </div>
              <RecordingControl
                sourceNode={engine?.getOutputNode() ?? null}
                accentColor="#ef4444"
              />
            </div>
          </ModuleCard>
        </div>

        {/* Right Column - Visualization & Keyboard */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Spectrum Analyzer */}
          <ModuleCard
            title="Spectrum Analyzer"
            color={MODULE_COLORS.spectrum}
            icon={<WaveformIcon type="harmonics" size={20} color={MODULE_COLORS.spectrum} />}
          >
            <SpectrumAnalyzer width={500} height={250} barCount={80} />
          </ModuleCard>

          {/* Sequencer */}
          <ModuleCard
            title="Sequencer"
            color={MODULE_COLORS.sequencer}
          >
            <Sequencer
              engine={engine}
              accentColor="#4ade80"
            />
          </ModuleCard>

          {/* Keyboard */}
          <ModuleCard
            title="Keyboard"
            color={MODULE_COLORS.keyboard}
          >
            <PianoKeyboard
              onNoteOn={playNote}
              onNoteOff={stopNote}
              octave={4}
              octaves={2}
            />
          </ModuleCard>
        </div>
      </div>
    </div>
    <InfoPanel />
    </div>
    </InfoPanelProvider>
  );
}
