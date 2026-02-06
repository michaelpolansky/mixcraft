/**
 * Mixing Challenge View
 * Main view for playing mixing challenges (EQ, compression, etc.)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useMixingStore } from '../stores/mixing-store.ts';
import { EQControl, CompressorControl, SpectrumAnalyzer } from '../components/index.ts';
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
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          maxWidth: '1000px',
        }}
      >
        {/* Left Column - Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Play/Stop */}
          <Section title="Audio Source">
            <button
              onClick={togglePlayback}
              style={{
                padding: '12px 24px',
                background: isPlaying
                  ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                  : 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Spectrum Analyzer */}
          <Section title="Spectrum Analyzer">
            <SpectrumAnalyzer width={400} height={180} barCount={48} />
          </Section>

          {/* Hints */}
          <Section title="Hints">
            <div style={{ minHeight: '80px' }}>
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
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

              {hintsRevealed < challenge.hints.length && (
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
          maxWidth: '400px',
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
            {result.passed ? 'Nice!' : 'Keep Trying'}
          </h2>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {result.overall}%
          </div>
        </div>

        {/* Feedback */}
        <div style={{ marginBottom: '24px' }}>
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '8px',
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
