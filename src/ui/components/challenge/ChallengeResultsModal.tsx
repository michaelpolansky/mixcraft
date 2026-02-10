/**
 * Generic results modal for challenge views (drum sequencing, sampling, etc.)
 * Sound design uses its own ResultsModal with confetti and parameter comparison.
 */

import type { ReactNode } from 'react';
import type { Recommendation } from '../../../core/player-model.ts';
import { cn } from '../../utils/cn.ts';

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
  /** Optional practice suggestions for weak areas */
  suggestions?: Recommendation[];
  onSuggestionClick?: (challengeId: string) => void;
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
  suggestions,
  onSuggestionClick,
}: ChallengeResultsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[var(--z-modal)]">
      <div className="bg-bg-tertiary rounded-xl p-8 max-w-[450px] w-[90%] border border-border-medium">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={cn(
              'text-[48px] mb-2',
              passed ? 'text-success' : 'text-text-muted'
            )}
          >
            {'★'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </div>
          <h2 className="m-0 mb-2 text-4xl">
            {passed ? successMessage : failMessage}
          </h2>
          <div className="text-[32px] font-bold text-text-primary">
            {overall}%
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-4">
          <div className="text-base text-text-muted uppercase mb-2">
            Score Breakdown
          </div>
          {breakdown}
        </div>

        {/* Feedback */}
        <div className="mb-4">
          {feedback.map((fb, i) => (
            <div
              key={i}
              className={cn(
                'text-text-tertiary text-md mb-1.5 pl-3',
                passed ? 'border-l-2 border-success/25' : 'border-l-2 border-warning/25'
              )}
            >
              {fb}
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        <div className="mt-4 mb-6">
          <div className="text-base text-text-muted uppercase mb-2">
            AI Mentor
          </div>
          <div
            className={cn(
              'bg-bg-primary rounded-md p-3 text-lg text-[#ccc] leading-relaxed',
              aiFeedbackLoading && 'italic'
            )}
          >
            {aiFeedbackLoading && 'Analyzing your work...'}
            {!aiFeedbackLoading && aiFeedback}
            {!aiFeedbackLoading && !aiFeedback && 'AI feedback unavailable'}
          </div>
        </div>

        {/* Practice Suggestions */}
        {passed && suggestions && suggestions.length > 0 && onSuggestionClick && (
          <div className="mb-4">
            <div className="text-base text-text-muted uppercase mb-2">
              Practice More
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.challengeId}
                  onClick={() => onSuggestionClick(s.challengeId)}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-full bg-bg-primary border border-border-medium',
                    'cursor-pointer text-text-secondary hover:text-text-primary hover:border-border-bright',
                    'transition-colors'
                  )}
                >
                  {s.title} &middot; <span className="text-text-muted">{s.reason}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 p-3 bg-border-medium border-none rounded-md text-text-primary cursor-pointer text-xl font-semibold"
          >
            Try Again
          </button>

          {passed && hasNext && onNext && (
            <button
              onClick={onNext}
              className="flex-1 p-3 bg-gradient-to-br from-success to-[#16a34a] border-none rounded-md text-text-primary cursor-pointer text-xl font-semibold"
            >
              Next Challenge &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
