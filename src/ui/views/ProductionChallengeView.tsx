/**
 * Production Challenge View
 * Main view for multi-layer production challenges
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useProductionStore } from '../stores/production-store.ts';
import { ProductionMixer, SpectrumAnalyzer } from '../components/index.ts';
import { createProductionSource, ProductionSource } from '../../core/production-source.ts';
import { evaluateProductionChallenge } from '../../core/production-evaluation.ts';
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
          <div style={{ color: '#666', fontSize: '12px' }}>Attempt {currentAttempt}</div>
          <div style={{ color: '#eab308', fontSize: '18px' }}>
            {'★'.repeat(challenge.difficulty)}
            {'☆'.repeat(3 - challenge.difficulty)}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
          maxWidth: '1200px',
        }}
      >
        {/* Left Column - Mixer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Play Controls */}
          <Section title="Playback">
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Reference play button (P1-P2 only) */}
              {isReferenceBased && (
                <button
                  onClick={isPlaying && playbackMode === 'reference' ? stopPlayback : playReference}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: isPlaying && playbackMode === 'reference'
                      ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                      : 'linear-gradient(145deg, #a855f7, #9333ea)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {isPlaying && playbackMode === 'reference' ? '■ Stop' : '▶ Reference'}
                </button>
              )}

              {/* Your mix play button */}
              <button
                onClick={isPlaying && playbackMode === 'yours' ? stopPlayback : playYourMix}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: isPlaying && playbackMode === 'yours'
                    ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                    : 'linear-gradient(145deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {isPlaying && playbackMode === 'yours' ? '■ Stop' : '▶ Your Mix'}
              </button>
            </div>

            {/* Playback indicator */}
            {isPlaying && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: playbackMode === 'reference' ? '#9333ea22' : '#22c55e22',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: playbackMode === 'reference' ? '#a855f7' : '#22c55e',
                  textAlign: 'center',
                }}
              >
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Goal or Target */}
          <Section title={isGoalBased ? 'Goal' : 'Target'}>
            {isGoalBased ? (
              <div>
                <p style={{ color: '#fff', fontSize: '14px', margin: '0 0 12px 0' }}>
                  {(challenge.target as ProductionGoalTarget).description}
                </p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Meet the conditions to pass
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#888' }}>
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
            <div style={{ minHeight: '60px' }}>
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  style={{
                    color: '#888',
                    fontSize: '12px',
                    marginBottom: '8px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid #333',
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
                  : 'linear-gradient(145deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: isScoring ? 'wait' : 'pointer',
                fontSize: '16px',
                fontWeight: 600,
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
          onRetry={handleRetry}
          onNext={onNext}
          hasNext={hasNext}
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
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

function ProductionResultsModal({
  result,
  challenge,
  onRetry,
  onNext,
  hasNext,
}: ProductionResultsModalProps) {
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
            {result.passed ? 'Great Mix!' : 'Keep Tweaking'}
          </h2>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {result.overall}%
          </div>
        </div>

        {/* Breakdown */}
        {result.breakdown.type === 'reference' && result.breakdown.layerScores && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Layer Scores
            </div>
            {result.breakdown.layerScores.map((layer) => (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span style={{ color: '#888', fontSize: '13px' }}>{layer.name}</span>
                <span
                  style={{
                    color: layer.score >= 80 ? '#22c55e' : layer.score >= 60 ? '#eab308' : '#ef4444',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {Math.round(layer.score)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {result.breakdown.type === 'goal' && result.breakdown.conditionResults && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                color: '#666',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Conditions
            </div>
            {result.breakdown.conditionResults.map((cond, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ color: cond.passed ? '#22c55e' : '#ef4444' }}>
                  {cond.passed ? '✓' : '✗'}
                </span>
                <span style={{ color: '#888', fontSize: '13px' }}>{cond.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        <div style={{ marginBottom: '24px' }}>
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              style={{
                color: '#888',
                fontSize: '13px',
                marginBottom: '6px',
                paddingLeft: '12px',
                borderLeft: `2px solid ${result.passed ? '#22c55e' : '#f59e0b'}`,
              }}
            >
              {fb}
            </div>
          ))}
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
