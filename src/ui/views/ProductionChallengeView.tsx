/**
 * Production Challenge View
 * Main view for multi-layer production challenges
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useProductionStore } from '../stores/production-store.ts';
import { ProductionMixer, SpectrumAnalyzer, ChallengeHeader, HintsPanel, SubmitButton } from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { ProductionResultsModal } from '../components/production/ProductionResultsModal.tsx';
import { cn } from '../utils/cn.ts';
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
      <ChallengeHeader
        title={challenge.title}
        description={challenge.description}
        difficulty={challenge.difficulty}
        currentAttempt={currentAttempt}
        onExit={handleExit}
      />

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
                  className={cn(
                    'flex-1 py-3 px-6 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold',
                    isPlaying && playbackMode === 'reference'
                      ? 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]'
                      : 'bg-gradient-to-br from-[#a855f7] to-[#9333ea]'
                  )}
                >
                  {isPlaying && playbackMode === 'reference' ? '■ Stop' : '▶ Reference'}
                </button>
              )}

              {/* Your mix play button */}
              <button
                onClick={isPlaying && playbackMode === 'yours' ? stopPlayback : playYourMix}
                className={cn(
                  'flex-1 py-3 px-6 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold',
                  isPlaying && playbackMode === 'yours'
                    ? 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]'
                    : 'bg-gradient-to-br from-success to-[#16a34a]'
                )}
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
            <HintsPanel
              hints={challenge.hints}
              hintsRevealed={hintsRevealed}
              onRevealHint={revealHint}
            />
          </Section>

          {/* Submit */}
          <SubmitButton
            onClick={handleSubmit}
            isScoring={isScoring}
            label="Submit Mix"
            accentColor="#3b82f6"
            accentColorDark="#2563eb"
          />
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
