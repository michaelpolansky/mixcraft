/**
 * FM Synthesizer View
 * Ableton Learning Synths-style centered layout with large interactive visualizations
 */

import { useEffect, useCallback } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  Knob,
  Slider,
  SpectrumAnalyzer,
  PianoKeyboard,
  InfoPanel,
  PresetDropdown,
  Sequencer,
  RecordingControl,
  FMVisualizer,
  EnvelopeVisualizer,
  WaveformSelector,
} from '../components/index.ts';
import { FM_PRESETS } from '../../data/presets/fm-presets.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';

// Module colors
const COLORS = {
  fm: '#f97316',
  envelope: '#22c55e',
  output: '#ef4444',
};

export function FMSynthView() {
  const {
    params,
    engine,
    isInitialized,
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
  } = useFMSynthStore();

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
        <h1 style={{ fontSize: '32px', fontWeight: 300, marginBottom: '8px', color: '#f97316' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          FM Synthesizer
        </p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #f97316, #ea580c)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
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
              <h1 style={{ fontSize: '24px', fontWeight: 300, margin: 0, color: '#f97316' }}>
                MIXCRAFT
              </h1>
              <span style={{ fontSize: '12px', color: '#666' }}>
                FM Synthesizer
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <PresetDropdown
                presets={FM_PRESETS}
                currentPreset={currentPreset}
                onSelect={loadPreset}
                accentColor="#f97316"
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

          {/* FM Synthesis Module */}
          <ModuleSection title="FM SYNTHESIS" color={COLORS.fm}>
            <FMVisualizer
              carrierType={params.carrierType}
              modulatorType={params.modulatorType}
              harmonicity={params.harmonicity}
              modulationIndex={params.modulationIndex}
              width={600}
              height={200}
              accentColor={COLORS.fm}
            />

            {/* Carrier & Modulator Waveforms */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#f97316', marginBottom: '8px', fontWeight: 600 }}>CARRIER</div>
                  <WaveformSelector value={params.carrierType} onChange={setCarrierType} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>MODULATOR</div>
                  <WaveformSelector value={params.modulatorType} onChange={setModulatorType} />
                </div>
              </div>
            </div>

            {/* FM Parameters */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Knob
                  label="Harmonicity"
                  value={params.harmonicity}
                  min={FM_PARAM_RANGES.harmonicity.min}
                  max={FM_PARAM_RANGES.harmonicity.max}
                  step={FM_PARAM_RANGES.harmonicity.step}
                  onChange={setHarmonicity}
                  formatValue={(v) => v.toFixed(2)}
                  size={64}
                  paramId="fm.harmonicity"
                />
                {/* Harmonicity presets */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '120px' }}>
                  {HARMONICITY_PRESETS.map((value) => (
                    <button
                      key={value}
                      onClick={() => setHarmonicity(value)}
                      style={{
                        padding: '4px 8px',
                        background: Math.abs(params.harmonicity - value) < 0.01 ? '#f97316' : '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: Math.abs(params.harmonicity - value) < 0.01 ? '#fff' : '#888',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      {value}:1
                    </button>
                  ))}
                </div>
              </div>

              <Knob
                label="Mod Index"
                value={params.modulationIndex}
                min={FM_PARAM_RANGES.modulationIndex.min}
                max={FM_PARAM_RANGES.modulationIndex.max}
                step={FM_PARAM_RANGES.modulationIndex.step}
                onChange={setModulationIndex}
                formatValue={(v) => v.toFixed(1)}
                size={64}
                paramId="fm.modulationIndex"
              />

              <Knob
                label="Mod Env"
                value={params.modulationEnvelopeAmount}
                min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
                max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
                step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
                onChange={setModulationEnvelopeAmount}
                formatValue={(v) => v.toFixed(1)}
                size={64}
                paramId="fm.modEnvAmount"
              />
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
          <ModuleSection title="SEQUENCER" color="#f97316">
            <Sequencer
              engine={engine}
              accentColor="#f97316"
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

        <InfoPanel accentColor="#f97316" />
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
