/**
 * Generic results modal for challenge views (drum sequencing, sampling, etc.)
 * Sound design uses its own ResultsModal with confetti and parameter comparison.
 */

import type { ReactNode } from 'react';

interface ChallengeResultsModalProps {
  passed: boolean;
  stars: number;
  overall: number;
  successMessage: string;
  failMessage: string;
  breakdown: ReactNode;
  feedback: string[];
  aiFeedback: string | null;
  aiFeedbackLoading: boolean;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function ChallengeResultsModal({
  passed,
  stars,
  overall,
  successMessage,
  failMessage,
  breakdown,
  feedback,
  aiFeedback,
  aiFeedbackLoading,
  onRetry,
  onNext,
  hasNext,
}: ChallengeResultsModalProps) {
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
              color: passed ? '#22c55e' : '#666',
            }}
          >
            {'★'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
            {passed ? successMessage : failMessage}
          </h2>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {overall}%
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
          {breakdown}
        </div>

        {/* Feedback */}
        <div style={{ marginBottom: '16px' }}>
          {feedback.map((fb, i) => (
            <div
              key={i}
              style={{
                color: '#888',
                fontSize: '12px',
                marginBottom: '6px',
                paddingLeft: '12px',
                borderLeft: `2px solid ${passed ? '#22c55e44' : '#f59e0b44'}`,
              }}
            >
              {fb}
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            AI Mentor
          </div>
          <div
            style={{
              background: '#0f0f0f',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: '#ccc',
              lineHeight: 1.5,
              fontStyle: aiFeedbackLoading ? 'italic' : 'normal',
            }}
          >
            {aiFeedbackLoading && 'Analyzing your work...'}
            {!aiFeedbackLoading && aiFeedback}
            {!aiFeedbackLoading && !aiFeedback && 'AI feedback unavailable'}
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

          {passed && hasNext && onNext && (
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
              Next Challenge &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
