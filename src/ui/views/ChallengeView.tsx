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
  ChallengeHeader,
  HintsPanel,
  SubmitButton,
} from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { cn } from '../utils/cn.ts';
import { PARAM_RANGES, FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';
import type { SynthParams, FMSynthParams, AdditiveSynthParams } from '../../core/types.ts';
import { getAvailableControls, isControlVisible, isSectionVisible, getVisualizations } from '../../data/module-controls.ts';
import { SynthEngine, createSynthEngine } from '../../core/synth-engine.ts';
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import { captureAndAnalyze, initMeyda } from '../../core/sound-analysis.ts';
import { compareSounds, compareFMParams, compareAdditiveParams } from '../../core/sound-comparison.ts';
import { formatHz, formatMs, formatPercent, formatDb } from '../utils/formatters.ts';

interface ChallengeViewProps {
  onExit: () => void;
  onNext: () => void;
  hasNext: boolean;
}

export function ChallengeView({ onExit, onNext, hasNext }: ChallengeViewProps) {
  // Synth store for player's subtractive sound
  const {
    params, engine, isInitialized,
    setOscillatorType, setOctave, setDetune,
    setFilterType, setFilterCutoff, setFilterResonance,
    setAmplitudeAttack, setAmplitudeDecay, setAmplitudeSustain, setAmplitudeRelease,
    setFilterEnvelopeAttack, setFilterEnvelopeDecay, setFilterEnvelopeSustain, setFilterEnvelopeRelease, setFilterEnvelopeAmount,
    setLFORate, setLFODepth, setLFOWaveform,
    setDistortionAmount, setDistortionMix,
    setDelayTime, setDelayFeedback, setDelayMix,
    setReverbDecay, setReverbMix,
    setChorusRate, setChorusDepth, setChorusMix,
    setVolume,
  } = useSynthStore();

  // FM Synth store for player's FM sound
  const {
    params: fmParams, engine: fmEngine, isInitialized: fmIsInitialized,
    setHarmonicity, setHarmonicityPreset, setModulationIndex,
    setCarrierType, setModulatorType, setModulationEnvelopeAmount,
    setAmplitudeAttack: setFMAttack, setAmplitudeDecay: setFMDecay,
    setAmplitudeSustain: setFMSustain, setAmplitudeRelease: setFMRelease,
    setDistortionAmount: setFMDistortionAmount, setDistortionMix: setFMDistortionMix,
    setDelayTime: setFMDelayTime, setDelayFeedback: setFMDelayFeedback, setDelayMix: setFMDelayMix,
    setReverbDecay: setFMReverbDecay, setReverbMix: setFMReverbMix,
    setChorusRate: setFMChorusRate, setChorusDepth: setFMChorusDepth, setChorusMix: setFMChorusMix,
    setVolume: setFMVolume,
    initEngine: initFMEngine, startAudio: startFMAudio,
  } = useFMSynthStore();

  // Additive Synth store for player's additive sound
  const {
    params: additiveParams, engine: additiveEngine, isInitialized: additiveIsInitialized,
    setHarmonic: setAdditiveHarmonic, applyPreset: applyAdditivePreset,
    setAmplitudeAttack: setAdditiveAttack, setAmplitudeDecay: setAdditiveDecay,
    setAmplitudeSustain: setAdditiveSustain, setAmplitudeRelease: setAdditiveRelease,
    setDistortionAmount: setAdditiveDistortionAmount, setDistortionMix: setAdditiveDistortionMix,
    setDelayTime: setAdditiveDelayTime, setDelayFeedback: setAdditiveDelayFeedback, setDelayMix: setAdditiveDelayMix,
    setReverbDecay: setAdditiveReverbDecay, setReverbMix: setAdditiveReverbMix,
    setChorusRate: setAdditiveChorusRate, setChorusDepth: setAdditiveChorusDepth, setChorusMix: setAdditiveChorusMix,
    setVolume: setAdditiveVolume,
    initEngine: initAdditiveEngine, startAudio: startAdditiveAudio,
  } = useAdditiveSynthStore();

  // Challenge store
  const {
    currentChallenge, currentAttempt, hintsRevealed, isScoring, lastResult,
    revealHint, startScoring, submitResult, retry,
  } = useChallengeStore();

  // Reference synths for playing target sounds
  const targetSynthRef = useRef<SynthEngine | null>(null);
  const targetFMSynthRef = useRef<FMSynthEngine | null>(null);
  const targetAdditiveSynthRef = useRef<AdditiveSynthEngine | null>(null);

  const synthesisType = currentChallenge?.synthesisType ?? 'subtractive';
  const isFM = synthesisType === 'fm';
  const isAdditive = synthesisType === 'additive';

  // Initialize FM/Additive engines when needed
  useEffect(() => {
    if (currentChallenge && isFM && !fmIsInitialized) {
      initFMEngine();
      startFMAudio();
    }
  }, [currentChallenge, isFM, fmIsInitialized, initFMEngine, startFMAudio]);

  useEffect(() => {
    if (currentChallenge && isAdditive && !additiveIsInitialized) {
      initAdditiveEngine();
      startAdditiveAudio();
    }
  }, [currentChallenge, isAdditive, additiveIsInitialized, initAdditiveEngine, startAdditiveAudio]);

  // Initialize target synth when challenge loads
  useEffect(() => {
    if (!currentChallenge) return;
    initMeyda(44100, 2048);

    if (isFM) {
      if (fmIsInitialized) {
        targetFMSynthRef.current = createFMSynthEngine(currentChallenge.targetParams as FMSynthParams);
        targetFMSynthRef.current.start();
      }
    } else if (isAdditive) {
      if (additiveIsInitialized) {
        targetAdditiveSynthRef.current = createAdditiveSynthEngine(currentChallenge.targetParams as AdditiveSynthParams);
        targetAdditiveSynthRef.current.start();
      }
    } else {
      if (isInitialized) {
        targetSynthRef.current = createSynthEngine(currentChallenge.targetParams as SynthParams);
        targetSynthRef.current.start();
      }
    }

    return () => {
      if (targetSynthRef.current) { targetSynthRef.current.dispose(); targetSynthRef.current = null; }
      if (targetFMSynthRef.current) { targetFMSynthRef.current.dispose(); targetFMSynthRef.current = null; }
      if (targetAdditiveSynthRef.current) { targetAdditiveSynthRef.current.dispose(); targetAdditiveSynthRef.current = null; }
    };
  }, [currentChallenge, isInitialized, fmIsInitialized, additiveIsInitialized, isFM, isAdditive]);

  const playTarget = useCallback(() => {
    if (!currentChallenge) return;
    if (isFM) targetFMSynthRef.current?.triggerAttackRelease(currentChallenge.testNote, '4n');
    else if (isAdditive) targetAdditiveSynthRef.current?.triggerAttackRelease(currentChallenge.testNote, '4n');
    else targetSynthRef.current?.triggerAttackRelease(currentChallenge.testNote, '4n');
  }, [currentChallenge, isFM, isAdditive]);

  const playYours = useCallback(() => {
    if (!currentChallenge) return;
    if (isFM) fmEngine?.triggerAttackRelease(currentChallenge.testNote, '4n');
    else if (isAdditive) additiveEngine?.triggerAttackRelease(currentChallenge.testNote, '4n');
    else engine?.triggerAttackRelease(currentChallenge.testNote, '4n');
  }, [engine, fmEngine, additiveEngine, currentChallenge, isFM, isAdditive]);

  const playCompare = useCallback(() => {
    playTarget();
    setTimeout(() => playYours(), 800);
  }, [playTarget, playYours]);

  // Submit and score
  const handleSubmit = useCallback(async () => {
    if (!currentChallenge) return;
    if (isFM) { if (!fmEngine || !targetFMSynthRef.current) return; }
    else if (isAdditive) { if (!additiveEngine || !targetAdditiveSynthRef.current) return; }
    else { if (!engine || !targetSynthRef.current) return; }

    startScoring();

    try {
      if (isFM) {
        const playerFeatures = await captureAndAnalyze(fmEngine!.getAnalyser(), () => fmEngine!.triggerAttack(currentChallenge.testNote), () => fmEngine!.triggerRelease());
        const targetFeatures = await captureAndAnalyze(targetFMSynthRef.current!.getAnalyser(), () => targetFMSynthRef.current!.triggerAttack(currentChallenge.testNote), () => targetFMSynthRef.current!.triggerRelease());
        const audioResult = compareSounds(playerFeatures, targetFeatures, fmParams, currentChallenge.targetParams);
        const fmParamResult = compareFMParams(fmParams, currentChallenge.targetParams as FMSynthParams);
        const blendedScore = audioResult.overall * 0.7 + fmParamResult.score * 0.3;
        const stars = blendedScore >= 90 ? 3 : blendedScore >= 70 ? 2 : blendedScore >= 50 ? 1 : 0;
        submitResult({ ...audioResult, overall: Math.round(blendedScore), stars: stars as 0 | 1 | 2 | 3, passed: stars >= 1 });
      } else if (isAdditive) {
        const playerFeatures = await captureAndAnalyze(additiveEngine!.getAnalyser(), () => additiveEngine!.triggerAttack(currentChallenge.testNote), () => additiveEngine!.triggerRelease());
        const targetFeatures = await captureAndAnalyze(targetAdditiveSynthRef.current!.getAnalyser(), () => targetAdditiveSynthRef.current!.triggerAttack(currentChallenge.testNote), () => targetAdditiveSynthRef.current!.triggerRelease());
        const audioResult = compareSounds(playerFeatures, targetFeatures, params, currentChallenge.targetParams);
        const additiveParamResult = compareAdditiveParams(additiveParams, currentChallenge.targetParams as AdditiveSynthParams);
        const blendedScore = audioResult.overall * 0.6 + additiveParamResult.score * 0.4;
        const stars = blendedScore >= 90 ? 3 : blendedScore >= 70 ? 2 : blendedScore >= 50 ? 1 : 0;
        submitResult({ ...audioResult, overall: Math.round(blendedScore), stars: stars as 0 | 1 | 2 | 3, passed: stars >= 1 });
      } else {
        const playerFeatures = await captureAndAnalyze(engine!.getAnalyser(), () => engine!.triggerAttack(currentChallenge.testNote), () => engine!.triggerRelease());
        const targetFeatures = await captureAndAnalyze(targetSynthRef.current!.getAnalyser(), () => targetSynthRef.current!.triggerAttack(currentChallenge.testNote), () => targetSynthRef.current!.triggerRelease());
        submitResult(compareSounds(playerFeatures, targetFeatures, params, currentChallenge.targetParams));
      }
    } catch (error) {
      console.error('Scoring failed:', error);
      submitResult({ overall: 0, stars: 1, breakdown: { brightness: { score: 0, feedback: 'Error analyzing sound' }, attack: { score: 0, feedback: '' }, filter: { score: 0, feedback: '' }, envelope: { score: 0, feedback: '' } }, passed: false });
    }
  }, [engine, fmEngine, additiveEngine, currentChallenge, params, fmParams, additiveParams, isFM, isAdditive, startScoring, submitResult]);

  if (!currentChallenge) {
    return (
      <div className="p-6 text-text-muted">
        No challenge loaded.
        <button onClick={onExit} className="ml-4">Back</button>
      </div>
    );
  }

  const vizList = (isFM || isAdditive) ? [] as string[] : getVisualizations(currentChallenge);

  const getActiveAnalyser = useCallback(() => {
    if (isFM && fmEngine) return fmEngine.getAnalyser();
    if (isAdditive && additiveEngine) return additiveEngine.getAnalyser();
    if (engine) return engine.getAnalyser();
    return null;
  }, [engine, fmEngine, additiveEngine, isFM, isAdditive]);

  return (
    <InfoPanelProvider>
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary font-sans flex flex-col">
    <div className="p-6 flex-1">
      <ChallengeHeader
        title={currentChallenge.title}
        description={currentChallenge.description}
        difficulty={currentChallenge.difficulty}
        currentAttempt={currentAttempt}
        onExit={onExit}
      />

      {/* Target Player */}
      <div className="mb-6">
        <TargetPlayer onPlayTarget={playTarget} onPlayYours={playYours} onCompare={playCompare} disabled={isScoring} />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-2 gap-6 max-w-[1200px]">
        {/* Left Column - Controls */}
        <div className="flex flex-col gap-4">
          {isFM ? (
            <>
              <Section title="Oscillators">
                <CarrierModulatorViz carrierType={fmParams.carrierType} modulatorType={fmParams.modulatorType} harmonicity={fmParams.harmonicity} modulationIndex={fmParams.modulationIndex} />
                <div className="flex justify-around gap-4 mt-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-[#00ff88] uppercase">Carrier</span>
                    <WaveformSelector value={fmParams.carrierType} onChange={setCarrierType} accentColor="#00ff88" size="compact" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-[#ff8800] uppercase">Modulator</span>
                    <WaveformSelector value={fmParams.modulatorType} onChange={setModulatorType} accentColor="#ff8800" size="compact" />
                  </div>
                </div>
              </Section>
              <Section title="Modulation">
                <div className="flex items-center gap-4 mb-4">
                  <Knob value={fmParams.harmonicity} min={FM_PARAM_RANGES.harmonicity.min} max={FM_PARAM_RANGES.harmonicity.max} step={FM_PARAM_RANGES.harmonicity.step} label="Harmonicity" onChange={setHarmonicity} formatValue={(v) => `${v.toFixed(1)}x`} />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-disabled uppercase">Presets</span>
                    <div className="flex gap-1">
                      {HARMONICITY_PRESETS.map((preset) => {
                        const isActive = Math.abs(fmParams.harmonicity - preset) < 0.05;
                        return (
                          <button
                            key={preset}
                            onClick={() => setHarmonicityPreset(preset)}
                            className={cn(
                              'w-7 h-7 rounded-sm text-md font-semibold cursor-pointer',
                              isActive
                                ? 'bg-[#2a3a2a] border-2 border-success-light text-success-light'
                                : 'bg-bg-tertiary border border-border-medium text-text-tertiary'
                            )}
                          >
                            {preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 justify-center">
                  <Knob value={fmParams.modulationIndex} min={FM_PARAM_RANGES.modulationIndex.min} max={FM_PARAM_RANGES.modulationIndex.max} step={FM_PARAM_RANGES.modulationIndex.step} label="Mod Index" onChange={setModulationIndex} formatValue={(v) => v.toFixed(1)} />
                  <Knob value={fmParams.modulationEnvelopeAmount} min={FM_PARAM_RANGES.modulationEnvelopeAmount.min} max={FM_PARAM_RANGES.modulationEnvelopeAmount.max} step={FM_PARAM_RANGES.modulationEnvelopeAmount.step} label="Mod Env" onChange={setModulationEnvelopeAmount} formatValue={formatPercent} />
                </div>
              </Section>
              <Section title="Envelope">
                <div className="flex gap-4 justify-center">
                  <Knob value={fmParams.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} label="Attack" onChange={setFMAttack} formatValue={formatMs} />
                  <Knob value={fmParams.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} label="Decay" onChange={setFMDecay} formatValue={formatMs} />
                  <Knob value={fmParams.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} label="Sustain" onChange={setFMSustain} formatValue={formatPercent} />
                  <Knob value={fmParams.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} label="Release" onChange={setFMRelease} formatValue={formatMs} />
                </div>
              </Section>
              <FMAdditiveEffectsSection
                effects={fmParams.effects} volume={fmParams.volume}
                setDistortionAmount={setFMDistortionAmount} setDistortionMix={setFMDistortionMix}
                setDelayTime={setFMDelayTime} setDelayMix={setFMDelayMix}
                setReverbDecay={setFMReverbDecay} setReverbMix={setFMReverbMix}
                setChorusRate={setFMChorusRate} setChorusMix={setFMChorusMix}
                setVolume={setFMVolume}
              />
            </>
          ) : isAdditive ? (
            <>
              <HarmonicDrawbars harmonics={additiveParams.harmonics} onChange={setAdditiveHarmonic} onPreset={applyAdditivePreset} />
              <Section title="Envelope">
                <div className="flex gap-4 justify-center">
                  <Knob value={additiveParams.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} label="Attack" onChange={setAdditiveAttack} formatValue={formatMs} />
                  <Knob value={additiveParams.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} label="Decay" onChange={setAdditiveDecay} formatValue={formatMs} />
                  <Knob value={additiveParams.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} label="Sustain" onChange={setAdditiveSustain} formatValue={formatPercent} />
                  <Knob value={additiveParams.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} label="Release" onChange={setAdditiveRelease} formatValue={formatMs} />
                </div>
              </Section>
              <FMAdditiveEffectsSection
                effects={additiveParams.effects} volume={additiveParams.volume}
                setDistortionAmount={setAdditiveDistortionAmount} setDistortionMix={setAdditiveDistortionMix}
                setDelayTime={setAdditiveDelayTime} setDelayMix={setAdditiveDelayMix}
                setReverbDecay={setAdditiveReverbDecay} setReverbMix={setAdditiveReverbMix}
                setChorusRate={setAdditiveChorusRate} setChorusMix={setAdditiveChorusMix}
                setVolume={setAdditiveVolume}
              />
            </>
          ) : (
            <SubtractiveSections
              params={params}
              controls={getAvailableControls(currentChallenge)}
              setOscillatorType={setOscillatorType} setOctave={setOctave} setDetune={setDetune}
              setFilterType={setFilterType} setFilterCutoff={setFilterCutoff} setFilterResonance={setFilterResonance}
              setAmplitudeAttack={setAmplitudeAttack} setAmplitudeDecay={setAmplitudeDecay} setAmplitudeSustain={setAmplitudeSustain} setAmplitudeRelease={setAmplitudeRelease}
              setFilterEnvelopeAttack={setFilterEnvelopeAttack} setFilterEnvelopeDecay={setFilterEnvelopeDecay} setFilterEnvelopeSustain={setFilterEnvelopeSustain} setFilterEnvelopeRelease={setFilterEnvelopeRelease} setFilterEnvelopeAmount={setFilterEnvelopeAmount}
              setLFORate={setLFORate} setLFODepth={setLFODepth} setLFOWaveform={setLFOWaveform}
              setDistortionAmount={setDistortionAmount} setDistortionMix={setDistortionMix}
              setDelayTime={setDelayTime} setDelayFeedback={setDelayFeedback} setDelayMix={setDelayMix}
              setReverbDecay={setReverbDecay} setReverbMix={setReverbMix}
              setChorusRate={setChorusRate} setChorusDepth={setChorusDepth} setChorusMix={setChorusMix}
              setVolume={setVolume}
            />
          )}
        </div>

        {/* Right Column - Visualization & Actions */}
        <div className="flex flex-col gap-4">
          {vizList.includes('oscilloscope') && <Section title="Waveform"><Oscilloscope getAnalyser={getActiveAnalyser} width={450} height={120} accentColor="#4ade80" /></Section>}
          {vizList.includes('filter') && <Section title="Filter Response"><FilterResponse filterType={params.filter.type} cutoff={params.filter.cutoff} resonance={params.filter.resonance} width={450} height={150} accentColor="#4ade80" /></Section>}
          {vizList.includes('envelope') && <Section title="Envelope Shape"><EnvelopeVisualizerReadOnly amplitudeEnvelope={params.amplitudeEnvelope} filterEnvelope={params.filterEnvelope} width={450} height={150} /></Section>}
          {vizList.includes('lfo') && <Section title="LFO Modulation"><LFOVisualizer waveform={params.lfo.waveform} rate={params.lfo.rate} depth={params.lfo.depth} width={450} height={150} accentColor="#4ade80" /></Section>}
          {vizList.includes('effects') && <Section title="Effects Chain"><EffectsVisualizer effects={params.effects} width={450} height={150} accentColor="#4ade80" /></Section>}

          {vizList.includes('spectrum') && <Section title="Spectrum Analyzer">
            <SpectrumAnalyzer width={450} height={200} barCount={64} />
          </Section>}

          <Section title="Hints">
            <HintsPanel
              hints={currentChallenge.hints}
              hintsRevealed={hintsRevealed}
              onRevealHint={revealHint}
              accentColor="#333"
            />
          </Section>

          <SubmitButton onClick={handleSubmit} isScoring={isScoring} />
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
          onNext={onNext}
          hasNextChallenge={hasNext}
        />
      )}
    </div>
    <InfoPanel accentColor={isFM ? '#f97316' : isAdditive ? '#06b6d4' : '#4ade80'} />
    </div>
    </InfoPanelProvider>
  );
}

/** Shared effects + output section for FM and Additive challenge views */
function FMAdditiveEffectsSection({ effects, volume, setDistortionAmount, setDistortionMix, setDelayTime, setDelayMix, setReverbDecay, setReverbMix, setChorusRate, setChorusMix, setVolume }: {
  effects: { distortion: { amount: number; mix: number }; delay: { time: number; feedback: number; mix: number }; reverb: { decay: number; mix: number }; chorus: { rate: number; depth: number; mix: number } };
  volume: number;
  setDistortionAmount: (v: number) => void; setDistortionMix: (v: number) => void;
  setDelayTime: (v: number) => void; setDelayMix: (v: number) => void;
  setReverbDecay: (v: number) => void; setReverbMix: (v: number) => void;
  setChorusRate: (v: number) => void; setChorusMix: (v: number) => void;
  setVolume: (v: number) => void;
}) {
  return (
    <>
      <Section title="Effects">
        <div className="grid grid-cols-2 gap-4">
          <EffectBlock label="Distortion" knobs={[
            { label: 'Amt', value: effects.distortion.amount, range: PARAM_RANGES.distortionAmount, onChange: setDistortionAmount, format: formatPercent },
            { label: 'Mix', value: effects.distortion.mix, range: PARAM_RANGES.distortionMix, onChange: setDistortionMix, format: formatPercent },
          ]} />
          <EffectBlock label="Delay" knobs={[
            { label: 'Time', value: effects.delay.time, range: PARAM_RANGES.delayTime, onChange: setDelayTime, format: (v) => `${Math.round(v * 1000)}ms` },
            { label: 'Mix', value: effects.delay.mix, range: PARAM_RANGES.delayMix, onChange: setDelayMix, format: formatPercent },
          ]} />
          <EffectBlock label="Reverb" knobs={[
            { label: 'Decay', value: effects.reverb.decay, range: PARAM_RANGES.reverbDecay, onChange: setReverbDecay, format: (v) => `${v.toFixed(1)}s` },
            { label: 'Mix', value: effects.reverb.mix, range: PARAM_RANGES.reverbMix, onChange: setReverbMix, format: formatPercent },
          ]} />
          <EffectBlock label="Chorus" knobs={[
            { label: 'Rate', value: effects.chorus.rate, range: PARAM_RANGES.chorusRate, onChange: setChorusRate, format: (v) => `${v.toFixed(1)}Hz` },
            { label: 'Mix', value: effects.chorus.mix, range: PARAM_RANGES.chorusMix, onChange: setChorusMix, format: formatPercent },
          ]} />
        </div>
      </Section>
      <Section title="Output">
        <Knob label="Volume" value={volume} min={PARAM_RANGES.volume.min} max={PARAM_RANGES.volume.max} step={PARAM_RANGES.volume.step} onChange={setVolume} formatValue={formatDb} size={48} />
      </Section>
    </>
  );
}

/** Single effect block within the Effects section */
function EffectBlock({ label, knobs }: {
  label: string;
  knobs: { label: string; value: number; range: { min: number; max: number; step?: number }; onChange: (v: number) => void; format: (v: number) => string }[];
}) {
  return (
    <div>
      <div className="text-sm text-text-muted mb-2 uppercase">{label}</div>
      <div className="flex gap-3">
        {knobs.map((k) => (
          <Knob key={k.label} label={k.label} value={k.value} min={k.range.min} max={k.range.max} step={k.range.step} onChange={k.onChange} formatValue={k.format} size={36} />
        ))}
      </div>
    </div>
  );
}

/** Subtractive synth sections with progressive control visibility */
function SubtractiveSections({ params, controls, ...actions }: {
  params: SynthParams;
  controls: import('../../core/types.ts').SynthAvailableControls;
  setOscillatorType: (v: import('../../core/types.ts').OscillatorType) => void;
  setOctave: (v: number) => void; setDetune: (v: number) => void;
  setFilterType: (v: import('../../core/types.ts').FilterType) => void;
  setFilterCutoff: (v: number) => void; setFilterResonance: (v: number) => void;
  setAmplitudeAttack: (v: number) => void; setAmplitudeDecay: (v: number) => void;
  setAmplitudeSustain: (v: number) => void; setAmplitudeRelease: (v: number) => void;
  setFilterEnvelopeAttack: (v: number) => void; setFilterEnvelopeDecay: (v: number) => void;
  setFilterEnvelopeSustain: (v: number) => void; setFilterEnvelopeRelease: (v: number) => void;
  setFilterEnvelopeAmount: (v: number) => void;
  setLFORate: (v: number) => void; setLFODepth: (v: number) => void;
  setLFOWaveform: (v: import('../../core/types.ts').LFOWaveform) => void;
  setDistortionAmount: (v: number) => void; setDistortionMix: (v: number) => void;
  setDelayTime: (v: number) => void; setDelayFeedback: (v: number) => void; setDelayMix: (v: number) => void;
  setReverbDecay: (v: number) => void; setReverbMix: (v: number) => void;
  setChorusRate: (v: number) => void; setChorusDepth: (v: number) => void; setChorusMix: (v: number) => void;
  setVolume: (v: number) => void;
}) {
  const formatOctave = (value: number) => (value >= 0 ? `+${value}` : `${value}`);
  const formatCents = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  return (
    <>
      {isSectionVisible(controls.oscillator) && (
        <Section title="Oscillator">
          {isControlVisible(controls.oscillator, 'waveform') && <WaveformSelector value={params.oscillator.type} onChange={actions.setOscillatorType} accentColor="#3b82f6" />}
          <div className="flex gap-6 mt-4">
            {isControlVisible(controls.oscillator, 'octave') && <Knob label="Octave" value={params.oscillator.octave} min={PARAM_RANGES.octave.min} max={PARAM_RANGES.octave.max} step={PARAM_RANGES.octave.step} onChange={actions.setOctave} formatValue={formatOctave} paramId="oscillator.octave" />}
            {isControlVisible(controls.oscillator, 'detune') && <Knob label="Detune" value={params.oscillator.detune} min={PARAM_RANGES.detune.min} max={PARAM_RANGES.detune.max} step={PARAM_RANGES.detune.step} onChange={actions.setDetune} formatValue={formatCents} paramId="oscillator.detune" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.filter) && (
        <Section title="Filter">
          {isControlVisible(controls.filter, 'type') && <FilterTypeSelector value={params.filter.type} onChange={actions.setFilterType} />}
          <div className="flex gap-6 mt-4">
            {isControlVisible(controls.filter, 'cutoff') && <Knob label="Cutoff" value={params.filter.cutoff} min={PARAM_RANGES.cutoff.min} max={PARAM_RANGES.cutoff.max} onChange={actions.setFilterCutoff} formatValue={formatHz} logarithmic paramId="filter.cutoff" />}
            {isControlVisible(controls.filter, 'resonance') && <Knob label="Resonance" value={params.filter.resonance} min={PARAM_RANGES.resonance.min} max={PARAM_RANGES.resonance.max} step={PARAM_RANGES.resonance.step} onChange={actions.setFilterResonance} formatValue={(v) => v.toFixed(1)} paramId="filter.resonance" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.amplitudeEnvelope) && (
        <Section title="Amplitude Envelope">
          <div className="flex gap-4 items-start">
            <EnvelopeDisplay envelope={params.amplitudeEnvelope} width={120} height={60} />
            <div className="flex gap-3">
              {isControlVisible(controls.amplitudeEnvelope, 'attack') && <Slider label="A" value={params.amplitudeEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={actions.setAmplitudeAttack} formatValue={formatMs} logarithmic height={80} paramId="amplitude.attack" />}
              {isControlVisible(controls.amplitudeEnvelope, 'decay') && <Slider label="D" value={params.amplitudeEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={actions.setAmplitudeDecay} formatValue={formatMs} logarithmic height={80} paramId="amplitude.decay" />}
              {isControlVisible(controls.amplitudeEnvelope, 'sustain') && <Slider label="S" value={params.amplitudeEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={actions.setAmplitudeSustain} formatValue={formatPercent} height={80} paramId="amplitude.sustain" />}
              {isControlVisible(controls.amplitudeEnvelope, 'release') && <Slider label="R" value={params.amplitudeEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={actions.setAmplitudeRelease} formatValue={formatMs} logarithmic height={80} paramId="amplitude.release" />}
            </div>
          </div>
        </Section>
      )}
      {isSectionVisible(controls.filterEnvelope) && (
        <Section title="Filter Envelope">
          <div className="flex gap-4 items-start">
            <div>
              <EnvelopeDisplay envelope={params.filterEnvelope} width={120} height={60} color="#3b82f6" />
              {isControlVisible(controls.filterEnvelope, 'amount') && <div className="mt-2">
                <Knob label="Amount" value={params.filterEnvelope.amount} min={PARAM_RANGES.filterEnvAmount.min} max={PARAM_RANGES.filterEnvAmount.max} step={PARAM_RANGES.filterEnvAmount.step} onChange={actions.setFilterEnvelopeAmount} formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} size={40} paramId="filterEnv.amount" />
              </div>}
            </div>
            <div className="flex gap-3">
              {isControlVisible(controls.filterEnvelope, 'attack') && <Slider label="A" value={params.filterEnvelope.attack} min={PARAM_RANGES.attack.min} max={PARAM_RANGES.attack.max} onChange={actions.setFilterEnvelopeAttack} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.attack" />}
              {isControlVisible(controls.filterEnvelope, 'decay') && <Slider label="D" value={params.filterEnvelope.decay} min={PARAM_RANGES.decay.min} max={PARAM_RANGES.decay.max} onChange={actions.setFilterEnvelopeDecay} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.decay" />}
              {isControlVisible(controls.filterEnvelope, 'sustain') && <Slider label="S" value={params.filterEnvelope.sustain} min={PARAM_RANGES.sustain.min} max={PARAM_RANGES.sustain.max} onChange={actions.setFilterEnvelopeSustain} formatValue={formatPercent} height={80} paramId="filterEnv.sustain" />}
              {isControlVisible(controls.filterEnvelope, 'release') && <Slider label="R" value={params.filterEnvelope.release} min={PARAM_RANGES.release.min} max={PARAM_RANGES.release.max} onChange={actions.setFilterEnvelopeRelease} formatValue={formatMs} logarithmic height={80} paramId="filterEnv.release" />}
            </div>
          </div>
        </Section>
      )}
      {isSectionVisible(controls.lfo) && (
        <Section title="LFO (Filter Modulation)">
          {isControlVisible(controls.lfo, 'waveform') && <LFOWaveformSelector value={params.lfo.waveform} onChange={actions.setLFOWaveform} compact />}
          <div className="flex gap-6 mt-3">
            {isControlVisible(controls.lfo, 'rate') && <Knob label="Rate" value={params.lfo.rate} min={PARAM_RANGES.lfoRate.min} max={PARAM_RANGES.lfoRate.max} step={PARAM_RANGES.lfoRate.step} onChange={actions.setLFORate} formatValue={(v) => `${v.toFixed(1)}Hz`} paramId="lfo.rate" />}
            {isControlVisible(controls.lfo, 'depth') && <Knob label="Depth" value={params.lfo.depth} min={PARAM_RANGES.lfoDepth.min} max={PARAM_RANGES.lfoDepth.max} step={PARAM_RANGES.lfoDepth.step} onChange={actions.setLFODepth} formatValue={formatPercent} paramId="lfo.depth" />}
          </div>
        </Section>
      )}
      {isSectionVisible(controls.effects) && (
        <Section title="Effects">
          <div className="grid grid-cols-2 gap-4">
            {isControlVisible(controls.effects, 'distortion') && <EffectBlock label="Distortion" knobs={[
              { label: 'Amt', value: params.effects.distortion.amount, range: PARAM_RANGES.distortionAmount, onChange: actions.setDistortionAmount, format: formatPercent },
              { label: 'Mix', value: params.effects.distortion.mix, range: PARAM_RANGES.distortionMix, onChange: actions.setDistortionMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'delay') && <EffectBlock label="Delay" knobs={[
              { label: 'Time', value: params.effects.delay.time, range: PARAM_RANGES.delayTime, onChange: actions.setDelayTime, format: (v) => `${Math.round(v * 1000)}ms` },
              { label: 'Mix', value: params.effects.delay.mix, range: PARAM_RANGES.delayMix, onChange: actions.setDelayMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'reverb') && <EffectBlock label="Reverb" knobs={[
              { label: 'Decay', value: params.effects.reverb.decay, range: PARAM_RANGES.reverbDecay, onChange: actions.setReverbDecay, format: (v) => `${v.toFixed(1)}s` },
              { label: 'Mix', value: params.effects.reverb.mix, range: PARAM_RANGES.reverbMix, onChange: actions.setReverbMix, format: formatPercent },
            ]} />}
            {isControlVisible(controls.effects, 'chorus') && <EffectBlock label="Chorus" knobs={[
              { label: 'Rate', value: params.effects.chorus.rate, range: PARAM_RANGES.chorusRate, onChange: actions.setChorusRate, format: (v) => `${v.toFixed(1)}Hz` },
              { label: 'Mix', value: params.effects.chorus.mix, range: PARAM_RANGES.chorusMix, onChange: actions.setChorusMix, format: formatPercent },
            ]} />}
          </div>
        </Section>
      )}
      {controls.output !== false && (
        <Section title="Output">
          <Knob label="Volume" value={params.volume} min={PARAM_RANGES.volume.min} max={PARAM_RANGES.volume.max} step={PARAM_RANGES.volume.step} onChange={actions.setVolume} formatValue={formatDb} size={48} />
        </Section>
      )}
    </>
  );
}
