/**
 * DrumSequencerChallengeView
 * Challenge view for drum sequencing challenges where users match target patterns
 * Features: side-by-side pattern display, playback for both, hints, scoring
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import { Knob, StepGrid, VelocityLane } from '../components/index.ts';
import { evaluateDrumSequencingChallenge } from '../../core/drum-sequencing-evaluation.ts';
import { trpc } from '../api/trpc.ts';
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
 * Section wrapper component for consistent styling
 */
function Section({
  title,
  children,
}: {
  title?: string;
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
      {title && (
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
      )}
      {children}
    </div>
  );
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
          {displayValue}
        </span>
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
    pattern,
    currentStep,
    isPlaying,
    isInitialized,
    isLoading,
    selectedTrack,
    volume,
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    initEngine,
    start,
    stop,
    setTempo,
    setSwing,
    toggleStep,
    setStepVelocity,
    clearTrack,
    clearAll,
    setSelectedTrack,
    setVolume,
    loadChallenge,
    revealHint,
    startScoring,
    submitResult,
    saveProgress,
    retry,
    dispose,
  } = useDrumSequencerStore();

  // Target pattern engine for playback
  const targetEngineRef = useRef<DrumSequencerEngine | null>(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [targetStep, setTargetStep] = useState(-1);

  // Accent color for drum sequencer (orange theme)
  const accentColor = '#f97316';

  // Initialize engine and load challenge on mount
  useEffect(() => {
    initEngine();
    loadChallenge(challenge);

    return () => {
      // Cleanup target engine on unmount
      if (targetEngineRef.current) {
        targetEngineRef.current.dispose();
        targetEngineRef.current = null;
      }
    };
  }, [initEngine, loadChallenge, challenge]);

  // Initialize target engine
  useEffect(() => {
    async function initTargetEngine() {
      // Dispose existing engine
      if (targetEngineRef.current) {
        targetEngineRef.current.dispose();
      }

      // Create target engine with the target pattern
      const engine = createDrumSequencerEngine({
        pattern: challenge.targetPattern,
        volume: volume,
      });

      engine.onStepChange((step) => {
        setTargetStep(step);
      });

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

  // Handle play/stop user pattern
  const handlePlayStop = useCallback(() => {
    // Stop target if playing
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }

    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, isPlayingTarget, start, stop]);

  // Handle play/stop target pattern
  const handlePlayStopTarget = useCallback(async () => {
    // Stop user pattern if playing
    if (isPlaying) {
      stop();
    }

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

  // Handle submit for scoring
  const handleSubmit = useCallback(() => {
    // Stop playback
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }

    startScoring();
    const result = evaluateDrumSequencingChallenge(challenge, pattern);
    submitResult(result);

    // Save progress
    if (result.passed) {
      saveProgress(challenge.id, result.overall, result.stars);
    }
  }, [challenge, pattern, isPlaying, isPlayingTarget, stop, startScoring, submitResult, saveProgress]);

  // Handle retry
  const handleRetry = useCallback(() => {
    // Stop playback
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
      setTargetStep(-1);
    }

    retry();
  }, [isPlaying, isPlayingTarget, stop, retry]);

  // Handle exit
  const handleExit = useCallback(() => {
    // Stop playback
    if (isPlaying) stop();
    if (isPlayingTarget && targetEngineRef.current) {
      targetEngineRef.current.stop();
      setIsPlayingTarget(false);
    }

    dispose();
    onExit();
  }, [isPlaying, isPlayingTarget, stop, dispose, onExit]);

  // Handle velocity change from StepGrid
  const handleGridVelocityChange = useCallback(
    (trackIndex: number, stepIndex: number, velocity: number) => {
      setStepVelocity(trackIndex, stepIndex, velocity);
    },
    [setStepVelocity]
  );

  // Handle velocity change from VelocityLane
  const handleVelocityChange = useCallback(
    (stepIndex: number, velocity: number) => {
      setStepVelocity(selectedTrack, stepIndex, velocity);
    },
    [selectedTrack, setStepVelocity]
  );

  // Format helpers
  const formatBPM = (value: number) => `${Math.round(value)} BPM`;
  const formatSwing = (value: number) => `${Math.round(value)}%`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;

  // Get current selected track
  const currentSelectedTrack = pattern.tracks[selectedTrack];

  // Check if tempo/swing should be editable based on evaluation focus
  const canEditTempo = challenge.evaluationFocus.includes('tempo');
  const canEditSwing = challenge.evaluationFocus.includes('swing');

  return (
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
              onClick={handleExit}
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
              {challenge.title}
            </h1>
            <p
              style={{
                color: '#888',
                margin: '8px 0 0 0',
                fontSize: '14px',
                maxWidth: '600px',
              }}
            >
              {challenge.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', fontSize: '12px' }}>
              Attempt {currentAttempt}
            </div>
            <div style={{ color: '#eab308', fontSize: '18px' }}>
              {'★'.repeat(challenge.difficulty)}
              {'☆'.repeat(3 - challenge.difficulty)}
            </div>
          </div>
        </div>

        {/* Main Layout - Two Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            maxWidth: '1400px',
          }}
        >
          {/* Left Column - Your Pattern */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Your Pattern Header */}
            <Section title="Your Pattern">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px',
                }}
              >
                <button
                  onClick={handlePlayStop}
                  disabled={!isInitialized || isLoading}
                  style={{
                    padding: '10px 24px',
                    background: isPlaying
                      ? '#ef4444'
                      : `linear-gradient(145deg, ${accentColor}, #ea580c)`,
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: !isInitialized || isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: '100px',
                    opacity: !isInitialized || isLoading ? 0.5 : 1,
                  }}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>

                {isLoading && (
                  <span style={{ color: '#666', fontSize: '13px' }}>Loading...</span>
                )}
              </div>

              <StepGrid
                pattern={pattern}
                currentStep={isPlaying ? currentStep : -1}
                selectedTrack={selectedTrack}
                onToggleStep={toggleStep}
                onSelectTrack={setSelectedTrack}
                onVelocityChange={handleGridVelocityChange}
                width={580}
                height={pattern.tracks.length * 50}
                accentColor={accentColor}
              />
            </Section>

            {/* Velocity Lane for selected track */}
            {currentSelectedTrack && (
              <Section title={`Velocity - ${currentSelectedTrack.name}`}>
                <VelocityLane
                  track={currentSelectedTrack}
                  trackIndex={selectedTrack}
                  onVelocityChange={handleVelocityChange}
                  width={580}
                  height={80}
                  accentColor={accentColor}
                />
              </Section>
            )}

            {/* Controls */}
            <Section title="Controls">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <HorizontalSlider
                  label="Tempo"
                  value={pattern.tempo}
                  min={60}
                  max={200}
                  step={1}
                  onChange={setTempo}
                  formatValue={formatBPM}
                  width={120}
                  disabled={!canEditTempo}
                />

                <HorizontalSlider
                  label="Swing"
                  value={pattern.swing * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(val) => setSwing(val / 100)}
                  formatValue={formatSwing}
                  width={100}
                  disabled={!canEditSwing}
                />

                <Knob
                  label="Volume"
                  value={volume}
                  min={-60}
                  max={0}
                  step={0.5}
                  onChange={setVolume}
                  formatValue={formatDb}
                  size={48}
                />

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => clearTrack(selectedTrack)}
                    style={{
                      padding: '8px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Clear Track
                  </button>
                  <button
                    onClick={clearAll}
                    style={{
                      padding: '8px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Right Column - Target Pattern & Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Target Pattern */}
            <Section title="Target Pattern">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px',
                }}
              >
                <button
                  onClick={handlePlayStopTarget}
                  disabled={!targetEngineRef.current?.loaded}
                  style={{
                    padding: '10px 24px',
                    background: isPlayingTarget
                      ? '#ef4444'
                      : 'linear-gradient(145deg, #a855f7, #9333ea)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: !targetEngineRef.current?.loaded ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: '120px',
                    opacity: !targetEngineRef.current?.loaded ? 0.5 : 1,
                  }}
                >
                  {isPlayingTarget ? 'Stop Target' : 'Play Target'}
                </button>

                {challenge.evaluationFocus.includes('tempo') && (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    Target: {challenge.targetPattern.tempo} BPM
                  </span>
                )}
                {challenge.evaluationFocus.includes('swing') && (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    Swing: {Math.round(challenge.targetPattern.swing * 100)}%
                  </span>
                )}
              </div>

              {/* Read-only target grid */}
              <StepGrid
                pattern={challenge.targetPattern}
                currentStep={isPlayingTarget ? targetStep : -1}
                selectedTrack={-1}
                onToggleStep={() => {}} // No-op for read-only
                onSelectTrack={() => {}} // No-op for read-only
                width={580}
                height={challenge.targetPattern.tracks.length * 50}
                accentColor="#a855f7"
              />
            </Section>

            {/* Hints */}
            <Section title="Hints">
              <div style={{ minHeight: '60px' }}>
                {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                  <div
                    key={i}
                    style={{
                      color: '#888',
                      fontSize: '12px',
                      marginBottom: '8px',
                      paddingLeft: '12px',
                      borderLeft: `2px solid ${accentColor}44`,
                    }}
                  >
                    {hint}
                  </div>
                ))}

                {hintsRevealed < challenge.hints.length && (
                  <button
                    onClick={revealHint}
                    style={{
                      background: 'none',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '6px 12px',
                    }}
                  >
                    Reveal Hint ({hintsRevealed + 1}/{challenge.hints.length})
                  </button>
                )}
              </div>
            </Section>

            {/* Evaluation Focus */}
            <Section title="What Matters">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {challenge.evaluationFocus.map((focus) => (
                  <span
                    key={focus}
                    style={{
                      padding: '4px 12px',
                      background: '#1a1a1a',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: accentColor,
                      border: `1px solid ${accentColor}44`,
                      textTransform: 'capitalize',
                    }}
                  >
                    {focus}
                  </span>
                ))}
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
                    : `linear-gradient(145deg, ${accentColor}, #ea580c)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: isScoring ? 'wait' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {isScoring ? 'Scoring...' : 'Submit for Scoring'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {lastResult && (
        <DrumSequencingResultsModal
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

/**
 * Count active steps in a pattern
 */
function countActiveSteps(pattern: DrumPattern): number {
  let count = 0;
  for (const track of pattern.tracks) {
    for (const step of track.steps) {
      if (step.active) count++;
    }
  }
  return count;
}

/**
 * Results Modal for drum sequencing challenges
 */
interface DrumSequencingResultsModalProps {
  result: DrumSequencingScoreResult;
  challenge: DrumSequencingChallenge;
  attemptNumber: number;
  pattern: DrumPattern;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

function DrumSequencingResultsModal({
  result,
  challenge,
  attemptNumber,
  pattern,
  onRetry,
  onNext,
  hasNext,
}: DrumSequencingResultsModalProps) {
  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  // Fetch AI feedback on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchFeedback() {
      try {
        const response = await trpc.feedback.generateDrumSequencing.mutate({
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
        });

        if (!cancelled) {
          setAiFeedback(response.feedback);
          setFeedbackLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch AI feedback:', error);
        if (!cancelled) {
          setFeedbackLoading(false);
        }
      }
    }

    fetchFeedback();

    return () => {
      cancelled = true;
    };
  }, [result, challenge, pattern, attemptNumber]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '450px',
          width: '90%',
          border: '1px solid #333',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '8px',
              color: result.passed ? '#22c55e' : '#666',
            }}
          >
            {'★'.repeat(result.stars)}
            {'☆'.repeat(3 - result.stars)}
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
            {result.passed ? 'Great Groove!' : 'Keep Working'}
          </h2>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {result.overall}%
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Score Breakdown
          </div>

          {result.breakdown.patternScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Pattern</span>
              <span
                style={{
                  color:
                    result.breakdown.patternScore >= 80
                      ? '#22c55e'
                      : result.breakdown.patternScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.patternScore)}%
              </span>
            </div>
          )}

          {result.breakdown.velocityScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Velocity</span>
              <span
                style={{
                  color:
                    result.breakdown.velocityScore >= 80
                      ? '#22c55e'
                      : result.breakdown.velocityScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.velocityScore)}%
              </span>
            </div>
          )}

          {result.breakdown.swingScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Swing</span>
              <span
                style={{
                  color:
                    result.breakdown.swingScore >= 80
                      ? '#22c55e'
                      : result.breakdown.swingScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.swingScore)}%
              </span>
            </div>
          )}

          {result.breakdown.tempoScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Tempo</span>
              <span
                style={{
                  color:
                    result.breakdown.tempoScore >= 80
                      ? '#22c55e'
                      : result.breakdown.tempoScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.tempoScore)}%
              </span>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div style={{ marginBottom: '16px' }}>
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              style={{
                color: '#888',
                fontSize: '12px',
                marginBottom: '6px',
                paddingLeft: '12px',
                borderLeft: `2px solid ${result.passed ? '#22c55e44' : '#f59e0b44'}`,
              }}
            >
              {fb}
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            AI Mentor
          </div>
          <div style={{
            background: '#0f0f0f',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#ccc',
            lineHeight: 1.5,
            fontStyle: feedbackLoading ? 'italic' : 'normal',
          }}>
            {feedbackLoading && 'Analyzing your work...'}
            {!feedbackLoading && aiFeedback}
            {!feedbackLoading && !aiFeedback && 'AI feedback unavailable'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              padding: '12px',
              background: '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>

          {result.passed && hasNext && onNext && (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Next Challenge →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
