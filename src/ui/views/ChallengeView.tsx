/**
 * Challenge View
 * Main view for playing "Recreate This Sound" challenges
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSynthStore } from '../stores/synth-store.ts';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import { useAdditiveSynthStore } from '../stores/additive-synth-store.ts';
import { useChallengeStore } from '../stores/challenge-store.ts';
import {
  Knob,
  WaveformSelector,
  SpectrumAnalyzer,
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
  VizModeToggle,
} from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { SubtractiveSections } from '../components/challenge/SubtractiveSections.tsx';
import { FMAdditiveEffectsSection } from '../components/challenge/FMAdditiveEffectsSection.tsx';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { cn } from '../utils/cn.ts';
import { FM_PARAM_RANGES, HARMONICITY_PRESETS, PARAM_RANGES } from '../../core/types.ts';
import type { SynthParams, FMSynthParams, AdditiveSynthParams, VizMode } from '../../core/types.ts';
import { getAvailableControls, getVisualizations, getVizLayout, getVizDims } from '../../data/module-controls.ts';
import { SynthEngine, createSynthEngine } from '../../core/synth-engine.ts';
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import { captureAndAnalyze, initMeyda } from '../../core/sound-analysis.ts';
import { compareSounds, compareFMParams, compareAdditiveParams } from '../../core/sound-comparison.ts';
import { formatMs, formatPercent } from '../utils/formatters.ts';

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

  const rawVizList = (isFM || isAdditive) ? [] : getVisualizations(currentChallenge);
  const [vizMode, setVizMode] = useState<VizMode>('default');
  const vizLayout = getVizLayout(rawVizList, vizMode);

  const getActiveAnalyser = useCallback(() => {
    if (isFM && fmEngine) return fmEngine.getAnalyser();
    if (isAdditive && additiveEngine) return additiveEngine.getAnalyser();
    if (engine) return engine.getAnalyser();
    return null;
  }, [engine, fmEngine, additiveEngine, isFM, isAdditive]);

  const getTargetAnalyser = useCallback(() => {
    return targetSynthRef.current?.getAnalyser() ?? null;
  }, []);

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
          {rawVizList.length > 0 && <VizModeToggle mode={vizMode} onChange={setVizMode} />}

          {vizMode === 'compare' && vizLayout.panels.includes('spectrum') ? (
            <Section title="Compare">
              <div className="flex gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-text-disabled mb-1">Your Sound</span>
                  <SpectrumAnalyzer getAnalyser={getActiveAnalyser} width={getVizDims('spectrum', vizLayout).width} height={getVizDims('spectrum', vizLayout).height} barCount={32} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-text-disabled mb-1">Target</span>
                  <SpectrumAnalyzer getAnalyser={getTargetAnalyser} width={getVizDims('spectrum', vizLayout).width} height={getVizDims('spectrum', vizLayout).height} barCount={32} />
                </div>
              </div>
            </Section>
          ) : (
            <>
              {vizLayout.panels.includes('oscilloscope') && <Section title="Waveform"><Oscilloscope getAnalyser={getActiveAnalyser} width={getVizDims('oscilloscope', vizLayout).width} height={getVizDims('oscilloscope', vizLayout).height} accentColor="#4ade80" /></Section>}
              {vizLayout.panels.includes('filter') && <Section title="Filter Response"><FilterResponse filterType={params.filter.type} cutoff={params.filter.cutoff} resonance={params.filter.resonance} width={getVizDims('filter', vizLayout).width} height={getVizDims('filter', vizLayout).height} accentColor="#4ade80" /></Section>}
              {vizLayout.panels.includes('envelope') && <Section title="Envelope Shape"><EnvelopeVisualizerReadOnly amplitudeEnvelope={params.amplitudeEnvelope} filterEnvelope={params.filterEnvelope} width={getVizDims('envelope', vizLayout).width} height={getVizDims('envelope', vizLayout).height} /></Section>}
              {vizLayout.panels.includes('lfo') && <Section title="LFO Modulation"><LFOVisualizer waveform={params.lfo.waveform} rate={params.lfo.rate} depth={params.lfo.depth} width={getVizDims('lfo', vizLayout).width} height={getVizDims('lfo', vizLayout).height} accentColor="#4ade80" /></Section>}
              {vizLayout.panels.includes('effects') && <Section title="Effects Chain"><EffectsVisualizer effects={params.effects} width={getVizDims('effects', vizLayout).width} height={getVizDims('effects', vizLayout).height} accentColor="#4ade80" /></Section>}
              {vizLayout.panels.includes('spectrum') && <Section title="Spectrum Analyzer"><SpectrumAnalyzer width={getVizDims('spectrum', vizLayout).width} height={getVizDims('spectrum', vizLayout).height} barCount={64} /></Section>}
            </>
          )}

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
