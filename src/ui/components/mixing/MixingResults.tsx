/**
 * Results component for multi-track mixing challenges.
 * Fetches AI feedback via useAIFeedback hook and delegates to shared ChallengeResultsModal.
 */

import type { MixingChallenge, EQParams, CompressorFullParams } from '../../../core/types.ts';
import type { MixingScoreResult, TrackEQParams } from '../../stores/mixing-store.ts';
import { useAIFeedback } from '../../hooks/useAIFeedback.ts';
import { getTRPC } from '../../api/trpc.ts';
import { ChallengeResultsModal } from '../challenge/ChallengeResultsModal.tsx';
import { ScoreBreakdownRow } from '../challenge/ScoreBreakdownRow.tsx';

interface MixingResultsProps {
  result: MixingScoreResult;
  challenge: MixingChallenge;
  attemptNumber: number;
  trackParams: Record<string, TrackEQParams>;
  compressorParams: CompressorFullParams;
  busEQParams: EQParams;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function MixingResults({
  result,
  challenge,
  attemptNumber,
  trackParams,
  compressorParams,
  busEQParams,
  onRetry,
  onNext,
  hasNext,
}: MixingResultsProps) {
  const { feedback: aiFeedback, loading: aiFeedbackLoading } = useAIFeedback(
    async () => {
      const trpc = await getTRPC();
      return trpc.feedback.generateMixing.mutate({
        result,
        trackParams: Object.fromEntries(
          Object.entries(trackParams).map(([id, p]) => [
            id,
            {
              low: p.low, mid: p.mid, high: p.high, volume: p.volume, pan: p.pan,
              reverbMix: p.reverbMix,
              compressorThreshold: p.compressorThreshold,
              compressorAmount: p.compressorAmount,
            },
          ])
        ),
        busCompressor: { threshold: compressorParams.threshold, amount: compressorParams.amount },
        busEQ: busEQParams,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          module: challenge.module,
          trackNames: challenge.tracks?.map((t) => t.name) ?? [],
        },
        attemptNumber,
      });
    },
    [result, challenge, attemptNumber]
  );

  // Build breakdown rows from condition results
  const conditionBreakdown = result.breakdown.conditions?.map((c, i) => (
    <div key={i} className="flex items-center gap-2 text-md mb-1">
      <span>{c.passed ? '✓' : '✗'}</span>
      <span className={c.passed ? 'text-success-light' : 'text-text-tertiary'}>
        {c.description}
      </span>
    </div>
  ));

  return (
    <ChallengeResultsModal
      passed={result.passed}
      stars={result.stars}
      overall={result.overall}
      successMessage="Great Mix!"
      failMessage="Keep Mixing"
      breakdown={
        <>
          {result.breakdown.busCompressor !== undefined && (
            <ScoreBreakdownRow label="Bus Compressor" score={result.breakdown.busCompressor} />
          )}
          {conditionBreakdown}
        </>
      }
      feedback={result.feedback}
      aiFeedback={aiFeedback}
      aiFeedbackLoading={aiFeedbackLoading}
      onRetry={onRetry}
      onNext={onNext}
      hasNext={hasNext}
    />
  );
}
