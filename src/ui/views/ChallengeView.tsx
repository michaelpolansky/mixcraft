/**
 * Challenge View
 * Main view for playing "Recreate This Sound" challenges
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import { useChallengeStore } from '../stores/challenge-store.ts';
import {
  Knob,
  Slider,
  WaveformSelector,
  FilterTypeSelector,
  LFOWaveformSelector,
  SpectrumAnalyzer,
  EnvelopeDisplay,
  TargetPlayer,
  ResultsModal,
} from '../components/index.ts';
import { PARAM_RANGES } from '../../core/types.ts';
import { SynthEngine, createSynthEngine } from '../../core/synth-engine.ts';
import { captureAndAnalyze, initMeyda } from '../../core/sound-analysis.ts';
import { compareSounds } from '../../core/sound-comparison.ts';
import { getNextChallenge } from '../../data/challenges/index.ts';

interface ChallengeViewProps {
  onExit: () => void;
}

export function ChallengeView({ onExit }: ChallengeViewProps) {
  // Synth store for player's sound
  const {
    params,
    engine,
    isInitialized,
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
  } = useSynthStore();

  // Challenge store
  const {
    currentChallenge,
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    revealHint,
    startScoring,
    submitResult,
    nextChallenge,
    retry,
  } = useChallengeStore();

  // Reference synth for playing target sounds
  const targetSynthRef = useRef<SynthEngine | null>(null);

  // Initialize target synth when challenge loads
  useEffect(() => {
    if (currentChallenge && isInitialized) {
      targetSynthRef.current = createSynthEngine(currentChallenge.targetParams);
      targetSynthRef.current.start();

      // Initialize audio analysis (no-op, kept for API compatibility)
      initMeyda(44100, 2048);
    }

    return () => {
      if (targetSynthRef.current) {
        targetSynthRef.current.dispose();
        targetSynthRef.current = null;
      }
    };
  }, [currentChallenge, isInitialized]);

  // Play target sound
  const playTarget = useCallback(() => {
    if (!targetSynthRef.current || !currentChallenge) return;
    targetSynthRef.current.triggerAttackRelease(currentChallenge.testNote, '4n');
  }, [currentChallenge]);

  // Play player's sound
  const playYours = useCallback(() => {
    if (!engine || !currentChallenge) return;
    engine.triggerAttackRelease(currentChallenge.testNote, '4n');
  }, [engine, currentChallenge]);

  // Compare (play target then yours)
  const playCompare = useCallback(() => {
    playTarget();
    setTimeout(() => {
      playYours();
    }, 800); // Wait for target to finish
  }, [playTarget, playYours]);

  // Submit and score
  const handleSubmit = useCallback(async () => {
    if (!engine || !targetSynthRef.current || !currentChallenge) return;

    startScoring();

    try {
      // Capture and analyze player's sound
      const playerFeatures = await captureAndAnalyze(
        engine.getAnalyser(),
        () => engine.triggerAttack(currentChallenge.testNote),
        () => engine.triggerRelease()
      );

      // Capture and analyze target sound
      const targetFeatures = await captureAndAnalyze(
        targetSynthRef.current.getAnalyser(),
        () => targetSynthRef.current!.triggerAttack(currentChallenge.testNote),
        () => targetSynthRef.current!.triggerRelease()
      );

      // Compare and score
      const result = compareSounds(
        playerFeatures,
        targetFeatures,
        params,
        currentChallenge.targetParams
      );

      submitResult(result);
    } catch (error) {
      console.error('Scoring failed:', error);
      // Show a basic result on error
      submitResult({
        overall: 0,
        stars: 1,
        breakdown: {
          brightness: { score: 0, feedback: 'Error analyzing sound' },
          attack: { score: 0, feedback: '' },
          filter: { score: 0, feedback: '' },
          envelope: { score: 0, feedback: '' },
        },
        passed: false,
      });
    }
  }, [engine, currentChallenge, params, startScoring, submitResult]);

  // Format helpers
  const formatHz = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`);
  const formatMs = (value: number) => (value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`);
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  const formatOctave = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
  const formatCents = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;

  if (!currentChallenge) {
    return (
      <div style={{ padding: '24px', color: '#888' }}>
        No challenge loaded.
        <button onClick={onExit} style={{ marginLeft: '16px' }}>
          Back
        </button>
      </div>
    );
  }

  const hasNext = !!getNextChallenge(currentChallenge.id);

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
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <button
            onClick={onExit}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '8px',
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              margin: 0,
              color: '#fff',
            }}
          >
            {currentChallenge.title}
          </h1>
          <p
            style={{
              color: '#888',
              margin: '8px 0 0 0',
              fontSize: '14px',
              maxWidth: '500px',
            }}
          >
            {currentChallenge.description}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Attempt {currentAttempt}
          </div>
          <div style={{ color: '#eab308', fontSize: '18px' }}>
            {'★'.repeat(currentChallenge.difficulty)}
            {'☆'.repeat(3 - currentChallenge.difficulty)}
          </div>
        </div>
      </div>

      {/* Target Player */}
      <div style={{ marginBottom: '24px' }}>
        <TargetPlayer
          onPlayTarget={playTarget}
          onPlayYours={playYours}
          onCompare={playCompare}
          disabled={isScoring}
        />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Oscillator */}
          <Section title="Oscillator">
            <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} />
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
              <Knob
                label="Octave"
                value={params.oscillator.octave}
                min={PARAM_RANGES.octave.min}
                max={PARAM_RANGES.octave.max}
                step={PARAM_RANGES.octave.step}
                onChange={setOctave}
                formatValue={formatOctave}
              />
              <Knob
                label="Detune"
                value={params.oscillator.detune}
                min={PARAM_RANGES.detune.min}
                max={PARAM_RANGES.detune.max}
                step={PARAM_RANGES.detune.step}
                onChange={setDetune}
                formatValue={formatCents}
              />
            </div>
          </Section>

          {/* Filter */}
          <Section title="Filter">
            <FilterTypeSelector value={params.filter.type} onChange={setFilterType} />
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
              <Knob
                label="Cutoff"
                value={params.filter.cutoff}
                min={PARAM_RANGES.cutoff.min}
                max={PARAM_RANGES.cutoff.max}
                onChange={setFilterCutoff}
                formatValue={formatHz}
                logarithmic
              />
              <Knob
                label="Resonance"
                value={params.filter.resonance}
                min={PARAM_RANGES.resonance.min}
                max={PARAM_RANGES.resonance.max}
                step={PARAM_RANGES.resonance.step}
                onChange={setFilterResonance}
                formatValue={(v) => v.toFixed(1)}
              />
            </div>
          </Section>

          {/* Amplitude Envelope */}
          <Section title="Amplitude Envelope">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <EnvelopeDisplay envelope={params.amplitudeEnvelope} width={120} height={60} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider label="A" value={params.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={setAmplitudeAttack} formatValue={formatMs} logarithmic height={80} />
                <Slider label="D" value={params.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={setAmplitudeDecay} formatValue={formatMs} logarithmic height={80} />
                <Slider label="S" value={params.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={setAmplitudeSustain} formatValue={formatPercent} height={80} />
                <Slider label="R" value={params.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={setAmplitudeRelease} formatValue={formatMs} logarithmic height={80} />
              </div>
            </div>
          </Section>

          {/* Filter Envelope */}
          <Section title="Filter Envelope">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <EnvelopeDisplay envelope={params.filterEnvelope} width={120} height={60} color="#3b82f6" />
                <div style={{ marginTop: '8px' }}>
                  <Knob
                    label="Amount"
                    value={params.filterEnvelope.amount}
                    min={PARAM_RANGES.filterEnvAmount.min}
                    max={PARAM_RANGES.filterEnvAmount.max}
                    step={PARAM_RANGES.filterEnvAmount.step}
                    onChange={setFilterEnvelopeAmount}
                    formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`}
                    size={40}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider label="A" value={params.filterEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={setFilterEnvelopeAttack} formatValue={formatMs} logarithmic height={80} />
                <Slider label="D" value={params.filterEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={setFilterEnvelopeDecay} formatValue={formatMs} logarithmic height={80} />
                <Slider label="S" value={params.filterEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={setFilterEnvelopeSustain} formatValue={formatPercent} height={80} />
                <Slider label="R" value={params.filterEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={setFilterEnvelopeRelease} formatValue={formatMs} logarithmic height={80} />
              </div>
            </div>
          </Section>

          {/* LFO */}
          <Section title="LFO (Filter Modulation)">
            <LFOWaveformSelector value={params.lfo.waveform} onChange={setLFOWaveform} compact />
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
              <Knob
                label="Rate"
                value={params.lfo.rate}
                min={PARAM_RANGES.lfoRate.min}
                max={PARAM_RANGES.lfoRate.max}
                step={PARAM_RANGES.lfoRate.step}
                onChange={setLFORate}
                formatValue={(v) => `${v.toFixed(1)}Hz`}
              />
              <Knob
                label="Depth"
                value={params.lfo.depth}
                min={PARAM_RANGES.lfoDepth.min}
                max={PARAM_RANGES.lfoDepth.max}
                step={PARAM_RANGES.lfoDepth.step}
                onChange={setLFODepth}
                formatValue={formatPercent}
              />
            </div>
          </Section>

          {/* Effects */}
          <Section title="Effects">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Distortion */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Distortion</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Amt" value={params.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setDistortionAmount} formatValue={formatPercent} size={36} />
                  <Knob label="Mix" value={params.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setDistortionMix} formatValue={formatPercent} size={36} />
                </div>
              </div>
              {/* Delay */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Delay</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Time" value={params.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={36} />
                  <Knob label="Mix" value={params.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setDelayMix} formatValue={formatPercent} size={36} />
                </div>
              </div>
              {/* Reverb */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Reverb</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Decay" value={params.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={36} />
                  <Knob label="Mix" value={params.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setReverbMix} formatValue={formatPercent} size={36} />
                </div>
              </div>
              {/* Chorus */}
              <div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Chorus</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Knob label="Rate" value={params.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={36} />
                  <Knob label="Mix" value={params.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setChorusMix} formatValue={formatPercent} size={36} />
                </div>
              </div>
            </div>
          </Section>

          {/* Volume */}
          <Section title="Output">
            <Knob
              label="Volume"
              value={params.volume}
              min={PARAM_RANGES.volume.min}
              max={PARAM_RANGES.volume.max}
              step={PARAM_RANGES.volume.step}
              onChange={setVolume}
              formatValue={formatDb}
              size={48}
            />
          </Section>
        </div>

        {/* Right Column - Visualization & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Spectrum */}
          <Section title="Spectrum Analyzer">
            <SpectrumAnalyzer width={450} height={200} barCount={64} />
          </Section>

          {/* Hints */}
          <Section title="Hints">
            <div style={{ minHeight: '80px' }}>
              {currentChallenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  style={{
                    color: '#888',
                    fontSize: '13px',
                    marginBottom: '8px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid #333',
                  }}
                >
                  {hint}
                </div>
              ))}

              {hintsRevealed < currentChallenge.hints.length && (
                <button
                  onClick={revealHint}
                  style={{
                    background: 'none',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '6px 12px',
                  }}
                >
                  💡 Reveal Hint ({hintsRevealed + 1}/{currentChallenge.hints.length})
                </button>
              )}
            </div>
          </Section>

          {/* Submit */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleSubmit}
              disabled={isScoring}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: isScoring
                  ? '#333'
                  : 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: isScoring ? 'wait' : 'pointer',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {isScoring ? 'Scoring...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {lastResult && (
        <ResultsModal
          result={lastResult}
          playerParams={params}
          targetParams={currentChallenge.targetParams}
          challenge={currentChallenge}
          attemptNumber={currentAttempt}
          onRetry={retry}
          onNext={nextChallenge}
          hasNextChallenge={hasNext}
        />
      )}
    </div>
  );
}

/**
 * Section wrapper
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
