/**
 * Results modal showing score and breakdown after submission
 */

import { useState, useEffect, useMemo } from 'react';
import { cn } from '../utils/cn.ts';
import type { ScoreResult } from '../../core/sound-comparison.ts';
import type { SynthParams, FMSynthParams, AdditiveSynthParams, Challenge } from '../../core/types.ts';
import { generateSummary } from '../../core/sound-comparison.ts';
import { ScoreBar } from './ScoreBar.tsx';
import { getTRPC } from '../api/trpc.ts';

// Confetti colors
const CONFETTI_COLORS = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];

// Generate random confetti particles
function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));
}

interface ResultsModalProps {
  result: ScoreResult;
  playerParams: SynthParams | FMSynthParams | AdditiveSynthParams;
  targetParams: SynthParams | FMSynthParams | AdditiveSynthParams;
  challenge: Challenge;
  attemptNumber: number;
  synthesisType?: 'subtractive' | 'fm' | 'additive';
  onRetry: () => void;
  onNext: () => void;
  hasNextChallenge: boolean;
}

export function ResultsModal({
  result,
  playerParams,
  targetParams,
  challenge,
  attemptNumber,
  synthesisType = 'subtractive',
  onRetry,
  onNext,
  hasNextChallenge,
}: ResultsModalProps) {
  const summary = generateSummary(result);

  // Generate confetti particles for success
  const confetti = useMemo(
    () => (result.passed ? generateConfetti(50) : []),
    [result.passed]
  );

  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Fetch AI feedback on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchFeedback() {
      try {
        const trpc = await getTRPC();
        let response: { feedback: string };

        if (synthesisType === 'fm') {
          // FM Synthesis feedback
          const fmPlayerParams = playerParams as FMSynthParams;
          const fmTargetParams = targetParams as FMSynthParams;
          response = await trpc.feedback.generateFMSynthesis.mutate({
            result: {
              overall: result.overall,
              stars: result.stars as 1 | 2 | 3,
              passed: result.passed,
              breakdown: {
                harmonicity: (result as unknown as { breakdown: { harmonicity: number } }).breakdown.harmonicity ?? 0,
                modulationIndex: (result as unknown as { breakdown: { modulationIndex: number } }).breakdown.modulationIndex ?? 0,
                carrierType: (result as unknown as { breakdown: { carrierType: number } }).breakdown.carrierType ?? 0,
                modulatorType: (result as unknown as { breakdown: { modulatorType: number } }).breakdown.modulatorType ?? 0,
                envelope: (result as unknown as { breakdown: { envelope: number } }).breakdown.envelope ?? 0,
              },
            },
            playerParams: fmPlayerParams,
            targetParams: fmTargetParams,
            challenge: {
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              module: challenge.module,
            },
            attemptNumber,
          });
        } else if (synthesisType === 'additive') {
          // Additive Synthesis feedback
          const additivePlayerParams = playerParams as AdditiveSynthParams;
          const additiveTargetParams = targetParams as AdditiveSynthParams;
          response = await trpc.feedback.generateAdditiveSynthesis.mutate({
            result: {
              overall: result.overall,
              stars: result.stars as 1 | 2 | 3,
              passed: result.passed,
              breakdown: {
                harmonics: (result as unknown as { breakdown: { harmonics: number } }).breakdown.harmonics ?? 0,
                envelope: (result as unknown as { breakdown: { envelope: number } }).breakdown.envelope ?? 0,
              },
            },
            playerParams: additivePlayerParams,
            targetParams: additiveTargetParams,
            challenge: {
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              module: challenge.module,
            },
            attemptNumber,
          });
        } else {
          // Subtractive Synthesis feedback (default)
          response = await trpc.feedback.generate.mutate({
            result,
            playerParams: playerParams as SynthParams,
            targetParams: targetParams as SynthParams,
            challenge: {
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              module: challenge.module,
            },
            attemptNumber,
          });
        }

        if (!cancelled) {
          setAiFeedback(response.feedback);
          setFeedbackLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch AI feedback:', error);
          setFeedbackError('AI feedback unavailable');
          setFeedbackLoading(false);
        }
      }
    }

    fetchFeedback();

    return () => {
      cancelled = true;
    };
  }, [result, playerParams, targetParams, challenge, attemptNumber, synthesisType]);

  // Star display
  const stars = Array.from({ length: 3 }, (_, i) => (
    <span
      key={i}
      style={{
        fontSize: '32px',
        color: i < result.stars ? '#eab308' : '#333',
        marginRight: '4px',
      }}
    >
      ★
    </span>
  ));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] overflow-hidden">
      {/* Confetti animation */}
      {result.passed && (
        <style>
          {`
            @keyframes confetti-fall {
              0% {
                transform: translateY(-20px) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}
        </style>
      )}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            borderRadius: particle.id % 2 === 0 ? '50%' : '2px',
            animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s forwards`,
            transform: `rotate(${particle.rotation}deg)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div className="bg-bg-secondary rounded-2xl p-8 max-w-[400px] w-[90%] border border-border-default relative z-[1]">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Stars */}
          <div className="mb-4">{stars}</div>

          {/* Score */}
          <div className={cn('text-5xl font-bold font-mono', result.passed ? 'text-success-light' : 'text-danger')}>
            {result.overall}%
          </div>

          {/* Pass/Fail */}
          <div className={cn('text-md mt-2', result.passed ? 'text-success-light' : 'text-danger')}>
            {result.passed ? 'PASSED' : 'NOT QUITE'}
          </div>
        </div>

        {/* Summary */}
        <div className="text-center text-text-muted mb-6 text-md">
          {summary}
        </div>

        {/* AI Feedback */}
        <div className="bg-bg-primary rounded-lg p-4 mb-6 border border-border-default">
          <div className="text-sm text-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>✦</span> AI Mentor
          </div>
          <div
            style={{
              color: '#ccc',
              fontSize: '14px',
              lineHeight: '1.5',
              fontStyle: feedbackLoading ? 'italic' : 'normal',
            }}
          >
            {feedbackLoading && 'Analyzing your sound...'}
            {feedbackError && <span className="text-text-muted">{feedbackError}</span>}
            {aiFeedback}
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-6">
          <div className="text-sm text-text-muted uppercase tracking-wider mb-3">
            Breakdown
          </div>

          {synthesisType === 'fm' ? (
            <>
              <ScoreBar
                label="Harmonicity"
                score={(result as unknown as { breakdown: { harmonicity: number } }).breakdown.harmonicity ?? 0}
                feedback="Frequency ratio between carrier and modulator"
              />
              <ScoreBar
                label="Mod Index"
                score={(result as unknown as { breakdown: { modulationIndex: number } }).breakdown.modulationIndex ?? 0}
                feedback="Depth of frequency modulation"
              />
              <ScoreBar
                label="Carrier"
                score={(result as unknown as { breakdown: { carrierType: number } }).breakdown.carrierType ?? 0}
                feedback="Carrier waveform match"
              />
              <ScoreBar
                label="Modulator"
                score={(result as unknown as { breakdown: { modulatorType: number } }).breakdown.modulatorType ?? 0}
                feedback="Modulator waveform match"
              />
              <ScoreBar
                label="Envelope"
                score={(result as unknown as { breakdown: { envelope: number } }).breakdown.envelope ?? 0}
                feedback="ADSR envelope shape"
              />
            </>
          ) : synthesisType === 'additive' ? (
            <>
              <ScoreBar
                label="Harmonics"
                score={(result as unknown as { breakdown: { harmonics: number } }).breakdown.harmonics ?? 0}
                feedback="Harmonic balance and timbre"
              />
              <ScoreBar
                label="Envelope"
                score={(result as unknown as { breakdown: { envelope: number } }).breakdown.envelope ?? 0}
                feedback="ADSR envelope shape"
              />
            </>
          ) : (
            <>
              <ScoreBar
                label="Brightness"
                score={result.breakdown.brightness.score}
                feedback={result.breakdown.brightness.feedback}
              />
              <ScoreBar
                label="Attack"
                score={result.breakdown.attack.score}
                feedback={result.breakdown.attack.feedback}
              />
              <ScoreBar
                label="Filter"
                score={result.breakdown.filter.score}
                feedback={result.breakdown.filter.feedback}
              />
              <ScoreBar
                label="Envelope"
                score={result.breakdown.envelope.score}
                feedback={result.breakdown.envelope.feedback}
              />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-6 bg-bg-tertiary border border-border-medium rounded-lg text-text-muted cursor-pointer text-md"
          >
            Retry
          </button>

          {result.passed && hasNextChallenge && (
            <button
              onClick={onNext}
              className="flex-1 py-3 px-6 bg-gradient-to-br from-success to-[#16a34a] border-none rounded-lg text-white cursor-pointer text-md font-semibold"
            >
              Next Challenge
            </button>
          )}

          {!hasNextChallenge && result.passed && (
            <button
              onClick={onNext}
              className="flex-1 py-3 px-6 bg-gradient-to-br from-success to-[#16a34a] border-none rounded-lg text-white cursor-pointer text-md font-semibold"
            >
              Complete!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
