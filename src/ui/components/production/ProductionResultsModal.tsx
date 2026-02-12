/**
 * Results Modal for production challenges
 * Shows scores, AI feedback, and condition breakdown
 */

import { cn } from '../../utils/cn.ts';
import { useAIFeedback } from '../../hooks/useAIFeedback.ts';
import { getTRPC } from '../../api/trpc.ts';
import type { ProductionChallenge, ProductionGoalTarget } from '../../../core/types.ts';
import type { LayerState } from '../../../core/production-source.ts';

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

export function ProductionResultsModal({
  result,
  challenge,
  layerStates,
  attemptNumber,
  onRetry,
  onNext,
  hasNext,
}: ProductionResultsModalProps) {
  const targetDescription = challenge.target.type === 'goal'
    ? (challenge.target as ProductionGoalTarget).description
    : undefined;

  const { feedback: aiFeedback, loading: feedbackLoading } = useAIFeedback(
    () =>
      getTRPC().then((trpc) =>
        trpc.feedback.generateProduction.mutate({
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
        })
      ),
    [result, challenge, layerStates, attemptNumber]
  );

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
              className={cn(
                'text-text-muted text-md mb-1.5 pl-3 border-l-2',
                result.passed ? 'border-l-[#22c55e44]' : 'border-l-[#f59e0b44]'
              )}
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
              className="flex-1 py-3 border-none rounded-lg text-text-primary cursor-pointer text-xl font-semibold bg-gradient-to-br from-success to-[#16a34a]"
            >
              Next Challenge →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
