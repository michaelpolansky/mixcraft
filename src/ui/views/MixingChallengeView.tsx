/**
 * Mixing Challenge View
 * Main view for playing mixing challenges (EQ, compression, etc.)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useMixingStore } from '../stores/mixing-store.ts';
import { EQControl, CompressorControl, SpectrumAnalyzer } from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { cn } from '../utils/cn.ts';
import { createAudioSource, type AudioSource } from '../../core/audio-source.ts';
import { MixingEQ, MixingCompressor } from '../../core/mixing-effects.ts';
import { evaluateMixingChallenge } from '../../core/mixing-evaluation.ts';
import type { MixingChallenge } from '../../core/types.ts';

interface MixingChallengeViewProps {
  challenge: MixingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function MixingChallengeView({
  challenge,
  onExit,
  onNext,
  hasNext = false,
}: MixingChallengeViewProps) {
  const {
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    eqParams,
    compressorParams,
    loadChallenge,
    revealHint,
    startScoring,
    submitResult,
    retry,
    setEQLow,
    setEQMid,
    setEQHigh,
    setCompressorThreshold,
    setCompressorAmount,
    setCompressorAttack,
    setCompressorRelease,
  } = useMixingStore();

  // Audio references
  const audioSourceRef = useRef<AudioSource | null>(null);
  const eqRef = useRef<MixingEQ | null>(null);
  const compressorRef = useRef<MixingCompressor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gainReduction, setGainReduction] = useState(0);

  // Load challenge on mount
  useEffect(() => {
    loadChallenge(challenge);
  }, [challenge, loadChallenge]);

  // Check if this is a multi-track challenge
  const isMultiTrack = !!challenge.tracks && challenge.tracks.length > 0;

  // Initialize audio chain (single-track only)
  useEffect(() => {
    // Skip for multi-track challenges - they use a different audio setup
    if (isMultiTrack || !challenge.sourceConfig) return;

    // Create audio source
    audioSourceRef.current = createAudioSource(challenge.sourceConfig);

    // Create effects
    eqRef.current = new MixingEQ();
    compressorRef.current = new MixingCompressor();

    // Connect chain: source -> EQ -> compressor -> destination
    audioSourceRef.current.connect(eqRef.current.input);
    eqRef.current.connect(compressorRef.current.input);
    compressorRef.current.connect(Tone.getDestination());

    // Poll gain reduction for UI
    const pollGR = () => {
      if (compressorRef.current) {
        setGainReduction(compressorRef.current.gainReduction);
      }
    };
    const grInterval = setInterval(pollGR, 50);

    return () => {
      clearInterval(grInterval);
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.dispose();
      }
      eqRef.current?.dispose();
      compressorRef.current?.dispose();
    };
  }, [challenge, isMultiTrack]);

  // Sync EQ params to audio
  useEffect(() => {
    if (eqRef.current) {
      eqRef.current.setParams(eqParams);
    }
  }, [eqParams]);

  // Sync compressor params to audio
  useEffect(() => {
    if (compressorRef.current) {
      compressorRef.current.setParams(compressorParams);
    }
  }, [compressorParams]);

  // Play/Stop toggle
  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      await Tone.start();
      audioSourceRef.current?.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Submit and score
  const handleSubmit = useCallback(() => {
    startScoring();

    // Evaluate current settings
    const result = evaluateMixingChallenge(challenge, eqParams, compressorParams);
    submitResult(result);
  }, [challenge, eqParams, compressorParams, startScoring, submitResult]);

  // Handle retry
  const handleRetry = useCallback(() => {
    audioSourceRef.current?.stop();
    setIsPlaying(false);
    retry();
  }, [retry]);

  // Handle exit
  const handleExit = useCallback(() => {
    audioSourceRef.current?.stop();
    setIsPlaying(false);
    onExit();
  }, [onExit]);

  // Determine which controls to show
  const showEQ = challenge.controls.eq;
  const showCompressor = challenge.controls.compressor !== false;
  const compressorMode = challenge.controls.compressor === 'full' ? 'full' : 'simple';

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
      <div className="grid grid-cols-2 gap-6 max-w-[1000px]">
        {/* Left Column - Controls */}
        <div className="flex flex-col gap-4">
          {/* Play/Stop */}
          <Section title="Audio Source">
            <button
              onClick={togglePlayback}
              className="py-3 px-6 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold w-full"
              style={{
                background: isPlaying
                  ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                  : 'linear-gradient(145deg, #22c55e, #16a34a)',
              }}
            >
              {isPlaying ? '■ Stop' : '▶ Play'}
            </button>
          </Section>

          {/* EQ Control */}
          {showEQ && (
            <EQControl
              params={eqParams}
              onLowChange={setEQLow}
              onMidChange={setEQMid}
              onHighChange={setEQHigh}
            />
          )}

          {/* Compressor Control */}
          {showCompressor && (
            <CompressorControl
              params={compressorParams}
              gainReduction={gainReduction}
              showAdvanced={compressorMode === 'full'}
              onThresholdChange={setCompressorThreshold}
              onAmountChange={setCompressorAmount}
              onAttackChange={compressorMode === 'full' ? setCompressorAttack : undefined}
              onReleaseChange={compressorMode === 'full' ? setCompressorRelease : undefined}
            />
          )}
        </div>

        {/* Right Column - Visualization & Hints */}
        <div className="flex flex-col gap-4">
          {/* Spectrum Analyzer */}
          <Section title="Spectrum Analyzer">
            <SpectrumAnalyzer width={400} height={180} barCount={48} />
          </Section>

          {/* Hints */}
          <Section title="Hints">
            <div className="min-h-[80px]">
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  className="text-text-tertiary text-lg mb-2 pl-3 border-l-2 border-border-default"
                >
                  {hint}
                </div>
              ))}

              {hintsRevealed < challenge.hints.length && (
                <button
                  onClick={revealHint}
                  className="bg-transparent border border-border-default rounded-sm text-text-muted cursor-pointer text-md py-1.5 px-3"
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
              {isScoring ? 'Scoring...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {lastResult && (
        <MixingResultsModal
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
 * Results Modal for mixing challenges
 */
interface MixingResultsModalProps {
  result: {
    overall: number;
    stars: 1 | 2 | 3;
    passed: boolean;
    feedback: string[];
  };
  challenge: MixingChallenge;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

function MixingResultsModal({
  result,
  challenge,
  onRetry,
  onNext,
  hasNext,
}: MixingResultsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-modal">
      <div className="bg-bg-tertiary rounded-xl p-8 max-w-[400px] w-[90%] border border-border-medium">
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
            {result.passed ? 'Nice!' : 'Keep Trying'}
          </h2>
          <div className="text-5xl font-bold text-text-primary">
            {result.overall}%
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-6">
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              className="text-text-tertiary text-xl mb-2 pl-3 border-l-2"
              style={{ borderLeftColor: result.passed ? '#22c55e' : '#f59e0b' }}
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
