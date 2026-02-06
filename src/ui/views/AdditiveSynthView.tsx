/**
 * Additive Synthesizer View
 * Complete additive synthesis interface with real-time spectrum analysis
 */

import { useEffect, useCallback } from 'react';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
import {
  SpectrumAnalyzer,
  AdditiveSynthPanel,
  PianoKeyboard,
  Knob,
} from '../components/index.ts';
import { PARAM_RANGES } from '../../core/types.ts';

/**
 * Section wrapper component for consistent styling
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

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
            color: '#06b6d4',
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
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}
    >
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
              color: '#06b6d4',
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
            Additive Synthesizer
          </span>
        </div>

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

      {/* Main Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Spectrum Analyzer */}
        <Section title="Spectrum Analyzer">
          <SpectrumAnalyzer
            getAnalyser={getAnalyser}
            width={720}
            height={150}
            barCount={80}
          />
        </Section>

        {/* Additive Controls */}
        <AdditiveSynthPanel
          params={params}
          onHarmonicChange={setHarmonic}
          onPreset={applyPreset}
          onAttackChange={setAmplitudeAttack}
          onDecayChange={setAmplitudeDecay}
          onSustainChange={setAmplitudeSustain}
          onReleaseChange={setAmplitudeRelease}
          onVolumeChange={setVolume}
        />

        {/* Effects Section */}
        <Section title="Effects">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Distortion */}
            <div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Distortion</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Knob label="Amt" value={params.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setDistortionAmount} formatValue={formatPercent} size={40} />
                <Knob label="Mix" value={params.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setDistortionMix} formatValue={formatPercent} size={40} />
              </div>
            </div>
            {/* Delay */}
            <div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Delay</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Knob label="Time" value={params.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={40} />
                <Knob label="FB" value={params.effects.delay.feedback} min={PARAM_RANGES.delayFeedback.min} max={PARAM_RANGES.delayFeedback.max} step={PARAM_RANGES.delayFeedback.step} onChange={setDelayFeedback} formatValue={formatPercent} size={40} />
                <Knob label="Mix" value={params.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setDelayMix} formatValue={formatPercent} size={40} />
              </div>
            </div>
            {/* Reverb */}
            <div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Reverb</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Knob label="Decay" value={params.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={40} />
                <Knob label="Mix" value={params.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setReverbMix} formatValue={formatPercent} size={40} />
              </div>
            </div>
            {/* Chorus */}
            <div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Chorus</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Knob label="Rate" value={params.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={40} />
                <Knob label="Depth" value={params.effects.chorus.depth} min={PARAM_RANGES.chorusDepth.min} max={PARAM_RANGES.chorusDepth.max} step={PARAM_RANGES.chorusDepth.step} onChange={setChorusDepth} formatValue={formatPercent} size={40} />
                <Knob label="Mix" value={params.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setChorusMix} formatValue={formatPercent} size={40} />
              </div>
            </div>
          </div>
        </Section>

        {/* Piano Keyboard */}
        <Section title="Keyboard">
          <PianoKeyboard
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            octave={3}
            octaves={3}
          />
        </Section>
      </div>
    </div>
  );
}
