/**
 * DrumSequencerChallengeView
 * Challenge view for drum sequencing challenges where users match target patterns
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import {
  Knob,
  StepGrid,
  VelocityLane,
  ChallengeHeader,
  HintsPanel,
  SubmitButton,
  ScoreBreakdownRow,
  ChallengeResultsModal,
} from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { evaluateDrumSequencingChallenge } from '../../core/drum-sequencing-evaluation.ts';
import { trpc } from '../api/trpc.ts';
import { useAIFeedback } from '../hooks/useAIFeedback.ts';
import {
  DrumSequencerEngine,
  createDrumSequencerEngine,
} from '../../core/drum-sequencer-engine.ts';
import type { DrumSequencingChallenge, DrumPattern } from '../../core/types.ts';
import type { DrumSequencingScoreResult } from '../../core/drum-sequencing-evaluation.ts';

interface DrumSequencerChallengeViewProps {
  challenge: DrumSequencingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

/**
 * Horizontal slider component for tempo and swing
 */
function HorizontalSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  width = 120,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  width?: number;
  disabled?: boolean;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={{
          width,
          height: '6px',
          appearance: 'none',
          background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #333 ${percentage}%, #333 100%)`,
          borderRadius: '3px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
    </div>
  );
}

export function DrumSequencerChallengeView({
  challenge,
  onExit,
  onNext,
  hasNext = false,
}: DrumSequencerChallengeViewProps) {
  const {
    pattern, currentStep, isPlaying, isInitialized, isLoading,
    selectedTrack, volume, currentAttempt, hintsRevealed, isScoring, lastResult,
    initEngine, start, stop, setTempo, setSwing, toggleStep, setStepVelocity,
    clearTrack, clearAll, setSelectedTrack, setVolume, loadChallenge,
    revealHint, startScoring, submitResult, saveProgress, retry, dispose,
  } = useDrumSequencerStore();

  const targetEngineRef = useRef<DrumSequencerEngine | null>(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [targetStep, setTargetStep] = useState(-1);

  const accentColor = '#f97316';

  // Initialize engine and load challenge on mount
  useEffect(() => {
    initEngine();
    loadChallenge(challenge);
    return () => {
      if (targetEngineRef.current) {
        targetEngineRef.current.dispose();
        targetEngineRef.current = null;
      }
    };
  }, [initEngine, loadChallenge, challenge]);

  // Initialize target engine
  useEffect(() => {
    async function initTargetEngine() {
      if (targetEngineRef.current) targetEngineRef.current.dispose();
      const engine = createDrumSequencerEngine({ pattern: challenge.targetPattern, volume });
      engine.onStepChange((step) => setTargetStep(step));
      await engine.start();
      targetEngineRef.current = engine;
    }
    initTargetEngine();
    return () => {
      if (targetEngineRef.current) {
        targetEngineRef.current.dispose();
        targetEngineRef.current = null;
      }
    };
  }, [challenge.targetPattern, volume]);

  const handlePlayStop = useCallback(() => {
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }
    if (isPlaying) stop(); else start();
  }, [isPlaying, isPlayingTarget, start, stop]);

  const handlePlayStopTarget = useCallback(async () => {
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    } else if (targetEngineRef.current && targetEngineRef.current.loaded) {
      await Tone.start();
      targetEngineRef.current.play();
      setIsPlayingTarget(true);
    }
  }, [isPlaying, isPlayingTarget, stop]);

  const handleSubmit = useCallback(() => {
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }
    startScoring();
    const result = evaluateDrumSequencingChallenge(challenge, pattern);
    submitResult(result);
    if (result.passed) saveProgress(challenge.id, result.overall, result.stars);
  }, [challenge, pattern, isPlaying, isPlayingTarget, stop, startScoring, submitResult, saveProgress]);

  const handleRetry = useCallback(() => {
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }
    retry();
  }, [isPlaying, isPlayingTarget, stop, retry]);

  const handleExit = useCallback(() => {
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
    }
    dispose();
    onExit();
  }, [isPlaying, isPlayingTarget, stop, dispose, onExit]);

  const handleGridVelocityChange = useCallback(
    (trackIndex: number, stepIndex: number, velocity: number) => setStepVelocity(trackIndex, stepIndex, velocity),
    [setStepVelocity]
  );

  const handleVelocityChange = useCallback(
    (stepIndex: number, velocity: number) => setStepVelocity(selectedTrack, stepIndex, velocity),
    [selectedTrack, setStepVelocity]
  );

  const formatBPM = (value: number) => `${Math.round(value)} BPM`;
  const formatSwing = (value: number) => `${Math.round(value)}%`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;

  const currentSelectedTrack = pattern.tracks[selectedTrack];
  const canEditTempo = challenge.evaluationFocus.includes('tempo');
  const canEditSwing = challenge.evaluationFocus.includes('swing');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', flex: 1 }}>
        <ChallengeHeader
          title={challenge.title}
          description={challenge.description}
          difficulty={challenge.difficulty}
          currentAttempt={currentAttempt}
          onExit={handleExit}
        />

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1400px' }}>
          {/* Left Column - Your Pattern */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Section title="Your Pattern">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <button
                  onClick={handlePlayStop}
                  disabled={!isInitialized || isLoading}
                  style={{
                    padding: '10px 24px',
                    background: isPlaying ? '#ef4444' : `linear-gradient(145deg, ${accentColor}, #ea580c)`,
                    border: 'none', borderRadius: '6px', color: '#fff',
                    cursor: !isInitialized || isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: 600, minWidth: '100px',
                    opacity: !isInitialized || isLoading ? 0.5 : 1,
                  }}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                {isLoading && <span style={{ color: '#666', fontSize: '13px' }}>Loading...</span>}
              </div>
              <StepGrid
                pattern={pattern} currentStep={isPlaying ? currentStep : -1}
                selectedTrack={selectedTrack} onToggleStep={toggleStep}
                onSelectTrack={setSelectedTrack} onVelocityChange={handleGridVelocityChange}
                width={580} height={pattern.tracks.length * 50} accentColor={accentColor}
              />
            </Section>

            {currentSelectedTrack && (
              <Section title={`Velocity - ${currentSelectedTrack.name}`}>
                <VelocityLane
                  track={currentSelectedTrack} trackIndex={selectedTrack}
                  onVelocityChange={handleVelocityChange}
                  width={580} height={80} accentColor={accentColor}
                />
              </Section>
            )}

            <Section title="Controls">
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <HorizontalSlider label="Tempo" value={pattern.tempo} min={60} max={200} step={1} onChange={setTempo} formatValue={formatBPM} width={120} disabled={!canEditTempo} />
                <HorizontalSlider label="Swing" value={pattern.swing * 100} min={0} max={100} step={1} onChange={(val) => setSwing(val / 100)} formatValue={formatSwing} width={100} disabled={!canEditSwing} />
                <Knob label="Volume" value={volume} min={-60} max={0} step={0.5} onChange={setVolume} formatValue={formatDb} size={48} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button onClick={() => clearTrack(selectedTrack)} style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Clear Track</button>
                  <button onClick={clearAll} style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Clear All</button>
                </div>
              </div>
            </Section>
          </div>

          {/* Right Column - Target Pattern & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Section title="Target Pattern">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <button
                  onClick={handlePlayStopTarget}
                  disabled={!targetEngineRef.current?.loaded}
                  style={{
                    padding: '10px 24px',
                    background: isPlayingTarget ? '#ef4444' : 'linear-gradient(145deg, #a855f7, #9333ea)',
                    border: 'none', borderRadius: '6px', color: '#fff',
                    cursor: !targetEngineRef.current?.loaded ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: 600, minWidth: '120px',
                    opacity: !targetEngineRef.current?.loaded ? 0.5 : 1,
                  }}
                >
                  {isPlayingTarget ? 'Stop Target' : 'Play Target'}
                </button>
                {challenge.evaluationFocus.includes('tempo') && <span style={{ color: '#666', fontSize: '12px' }}>Target: {challenge.targetPattern.tempo} BPM</span>}
                {challenge.evaluationFocus.includes('swing') && <span style={{ color: '#666', fontSize: '12px' }}>Swing: {Math.round(challenge.targetPattern.swing * 100)}%</span>}
              </div>
              <StepGrid
                pattern={challenge.targetPattern} currentStep={isPlayingTarget ? targetStep : -1}
                selectedTrack={-1} onToggleStep={() => {}} onSelectTrack={() => {}}
                width={580} height={challenge.targetPattern.tracks.length * 50} accentColor="#a855f7"
              />
            </Section>

            <Section title="Hints">
              <HintsPanel hints={challenge.hints} hintsRevealed={hintsRevealed} onRevealHint={revealHint} accentColor={accentColor} />
            </Section>

            <Section title="What Matters">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {challenge.evaluationFocus.map((focus) => (
                  <span key={focus} style={{ padding: '4px 12px', background: '#1a1a1a', borderRadius: '16px', fontSize: '12px', color: accentColor, border: `1px solid ${accentColor}44`, textTransform: 'capitalize' }}>
                    {focus}
                  </span>
                ))}
              </div>
            </Section>

            <SubmitButton
              onClick={handleSubmit} isScoring={isScoring}
              label="Submit for Scoring" accentColor={accentColor} accentColorDark="#ea580c"
            />
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {lastResult && (
        <DrumSequencingResults
          result={lastResult}
          challenge={challenge}
          attemptNumber={currentAttempt - 1}
          pattern={pattern}
          onRetry={handleRetry}
          onNext={onNext}
          hasNext={hasNext}
        />
      )}
    </div>
  );
}

/** Count active steps in a pattern */
function countActiveSteps(pattern: DrumPattern): number {
  let count = 0;
  for (const track of pattern.tracks) {
    for (const step of track.steps) {
      if (step.active) count++;
    }
  }
  return count;
}

/** Drum sequencing results using shared ChallengeResultsModal */
function DrumSequencingResults({
  result,
  challenge,
  attemptNumber,
  pattern,
  onRetry,
  onNext,
  hasNext,
}: {
  result: DrumSequencingScoreResult;
  challenge: DrumSequencingChallenge;
  attemptNumber: number;
  pattern: DrumPattern;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  const { feedback: aiFeedback, loading: aiFeedbackLoading } = useAIFeedback(
    () => trpc.feedback.generateDrumSequencing.mutate({
      result,
      patternSummary: {
        tempo: pattern.tempo,
        swing: pattern.swing,
        trackCount: pattern.tracks.length,
        activeSteps: countActiveSteps(pattern),
        totalSteps: pattern.stepCount * pattern.tracks.length,
      },
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        module: challenge.module,
        challengeType: 'drum-sequencing',
        evaluationFocus: challenge.evaluationFocus,
      },
      attemptNumber,
    }),
    [result, challenge, pattern, attemptNumber]
  );

  return (
    <ChallengeResultsModal
      passed={result.passed}
      stars={result.stars}
      overall={result.overall}
      successMessage="Great Groove!"
      failMessage="Keep Working"
      breakdown={
        <>
          {result.breakdown.patternScore !== undefined && <ScoreBreakdownRow label="Pattern" score={result.breakdown.patternScore} />}
          {result.breakdown.velocityScore !== undefined && <ScoreBreakdownRow label="Velocity" score={result.breakdown.velocityScore} />}
          {result.breakdown.swingScore !== undefined && <ScoreBreakdownRow label="Swing" score={result.breakdown.swingScore} />}
          {result.breakdown.tempoScore !== undefined && <ScoreBreakdownRow label="Tempo" score={result.breakdown.tempoScore} />}
        </>
      }
      feedback={result.feedback}
      aiFeedback={aiFeedback}
      aiFeedbackLoading={aiFeedbackLoading}
      onRetry={onRetry}
      onNext={onNext}
      hasNext={hasNext}
    />
  );
}
