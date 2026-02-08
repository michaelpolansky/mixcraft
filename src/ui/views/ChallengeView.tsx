/**
 * Challenge View
 * Main view for playing "Recreate This Sound" challenges
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
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
  CarrierModulatorViz,
  HarmonicDrawbars,
  InfoPanel,
  Oscilloscope,
  FilterResponse,
  EnvelopeVisualizerReadOnly,
  LFOVisualizer,
  EffectsVisualizer,
} from '../components/index.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { PARAM_RANGES, FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';
import type { SynthParams, FMSynthParams, AdditiveSynthParams } from '../../core/types.ts';
import { SynthEngine, createSynthEngine } from '../../core/synth-engine.ts';
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import { captureAndAnalyze, initMeyda } from '../../core/sound-analysis.ts';
import { compareSounds, compareFMParams, compareAdditiveParams } from '../../core/sound-comparison.ts';
import { getNextChallenge } from '../../data/challenges/index.ts';

interface ChallengeViewProps {
  onExit: () => void;
}

export function ChallengeView({ onExit }: ChallengeViewProps) {
  // Synth store for player's subtractive sound
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

  // FM Synth store for player's FM sound
  const {
    params: fmParams,
    engine: fmEngine,
    isInitialized: fmIsInitialized,
    setHarmonicity,
    setHarmonicityPreset,
    setModulationIndex,
    setCarrierType,
    setModulatorType,
    setModulationEnvelopeAmount,
    setAmplitudeAttack: setFMAttack,
    setAmplitudeDecay: setFMDecay,
    setAmplitudeSustain: setFMSustain,
    setAmplitudeRelease: setFMRelease,
    setDistortionAmount: setFMDistortionAmount,
    setDistortionMix: setFMDistortionMix,
    setDelayTime: setFMDelayTime,
    setDelayFeedback: setFMDelayFeedback,
    setDelayMix: setFMDelayMix,
    setReverbDecay: setFMReverbDecay,
    setReverbMix: setFMReverbMix,
    setChorusRate: setFMChorusRate,
    setChorusDepth: setFMChorusDepth,
    setChorusMix: setFMChorusMix,
    setVolume: setFMVolume,
    initEngine: initFMEngine,
    startAudio: startFMAudio,
  } = useFMSynthStore();

  // Additive Synth store for player's additive sound
  const {
    params: additiveParams,
    engine: additiveEngine,
    isInitialized: additiveIsInitialized,
    setHarmonic: setAdditiveHarmonic,
    applyPreset: applyAdditivePreset,
    setAmplitudeAttack: setAdditiveAttack,
    setAmplitudeDecay: setAdditiveDecay,
    setAmplitudeSustain: setAdditiveSustain,
    setAmplitudeRelease: setAdditiveRelease,
    setDistortionAmount: setAdditiveDistortionAmount,
    setDistortionMix: setAdditiveDistortionMix,
    setDelayTime: setAdditiveDelayTime,
    setDelayFeedback: setAdditiveDelayFeedback,
    setDelayMix: setAdditiveDelayMix,
    setReverbDecay: setAdditiveReverbDecay,
    setReverbMix: setAdditiveReverbMix,
    setChorusRate: setAdditiveChorusRate,
    setChorusDepth: setAdditiveChorusDepth,
    setChorusMix: setAdditiveChorusMix,
    setVolume: setAdditiveVolume,
    initEngine: initAdditiveEngine,
    startAudio: startAdditiveAudio,
  } = useAdditiveSynthStore();

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

  // Reference synth for playing target sounds (supports all synth types)
  const targetSynthRef = useRef<SynthEngine | null>(null);
  const targetFMSynthRef = useRef<FMSynthEngine | null>(null);
  const targetAdditiveSynthRef = useRef<AdditiveSynthEngine | null>(null);

  // Determine synthesis type from challenge
  const synthesisType = currentChallenge?.synthesisType ?? 'subtractive';
  const isFM = synthesisType === 'fm';
  const isAdditive = synthesisType === 'additive';

  // Initialize FM engine when FM challenge loads
  useEffect(() => {
    if (currentChallenge && isFM && !fmIsInitialized) {
      initFMEngine();
      startFMAudio();
    }
  }, [currentChallenge, isFM, fmIsInitialized, initFMEngine, startFMAudio]);

  // Initialize Additive engine when additive challenge loads
  useEffect(() => {
    if (currentChallenge && isAdditive && !additiveIsInitialized) {
      initAdditiveEngine();
      startAdditiveAudio();
    }
  }, [currentChallenge, isAdditive, additiveIsInitialized, initAdditiveEngine, startAdditiveAudio]);

  // Initialize target synth when challenge loads
  useEffect(() => {
    if (!currentChallenge) return;

    // Initialize audio analysis (no-op, kept for API compatibility)
    initMeyda(44100, 2048);

    if (isFM) {
      // FM challenge - create FM target synth
      if (fmIsInitialized) {
        targetFMSynthRef.current = createFMSynthEngine(currentChallenge.targetParams as FMSynthParams);
        targetFMSynthRef.current.start();
      }
    } else if (isAdditive) {
      // Additive challenge - create additive target synth
      if (additiveIsInitialized) {
        targetAdditiveSynthRef.current = createAdditiveSynthEngine(currentChallenge.targetParams as AdditiveSynthParams);
        targetAdditiveSynthRef.current.start();
      }
    } else {
      // Subtractive challenge - create subtractive target synth
      if (isInitialized) {
        targetSynthRef.current = createSynthEngine(currentChallenge.targetParams as SynthParams);
        targetSynthRef.current.start();
      }
    }

    return () => {
      if (targetSynthRef.current) {
        targetSynthRef.current.dispose();
        targetSynthRef.current = null;
      }
      if (targetFMSynthRef.current) {
        targetFMSynthRef.current.dispose();
        targetFMSynthRef.current = null;
      }
      if (targetAdditiveSynthRef.current) {
        targetAdditiveSynthRef.current.dispose();
        targetAdditiveSynthRef.current = null;
      }
    };
  }, [currentChallenge, isInitialized, fmIsInitialized, additiveIsInitialized, isFM, isAdditive]);

  // Play target sound
  const playTarget = useCallback(() => {
    if (!currentChallenge) return;
    if (isFM) {
      if (!targetFMSynthRef.current) return;
      targetFMSynthRef.current.triggerAttackRelease(currentChallenge.testNote, '4n');
    } else if (isAdditive) {
      if (!targetAdditiveSynthRef.current) return;
      targetAdditiveSynthRef.current.triggerAttackRelease(currentChallenge.testNote, '4n');
    } else {
      if (!targetSynthRef.current) return;
      targetSynthRef.current.triggerAttackRelease(currentChallenge.testNote, '4n');
    }
  }, [currentChallenge, isFM, isAdditive]);

  // Play player's sound
  const playYours = useCallback(() => {
    if (!currentChallenge) return;
    if (isFM) {
      if (!fmEngine) return;
      fmEngine.triggerAttackRelease(currentChallenge.testNote, '4n');
    } else if (isAdditive) {
      if (!additiveEngine) return;
      additiveEngine.triggerAttackRelease(currentChallenge.testNote, '4n');
    } else {
      if (!engine) return;
      engine.triggerAttackRelease(currentChallenge.testNote, '4n');
    }
  }, [engine, fmEngine, additiveEngine, currentChallenge, isFM, isAdditive]);

  // Compare (play target then yours)
  const playCompare = useCallback(() => {
    playTarget();
    setTimeout(() => {
      playYours();
    }, 800); // Wait for target to finish
  }, [playTarget, playYours]);

  // Submit and score
  const handleSubmit = useCallback(async () => {
    if (!currentChallenge) return;

    // Check we have the right engine ready
    if (isFM) {
      if (!fmEngine || !targetFMSynthRef.current) return;
    } else if (isAdditive) {
      if (!additiveEngine || !targetAdditiveSynthRef.current) return;
    } else {
      if (!engine || !targetSynthRef.current) return;
    }

    startScoring();

    try {
      if (isFM) {
        // FM challenge scoring
        const playerFeatures = await captureAndAnalyze(
          fmEngine!.getAnalyser(),
          () => fmEngine!.triggerAttack(currentChallenge.testNote),
          () => fmEngine!.triggerRelease()
        );

        const targetFeatures = await captureAndAnalyze(
          targetFMSynthRef.current!.getAnalyser(),
          () => targetFMSynthRef.current!.triggerAttack(currentChallenge.testNote),
          () => targetFMSynthRef.current!.triggerRelease()
        );

        // Use FM-specific comparison (audio features + FM params)
        const audioResult = compareSounds(
          playerFeatures,
          targetFeatures,
          fmParams,
          currentChallenge.targetParams
        );

        // Blend with FM parameter comparison
        const fmParamResult = compareFMParams(
          fmParams,
          currentChallenge.targetParams as FMSynthParams
        );

        // Weight: 70% audio, 30% params
        const blendedScore = audioResult.overall * 0.7 + fmParamResult.score * 0.3;
        const stars = blendedScore >= 90 ? 3 : blendedScore >= 70 ? 2 : blendedScore >= 50 ? 1 : 0;

        submitResult({
          ...audioResult,
          overall: Math.round(blendedScore),
          stars: stars as 0 | 1 | 2 | 3,
          passed: stars >= 1,
        });
      } else if (isAdditive) {
        // Additive challenge scoring
        const playerFeatures = await captureAndAnalyze(
          additiveEngine!.getAnalyser(),
          () => additiveEngine!.triggerAttack(currentChallenge.testNote),
          () => additiveEngine!.triggerRelease()
        );

        const targetFeatures = await captureAndAnalyze(
          targetAdditiveSynthRef.current!.getAnalyser(),
          () => targetAdditiveSynthRef.current!.triggerAttack(currentChallenge.testNote),
          () => targetAdditiveSynthRef.current!.triggerRelease()
        );

        // Use audio-based comparison for spectral similarity
        const audioResult = compareSounds(
          playerFeatures,
          targetFeatures,
          params, // Fallback to subtractive params format for generic audio comparison
          currentChallenge.targetParams
        );

        // Blend with additive parameter comparison
        const additiveParamResult = compareAdditiveParams(
          additiveParams,
          currentChallenge.targetParams as AdditiveSynthParams
        );

        // Weight: 60% audio, 40% params (harmonics are very important in additive)
        const blendedScore = audioResult.overall * 0.6 + additiveParamResult.score * 0.4;
        const stars = blendedScore >= 90 ? 3 : blendedScore >= 70 ? 2 : blendedScore >= 50 ? 1 : 0;

        submitResult({
          ...audioResult,
          overall: Math.round(blendedScore),
          stars: stars as 0 | 1 | 2 | 3,
          passed: stars >= 1,
        });
      } else {
        // Subtractive challenge scoring
        const playerFeatures = await captureAndAnalyze(
          engine!.getAnalyser(),
          () => engine!.triggerAttack(currentChallenge.testNote),
          () => engine!.triggerRelease()
        );

        const targetFeatures = await captureAndAnalyze(
          targetSynthRef.current!.getAnalyser(),
          () => targetSynthRef.current!.triggerAttack(currentChallenge.testNote),
          () => targetSynthRef.current!.triggerRelease()
        );

        const result = compareSounds(
          playerFeatures,
          targetFeatures,
          params,
          currentChallenge.targetParams
        );

        submitResult(result);
      }
    } catch (error) {
      console.error('Scoring failed:', error);
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
  }, [engine, fmEngine, additiveEngine, currentChallenge, params, fmParams, additiveParams, isFM, isAdditive, startScoring, submitResult]);

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

  // Determine visualization type based on challenge module
  const getVisualizationType = (): 'oscilloscope' | 'filter' | 'envelope' | 'lfo' | 'effects' | 'none' => {
    if (isFM || isAdditive) return 'none'; // These have their own visualizations
    const module = currentChallenge.module;
    if (module === 'SD1') return 'oscilloscope'; // Oscillators
    if (module === 'SD2') return 'filter'; // Filters
    if (module === 'SD3') return 'envelope'; // Envelopes
    if (module === 'SD4') return 'lfo'; // LFO/Modulation
    if (module === 'SD5') return 'effects'; // Effects
    return 'oscilloscope'; // Default for SD6, SD7, etc.
  };

  const visualizationType = getVisualizationType();

  // Get analyser for oscilloscope based on synth type
  const getActiveAnalyser = useCallback(() => {
    if (isFM && fmEngine) return fmEngine.getAnalyser();
    if (isAdditive && additiveEngine) return additiveEngine.getAnalyser();
    if (engine) return engine.getAnalyser();
    return null;
  }, [engine, fmEngine, additiveEngine, isFM, isAdditive]);

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
          {isFM ? (
            <>
              {/* FM Oscillators */}
              <Section title="Oscillators">
                <CarrierModulatorViz
                  carrierType={fmParams.carrierType}
                  modulatorType={fmParams.modulatorType}
                  harmonicity={fmParams.harmonicity}
                  modulationIndex={fmParams.modulationIndex}
                />
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#00ff88', textTransform: 'uppercase' }}>Carrier</span>
                    <WaveformSelector value={fmParams.carrierType} onChange={setCarrierType} accentColor="#00ff88" size="compact" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#ff8800', textTransform: 'uppercase' }}>Modulator</span>
                    <WaveformSelector value={fmParams.modulatorType} onChange={setModulatorType} accentColor="#ff8800" size="compact" />
                  </div>
                </div>
              </Section>

              {/* FM Modulation */}
              <Section title="Modulation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <Knob
                    value={fmParams.harmonicity}
                    min={FM_PARAM_RANGES.harmonicity.min}
                    max={FM_PARAM_RANGES.harmonicity.max}
                    step={FM_PARAM_RANGES.harmonicity.step}
                    label="Harmonicity"
                    onChange={setHarmonicity}
                    formatValue={(v) => `${v.toFixed(1)}x`}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase' }}>Presets</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {HARMONICITY_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setHarmonicityPreset(preset)}
                          style={{
                            width: '28px',
                            height: '28px',
                            background: Math.abs(fmParams.harmonicity - preset) < 0.05 ? '#2a3a2a' : '#1a1a1a',
                            border: Math.abs(fmParams.harmonicity - preset) < 0.05 ? '2px solid #4ade80' : '1px solid #333',
                            borderRadius: '4px',
                            color: Math.abs(fmParams.harmonicity - preset) < 0.05 ? '#4ade80' : '#888',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                  <Knob
                    value={fmParams.modulationIndex}
                    min={FM_PARAM_RANGES.modulationIndex.min}
                    max={FM_PARAM_RANGES.modulationIndex.max}
                    step={FM_PARAM_RANGES.modulationIndex.step}
                    label="Mod Index"
                    onChange={setModulationIndex}
                    formatValue={(v) => v.toFixed(1)}
                  />
                  <Knob
                    value={fmParams.modulationEnvelopeAmount}
                    min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
                    max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
                    step={FM_PARAM_RANGES.modulationEnvelopeAmount.step}
                    label="Mod Env"
                    onChange={setModulationEnvelopeAmount}
                    formatValue={formatPercent}
                  />
                </div>
              </Section>

              {/* FM Amplitude Envelope */}
              <Section title="Envelope">
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <Knob value={fmParams.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} label="Attack" onChange={setFMAttack} formatValue={formatMs} />
                  <Knob value={fmParams.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} label="Decay" onChange={setFMDecay} formatValue={formatMs} />
                  <Knob value={fmParams.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} label="Sustain" onChange={setFMSustain} formatValue={formatPercent} />
                  <Knob value={fmParams.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} label="Release" onChange={setFMRelease} formatValue={formatMs} />
                </div>
              </Section>

              {/* FM Effects */}
              <Section title="Effects">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Distortion</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Amt" value={fmParams.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setFMDistortionAmount} formatValue={formatPercent} size={36} />
                      <Knob label="Mix" value={fmParams.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setFMDistortionMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Delay</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Time" value={fmParams.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setFMDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={36} />
                      <Knob label="Mix" value={fmParams.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setFMDelayMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Reverb</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Decay" value={fmParams.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setFMReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={36} />
                      <Knob label="Mix" value={fmParams.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setFMReverbMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Chorus</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Rate" value={fmParams.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setFMChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={36} />
                      <Knob label="Mix" value={fmParams.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setFMChorusMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* FM Volume */}
              <Section title="Output">
                <Knob
                  label="Volume"
                  value={fmParams.volume}
                  min={PARAM_RANGES.volume.min}
                  max={PARAM_RANGES.volume.max}
                  step={PARAM_RANGES.volume.step}
                  onChange={setFMVolume}
                  formatValue={formatDb}
                  size={48}
                />
              </Section>
            </>
          ) : isAdditive ? (
            <>
              {/* Additive Harmonics */}
              <HarmonicDrawbars
                harmonics={additiveParams.harmonics}
                onChange={setAdditiveHarmonic}
                onPreset={applyAdditivePreset}
              />

              {/* Additive Envelope */}
              <Section title="Envelope">
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <Knob value={additiveParams.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} label="Attack" onChange={setAdditiveAttack} formatValue={formatMs} />
                  <Knob value={additiveParams.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} label="Decay" onChange={setAdditiveDecay} formatValue={formatMs} />
                  <Knob value={additiveParams.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} label="Sustain" onChange={setAdditiveSustain} formatValue={formatPercent} />
                  <Knob value={additiveParams.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} label="Release" onChange={setAdditiveRelease} formatValue={formatMs} />
                </div>
              </Section>

              {/* Additive Effects */}
              <Section title="Effects">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Distortion</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Amt" value={additiveParams.effects.distortion.amount} min={PARAM_RANGES.distortionAmount.min} max={PARAM_RANGES.distortionAmount.max} step={PARAM_RANGES.distortionAmount.step} onChange={setAdditiveDistortionAmount} formatValue={formatPercent} size={36} />
                      <Knob label="Mix" value={additiveParams.effects.distortion.mix} min={PARAM_RANGES.distortionMix.min} max={PARAM_RANGES.distortionMix.max} step={PARAM_RANGES.distortionMix.step} onChange={setAdditiveDistortionMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Delay</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Time" value={additiveParams.effects.delay.time} min={PARAM_RANGES.delayTime.min} max={PARAM_RANGES.delayTime.max} step={PARAM_RANGES.delayTime.step} onChange={setAdditiveDelayTime} formatValue={(v) => `${Math.round(v * 1000)}ms`} size={36} />
                      <Knob label="Mix" value={additiveParams.effects.delay.mix} min={PARAM_RANGES.delayMix.min} max={PARAM_RANGES.delayMix.max} step={PARAM_RANGES.delayMix.step} onChange={setAdditiveDelayMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Reverb</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Decay" value={additiveParams.effects.reverb.decay} min={PARAM_RANGES.reverbDecay.min} max={PARAM_RANGES.reverbDecay.max} step={PARAM_RANGES.reverbDecay.step} onChange={setAdditiveReverbDecay} formatValue={(v) => `${v.toFixed(1)}s`} size={36} />
                      <Knob label="Mix" value={additiveParams.effects.reverb.mix} min={PARAM_RANGES.reverbMix.min} max={PARAM_RANGES.reverbMix.max} step={PARAM_RANGES.reverbMix.step} onChange={setAdditiveReverbMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Chorus</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Knob label="Rate" value={additiveParams.effects.chorus.rate} min={PARAM_RANGES.chorusRate.min} max={PARAM_RANGES.chorusRate.max} step={PARAM_RANGES.chorusRate.step} onChange={setAdditiveChorusRate} formatValue={(v) => `${v.toFixed(1)}Hz`} size={36} />
                      <Knob label="Mix" value={additiveParams.effects.chorus.mix} min={PARAM_RANGES.chorusMix.min} max={PARAM_RANGES.chorusMix.max} step={PARAM_RANGES.chorusMix.step} onChange={setAdditiveChorusMix} formatValue={formatPercent} size={36} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Additive Volume */}
              <Section title="Output">
                <Knob
                  label="Volume"
                  value={additiveParams.volume}
                  min={PARAM_RANGES.volume.min}
                  max={PARAM_RANGES.volume.max}
                  step={PARAM_RANGES.volume.step}
                  onChange={setAdditiveVolume}
                  formatValue={formatDb}
                  size={48}
                />
              </Section>
            </>
          ) : (
            <>
              {/* Oscillator */}
              <Section title="Oscillator">
            <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} accentColor="#3b82f6" />
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
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
          </Section>

          {/* Amplitude Envelope */}
          <Section title="Amplitude Envelope">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <EnvelopeDisplay envelope={params.amplitudeEnvelope} width={120} height={60} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider label="A" value={params.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={setAmplitudeAttack} formatValue={formatMs} logarithmic height={80} paramId="amplitude.attack" />
                <Slider label="D" value={params.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={setAmplitudeDecay} formatValue={formatMs} logarithmic height={80} paramId="amplitude.decay" />
                <Slider label="S" value={params.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={setAmplitudeSustain} formatValue={formatPercent} height={80} paramId="amplitude.sustain" />
                <Slider label="R" value={params.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={setAmplitudeRelease} formatValue={formatMs} logarithmic height={80} paramId="amplitude.release" />
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
                    paramId="filterEnv.amount"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Slider label="A" value={params.filterEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={setFilterEnvelopeAttack} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.attack" />
                <Slider label="D" value={params.filterEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={setFilterEnvelopeDecay} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.decay" />
                <Slider label="S" value={params.filterEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={setFilterEnvelopeSustain} formatValue={formatPercent} height={80} paramId="filterEnv.sustain" />
                <Slider label="R" value={params.filterEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={setFilterEnvelopeRelease} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.release" />
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
                paramId="lfo.rate"
              />
              <Knob
                label="Depth"
                value={params.lfo.depth}
                min={PARAM_RANGES.lfoDepth.min}
                max={PARAM_RANGES.lfoDepth.max}
                step={PARAM_RANGES.lfoDepth.step}
                onChange={setLFODepth}
                formatValue={formatPercent}
                paramId="lfo.depth"
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
            </>
          )}
        </div>

        {/* Right Column - Visualization & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Educational Visualization - shows different views based on module */}
          {visualizationType === 'oscilloscope' && (
            <Section title="Waveform">
              <Oscilloscope
                getAnalyser={getActiveAnalyser}
                width={450}
                height={120}
                accentColor="#4ade80"
              />
            </Section>
          )}
          {visualizationType === 'filter' && (
            <Section title="Filter Response">
              <FilterResponse
                filterType={params.filter.type}
                cutoff={params.filter.cutoff}
                resonance={params.filter.resonance}
                width={450}
                height={150}
                accentColor="#4ade80"
              />
            </Section>
          )}
          {visualizationType === 'envelope' && (
            <Section title="Envelope Shape">
              <EnvelopeVisualizerReadOnly
                amplitudeEnvelope={params.amplitudeEnvelope}
                filterEnvelope={params.filterEnvelope}
                width={450}
                height={150}
              />
            </Section>
          )}
          {visualizationType === 'lfo' && (
            <Section title="LFO Modulation">
              <LFOVisualizer
                waveform={params.lfo.waveform}
                rate={params.lfo.rate}
                depth={params.lfo.depth}
                width={450}
                height={150}
                accentColor="#4ade80"
              />
            </Section>
          )}
          {visualizationType === 'effects' && (
            <Section title="Effects Chain">
              <EffectsVisualizer
                effects={params.effects}
                width={450}
                height={150}
                accentColor="#4ade80"
              />
            </Section>
          )}

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
          playerParams={isFM ? fmParams : isAdditive ? additiveParams : params}
          targetParams={currentChallenge.targetParams}
          challenge={currentChallenge}
          attemptNumber={currentAttempt}
          synthesisType={synthesisType}
          onRetry={retry}
          onNext={nextChallenge}
          hasNextChallenge={hasNext}
        />
      )}
    </div>
    <InfoPanel accentColor={isFM ? '#f97316' : isAdditive ? '#06b6d4' : '#4ade80'} />
    </div>
    </InfoPanelProvider>
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
