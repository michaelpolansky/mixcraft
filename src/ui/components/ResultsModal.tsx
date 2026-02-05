/**
 * Results modal showing score and breakdown after submission
 */

import { useState, useEffect, useMemo } from 'react';
import type { ScoreResult } from '../../core/sound-comparison.ts';
import type { SynthParams, Challenge } from '../../core/types.ts';
import { generateSummary } from '../../core/sound-comparison.ts';
import { ScoreBar } from './ScoreBar.tsx';
import { trpc } from '../api/trpc.ts';

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
  playerParams: SynthParams;
  targetParams: SynthParams;
  challenge: Challenge;
  attemptNumber: number;
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
        const response = await trpc.feedback.generate.mutate({
          result,
          playerParams,
          targetParams,
          challenge: {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            module: challenge.module,
          },
          attemptNumber,
        });

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
  }, [result, playerParams, targetParams, challenge, attemptNumber]);

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
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

      <div
        style={{
          background: '#141414',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          border: '1px solid #2a2a2a',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* Stars */}
          <div style={{ marginBottom: '16px' }}>{stars}</div>

          {/* Score */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: result.passed ? '#4ade80' : '#ef4444',
              fontFamily: 'monospace',
            }}
          >
            {result.overall}%
          </div>

          {/* Pass/Fail */}
          <div
            style={{
              fontSize: '14px',
              color: result.passed ? '#4ade80' : '#ef4444',
              marginTop: '8px',
            }}
          >
            {result.passed ? 'PASSED' : 'NOT QUITE'}
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            textAlign: 'center',
            color: '#888',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          {summary}
        </div>

        {/* AI Feedback */}
        <div
          style={{
            background: '#0a0a0a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #2a2a2a',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#4ade80',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
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
            {feedbackError && <span style={{ color: '#666' }}>{feedbackError}</span>}
            {aiFeedback}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}
          >
            Breakdown
          </div>

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
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retry
          </button>

          {result.passed && hasNextChallenge && (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Next Challenge
            </button>
          )}

          {!hasNextChallenge && result.passed && (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Complete!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
