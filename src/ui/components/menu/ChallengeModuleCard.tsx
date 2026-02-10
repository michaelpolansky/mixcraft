import { cn } from '../../utils/cn.ts';
import { ChallengeButton } from './ChallengeButton.tsx';

export interface ModuleProgress {
  completed: number;
  total: number;
  stars: number;
}

export interface ChallengeItem {
  id: string;
  title: string;
  difficulty: number;
  module: string;
}

interface ChallengeModuleCardProps {
  title: string;
  description: string;
  moduleProgress: ModuleProgress;
  challenges: ChallengeItem[];
  getProgress: (id: string) => { stars: number; completed: boolean } | undefined;
  onStartChallenge: (id: string) => void;
}

export function ChallengeModuleCard({
  title,
  description,
  moduleProgress,
  challenges,
  getProgress,
  onStartChallenge,
}: ChallengeModuleCardProps) {
  const pct = moduleProgress.total > 0
    ? Math.round((moduleProgress.completed / moduleProgress.total) * 100)
    : 0;

  return (
    <div className="bg-[#141414] rounded-lg p-5 border border-border-default mb-4">
      {/* Module header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h3 className="m-0 text-2xl font-semibold">{title}</h3>
          <p className="mt-1 mb-0 text-lg text-text-muted">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-warning text-lg">
            {'★'.repeat(moduleProgress.stars)}
            <span className="text-border-medium">
              {'★'.repeat(moduleProgress.total * 3 - moduleProgress.stars)}
            </span>
          </div>
          <div
            className={cn(
              'py-1 px-2.5 rounded-xl text-md font-medium',
              pct === 100 ? 'bg-success text-bg-primary' : 'bg-bg-quaternary text-text-tertiary'
            )}
          >
            {moduleProgress.completed}/{moduleProgress.total}
          </div>
        </div>
      </div>

      {/* Challenge list */}
      <div className="flex flex-col gap-2">
        {challenges.map((challenge) => {
          const progress = getProgress(challenge.id);
          return (
            <ChallengeButton
              key={challenge.id}
              title={challenge.title}
              difficulty={challenge.difficulty}
              stars={progress?.stars ?? 0}
              completed={progress?.completed ?? false}
              onClick={() => onStartChallenge(challenge.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
