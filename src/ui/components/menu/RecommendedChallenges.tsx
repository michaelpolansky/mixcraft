/**
 * Recommended challenges section for the menu.
 * Shows 3-5 adaptive recommendations based on player weaknesses.
 * Only renders after player has attempted >= 5 challenges.
 */

import type { Recommendation } from '../../../core/player-model.ts';
import { getTrackFromId } from '../../hooks/hash-routing.ts';
import { cn } from '../../utils/cn.ts';

const TRACK_COLORS: Record<string, string> = {
  sd: '#4ade80',
  mixing: '#3b82f6',
  production: '#a855f7',
  sampling: '#d946ef',
  'drum-sequencing': '#f97316',
};

interface RecommendedChallengesProps {
  recommendations: Recommendation[];
  totalAttempted: number;
  onStartChallenge: (challengeId: string) => void;
  onStartMixingChallenge: (challengeId: string) => void;
  onStartProductionChallenge: (challengeId: string) => void;
  onStartSamplingChallenge: (challengeId: string) => void;
  onStartDrumSequencingChallenge: (challengeId: string) => void;
}

export function RecommendedChallenges({
  recommendations,
  totalAttempted,
  onStartChallenge,
  onStartMixingChallenge,
  onStartProductionChallenge,
  onStartSamplingChallenge,
  onStartDrumSequencingChallenge,
}: RecommendedChallengesProps) {
  if (totalAttempted < 5 || recommendations.length === 0) return null;

  function handleClick(challengeId: string) {
    const track = getTrackFromId(challengeId);
    switch (track) {
      case 'sd': onStartChallenge(challengeId); break;
      case 'mixing': onStartMixingChallenge(challengeId); break;
      case 'production': onStartProductionChallenge(challengeId); break;
      case 'sampling': onStartSamplingChallenge(challengeId); break;
      case 'drum-sequencing': onStartDrumSequencingChallenge(challengeId); break;
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-text-secondary mb-3">Recommended For You</h2>
      <div className="flex gap-3 flex-wrap">
        {recommendations.map((rec) => {
          const track = getTrackFromId(rec.challengeId);
          const color = TRACK_COLORS[track] ?? '#888';
          return (
            <button
              key={rec.challengeId}
              onClick={() => handleClick(rec.challengeId)}
              className={cn(
                'bg-bg-secondary border border-border-medium rounded-lg px-4 py-3 text-left cursor-pointer',
                'transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright',
                'outline-none focus:ring-2 focus:ring-interactive-focus',
                'min-w-[180px] flex-1 max-w-[250px]'
              )}
            >
              <div className="text-sm font-semibold text-text-primary mb-1">{rec.title}</div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {rec.module}
                </span>
                <span className="text-xs text-text-muted">{rec.reason}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
