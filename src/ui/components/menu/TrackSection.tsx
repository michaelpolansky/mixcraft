import type { ReactNode } from 'react';
import { ChallengeModuleCard, type ModuleProgress, type ChallengeItem } from './ChallengeModuleCard.tsx';

interface ModuleDef {
  id: string;
  title: string;
  description: string;
}

interface TrackSectionProps {
  title: string;
  color: string;
  modules: ModuleDef[];
  allChallenges: ChallengeItem[];
  getModuleProgress: (moduleId: string) => ModuleProgress;
  getChallengeProgress: (id: string) => { stars: number; completed: boolean } | undefined;
  onStartChallenge: (id: string) => void;
  children?: ReactNode;
}

export function TrackSection({
  title,
  color,
  modules,
  allChallenges,
  getModuleProgress,
  getChallengeProgress,
  onStartChallenge,
  children,
}: TrackSectionProps) {
  return (
    <>
      <h2
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
          marginTop: title === 'Challenges' ? undefined : '32px',
        }}
      >
        {title}
      </h2>

      {children}

      {modules.map((mod) => {
        const moduleChallenges = allChallenges.filter(c => c.module === mod.id);
        return (
          <ChallengeModuleCard
            key={mod.id}
            title={mod.title}
            description={mod.description}
            moduleProgress={getModuleProgress(mod.id)}
            challenges={moduleChallenges}
            getProgress={getChallengeProgress}
            onStartChallenge={onStartChallenge}
          />
        );
      })}
    </>
  );
}
