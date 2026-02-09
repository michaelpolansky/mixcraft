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
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #2a2a2a',
        marginBottom: '16px',
      }}
    >
      {/* Module header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {title}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            {description}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#eab308', fontSize: '13px' }}>
            {'★'.repeat(moduleProgress.stars)}
            <span style={{ color: '#333' }}>
              {'★'.repeat(moduleProgress.total * 3 - moduleProgress.stars)}
            </span>
          </div>
          <div
            style={{
              padding: '4px 10px',
              background: pct === 100 ? '#22c55e' : '#222',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              color: pct === 100 ? '#000' : '#888',
            }}
          >
            {moduleProgress.completed}/{moduleProgress.total}
          </div>
        </div>
      </div>

      {/* Challenge list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
