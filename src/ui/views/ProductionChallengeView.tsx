/**
 * Production Challenge View
 * Main view for multi-layer production challenges
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useProductionStore } from '../stores/production-store.ts';
import { ProductionMixer, SpectrumAnalyzer } from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { cn } from '../utils/cn.ts';
import { createProductionSource, ProductionSource, type LayerState } from '../../core/production-source.ts';
import { evaluateProductionChallenge } from '../../core/production-evaluation.ts';
import { trpc } from '../api/trpc.ts';
import type { ProductionChallenge, ProductionGoalTarget, ProductionReferenceTarget } from '../../core/types.ts';

type PlaybackMode = 'yours' | 'reference';

interface ProductionChallengeViewProps {
  challenge: ProductionChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function ProductionChallengeView({
  challenge,
  onExit,
  onNext,
  hasNext = false,
}: ProductionChallengeViewProps) {
  const {
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    layerStates,
    loadChallenge,
    revealHint,
    startScoring,
    submitResult,
    retry,
    setLayerVolume,
    setLayerPan,
    setLayerMuted,
    setLayerSolo,
    setLayerEQLow,
    setLayerEQHigh,
  } = useProductionStore();

  // Audio references
  const sourceRef = useRef<ProductionSource | null>(null);
  const targetSourceRef = useRef<ProductionSource | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('yours');

  // Check if this is a reference-based challenge (P1-P2)
  const isReferenceBased = challenge.target.type === 'reference';

  // Load challenge on mount
  useEffect(() => {
    loadChallenge(challenge);
  }, [challenge, loadChallenge]);

  // Initialize audio system
  useEffect(() => {
    // Create user's mix source
    sourceRef.current = createProductionSource(challenge.layers);
    sourceRef.current.connect(Tone.getDestination());

    // Create target/reference source for P1-P2 challenges
    if (challenge.target.type === 'reference') {
      targetSourceRef.current = createProductionSource(challenge.layers);
      targetSourceRef.current.connect(Tone.getDestination());

      // Apply target settings to reference source
      const target = challenge.target as ProductionReferenceTarget;
      challenge.layers.forEach((layer, index) => {
        const targetLayer = target.layers[index];
        if (targetLayer && targetSourceRef.current) {
          targetSourceRef.current.setVolume(layer.id, targetLayer.volume);
          targetSourceRef.current.setMuted(layer.id, targetLayer.muted);
          if (targetLayer.pan !== undefined) {
            targetSourceRef.current.setPan(layer.id, targetLayer.pan);
          }
          if (targetLayer.eqLow !== undefined) {
            targetSourceRef.current.setEQlow(layer.id, targetLayer.eqLow);
          }
          if (targetLayer.eqHigh !== undefined) {
            targetSourceRef.current.setEQhigh(layer.id, targetLayer.eqHigh);
          }
        }
      });
    }

    return () => {
      sourceRef.current?.dispose();
      sourceRef.current = null;
      targetSourceRef.current?.dispose();
      targetSourceRef.current = null;
    };
  }, [challenge]);

  // Sync layer states to audio engine
  useEffect(() => {
    if (!sourceRef.current) return;

    for (const state of layerStates) {
      sourceRef.current.setVolume(state.id, state.volume);
      sourceRef.current.setPan(state.id, state.pan);
      sourceRef.current.setMuted(state.id, state.muted);
      sourceRef.current.setSolo(state.id, state.solo);
      sourceRef.current.setEQlow(state.id, state.eqLow);
      sourceRef.current.setEQhigh(state.id, state.eqHigh);
    }
  }, [layerStates]);

  // Stop all playback
  const stopPlayback = useCallback(() => {
    sourceRef.current?.stop();
    targetSourceRef.current?.stop();
    setIsPlaying(false);
  }, []);

  // Play user's mix
  const playYourMix = useCallback(async () => {
    stopPlayback();
    await Tone.start();
    setPlaybackMode('yours');
    sourceRef.current?.start();
    setIsPlaying(true);
  }, [stopPlayback]);

  // Play reference mix (for P1-P2)
  const playReference = useCallback(async () => {
    stopPlayback();
    await Tone.start();
    setPlaybackMode('reference');
    targetSourceRef.current?.start();
    setIsPlaying(true);
  }, [stopPlayback]);

  // Toggle playback for current mode
  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await playYourMix();
    }
  }, [isPlaying, stopPlayback, playYourMix]);

  // Submit and score
  const handleSubmit = useCallback(() => {
    startScoring();
    const result = evaluateProductionChallenge(challenge, layerStates);
    submitResult(result);
  }, [challenge, layerStates, startScoring, submitResult]);

  // Handle retry
  const handleRetry = useCallback(() => {
    stopPlayback();
    retry();
  }, [retry, stopPlayback]);

  // Handle exit
  const handleExit = useCallback(() => {
    stopPlayback();
    onExit();
  }, [onExit, stopPlayback]);

  // Layer control handlers
  const handleVolumeChange = useCallback(
    (layerId: string, volume: number) => {
      setLayerVolume(layerId, volume);
    },
    [setLayerVolume]
  );

  const handlePanChange = useCallback(
    (layerId: string, pan: number) => {
      setLayerPan(layerId, pan);
    },
    [setLayerPan]
  );

  const handleMuteToggle = useCallback(
    (layerId: string) => {
      const state = layerStates.find((s) => s.id === layerId);
      if (state) {
        setLayerMuted(layerId, !state.muted);
      }
    },
    [layerStates, setLayerMuted]
  );

  const handleSoloToggle = useCallback(
    (layerId: string) => {
      const state = layerStates.find((s) => s.id === layerId);
      if (state) {
        setLayerSolo(layerId, !state.solo);
      }
    },
    [layerStates, setLayerSolo]
  );

  const handleEQLowChange = useCallback(
    (layerId: string, db: number) => {
      setLayerEQLow(layerId, db);
    },
    [setLayerEQLow]
  );

  const handleEQHighChange = useCallback(
    (layerId: string, db: number) => {
      setLayerEQHigh(layerId, db);
    },
    [setLayerEQHigh]
  );

  // Determine available controls based on challenge config
  const showPan = challenge.availableControls.pan;
  const showEQ = challenge.availableControls.eq;
  const isGoalBased = challenge.target.type === 'goal';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary font-sans p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={handleExit}
            className="bg-transparent border-none text-text-muted cursor-pointer text-xl mb-2 p-0"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-semibold m-0">
            {challenge.title}
          </h1>
          <p className="text-text-tertiary mt-2 text-xl max-w-[600px]">
            {challenge.description}
          </p>
        </div>

        <div className="text-right">
          <div className="text-text-muted text-md">Attempt {currentAttempt}</div>
          <div className="text-warning text-[18px]">
            {'★'.repeat(challenge.difficulty)}
            {'☆'.repeat(3 - challenge.difficulty)}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-[1fr_300px] gap-6 max-w-[1200px]">
        {/* Left Column - Mixer */}
        <div className="flex flex-col gap-4">
          {/* Play Controls */}
          <Section title="Playback">
            <div className="flex gap-3">
              {/* Reference play button (P1-P2 only) */}
              {isReferenceBased && (
                <button
                  onClick={isPlaying && playbackMode === 'reference' ? stopPlayback : playReference}
                  className="flex-1 py-3 px-6 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold"
                  style={{
                    background: isPlaying && playbackMode === 'reference'
                      ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                      : 'linear-gradient(145deg, #a855f7, #9333ea)',
                  }}
                >
                  {isPlaying && playbackMode === 'reference' ? '■ Stop' : '▶ Reference'}
                </button>
              )}

              {/* Your mix play button */}
              <button
                onClick={isPlaying && playbackMode === 'yours' ? stopPlayback : playYourMix}
                className="flex-1 py-3 px-6 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold"
                style={{
                  background: isPlaying && playbackMode === 'yours'
                    ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                    : 'linear-gradient(145deg, #22c55e, #16a34a)',
                }}
              >
                {isPlaying && playbackMode === 'yours' ? '■ Stop' : '▶ Your Mix'}
              </button>
            </div>

            {/* Playback indicator */}
            {isPlaying && (
              <div className={cn(
                'mt-2 py-1.5 px-3 rounded-sm text-md text-center',
                playbackMode === 'reference'
                  ? 'bg-[#9333ea22] text-[#a855f7]'
                  : 'bg-[#22c55e22] text-success'
              )}>
                Playing: {playbackMode === 'reference' ? 'Reference Mix' : 'Your Mix'}
              </div>
            )}
          </Section>

          {/* Mixer */}
          <Section title="Mixer">
            <ProductionMixer
              layers={layerStates}
              source={sourceRef.current}
              onVolumeChange={handleVolumeChange}
              onPanChange={handlePanChange}
              onMuteToggle={handleMuteToggle}
              onSoloToggle={handleSoloToggle}
              onEQLowChange={handleEQLowChange}
              onEQHighChange={handleEQHighChange}
              showPan={showPan}
              showEQ={showEQ}
            />
          </Section>
        </div>

        {/* Right Column - Info & Submit */}
        <div className="flex flex-col gap-4">
          {/* Goal or Target */}
          <Section title={isGoalBased ? 'Goal' : 'Target'}>
            {isGoalBased ? (
              <div>
                <p className="text-text-primary text-xl m-0 mb-3">
                  {(challenge.target as ProductionGoalTarget).description}
                </p>
                <div className="text-md text-text-muted">
                  Meet the conditions to pass
                </div>
              </div>
            ) : (
              <div className="text-lg text-text-tertiary">
                Match the reference mix as closely as possible using the mixer controls.
              </div>
            )}
          </Section>

          {/* Spectrum */}
          <Section title="Spectrum">
            <SpectrumAnalyzer width={260} height={120} barCount={32} />
          </Section>

          {/* Hints */}
          <Section title="Hints">
            <div className="min-h-[60px]">
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  className="text-text-tertiary text-md mb-2 pl-3 border-l-2 border-border-default"
                >
                  {hint}
                </div>
              ))}

              {hintsRevealed < challenge.hints.length && (
                <button
                  onClick={revealHint}
                  className="bg-transparent border border-border-default rounded-sm text-text-muted cursor-pointer text-base py-1.5 px-3"
                >
                  Reveal Hint ({hintsRevealed + 1}/{challenge.hints.length})
                </button>
              )}
            </div>
          </Section>

          {/* Submit */}
          <div className="mt-auto">
            <button
              onClick={handleSubmit}
              disabled={isScoring}
              className={cn(
                'w-full py-4 px-8 border-none rounded-lg text-text-primary text-2xl font-semibold',
                isScoring ? 'cursor-wait' : 'cursor-pointer'
              )}
              style={{
                background: isScoring
                  ? '#333'
                  : 'linear-gradient(145deg, #3b82f6, #2563eb)',
              }}
            >
              {isScoring ? 'Scoring...' : 'Submit Mix'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {lastResult && (
        <ProductionResultsModal
          result={lastResult}
          challenge={challenge}
          layerStates={layerStates}
          attemptNumber={currentAttempt}
          onRetry={handleRetry}
          onNext={onNext}
          hasNext={hasNext}
        />
      )}
    </div>
  );
}

/**
 * Results Modal for production challenges
 */
interface ProductionResultsModalProps {
  result: {
    overall: number;
    stars: 1 | 2 | 3;
    passed: boolean;
    feedback: string[];
    breakdown: {
      type: 'reference' | 'goal';
      layerScores?: { id: string; name: string; score: number }[];
      conditionResults?: { description: string; passed: boolean }[];
    };
  };
  challenge: ProductionChallenge;
  layerStates: LayerState[];
  attemptNumber: number;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

function ProductionResultsModal({
  result,
  challenge,
  layerStates,
  attemptNumber,
  onRetry,
  onNext,
  hasNext,
}: ProductionResultsModalProps) {
  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  // Fetch AI feedback on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchFeedback() {
      try {
        const targetDescription = challenge.target.type === 'goal'
          ? (challenge.target as ProductionGoalTarget).description
          : undefined;

        const response = await trpc.feedback.generateProduction.mutate({
          result,
          layerStates: layerStates.map((s) => ({
            id: s.id,
            name: s.name,
            volume: s.volume,
            pan: s.pan,
            muted: s.muted,
            eqLow: s.eqLow,
            eqHigh: s.eqHigh,
          })),
          challenge: {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            module: challenge.module,
            targetType: challenge.target.type,
            targetDescription,
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
  }, [result, challenge, layerStates, attemptNumber]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-modal">
      <div className="bg-bg-tertiary rounded-xl p-8 max-w-[450px] w-[90%] border border-border-medium">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={cn(
            'text-5xl mb-2',
            result.passed ? 'text-success' : 'text-text-muted'
          )}>
            {'★'.repeat(result.stars)}
            {'☆'.repeat(3 - result.stars)}
          </div>
          <h2 className="m-0 mb-2 text-4xl">
            {result.passed ? 'Great Mix!' : 'Keep Tweaking'}
          </h2>
          <div className="text-5xl font-bold text-text-primary">
            {result.overall}%
          </div>
        </div>

        {/* Breakdown */}
        {result.breakdown.type === 'reference' && result.breakdown.layerScores && (
          <div className="mb-4">
            <div className="text-base text-text-muted uppercase mb-2">
              Layer Scores
            </div>
            {result.breakdown.layerScores.map((layer) => (
              <div
                key={layer.id}
                className="flex justify-between items-center mb-1"
              >
                <span className="text-text-tertiary text-lg">{layer.name}</span>
                <span
                  className={cn(
                    'text-lg font-semibold',
                    layer.score >= 80 ? 'text-success' : layer.score >= 60 ? 'text-warning' : 'text-danger'
                  )}
                >
                  {Math.round(layer.score)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {result.breakdown.type === 'goal' && result.breakdown.conditionResults && (
          <div className="mb-4">
            <div className="text-base text-text-muted uppercase mb-2">
              Conditions
            </div>
            {result.breakdown.conditionResults.map((cond, i) => (
              <div
                key={i}
                className="flex items-center gap-2 mb-1"
              >
                <span className={cond.passed ? 'text-success' : 'text-danger'}>
                  {cond.passed ? '✓' : '✗'}
                </span>
                <span className="text-text-tertiary text-lg">{cond.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Feedback */}
        <div className="bg-[#0a0a0a] rounded-lg p-3 mb-4 border border-border-default">
          <div className="text-base text-success-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>✦</span> AI Mentor
          </div>
          <div className={cn(
            'text-text-secondary text-lg leading-relaxed',
            feedbackLoading && 'italic'
          )}>
            {feedbackLoading && 'Analyzing your production...'}
            {!feedbackLoading && aiFeedback}
            {!feedbackLoading && !aiFeedback && 'AI feedback unavailable'}
          </div>
        </div>

        {/* Condition Feedback */}
        <div className="mb-6">
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              className="text-text-muted text-md mb-1.5 pl-3 border-l-2"
              style={{ borderLeftColor: result.passed ? '#22c55e44' : '#f59e0b44' }}
            >
              {fb}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-border-medium border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold"
          >
            Try Again
          </button>

          {result.passed && hasNext && onNext && (
            <button
              onClick={onNext}
              className="flex-1 py-3 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold"
              style={{ background: 'linear-gradient(145deg, #22c55e, #16a34a)' }}
            >
              Next Challenge →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
