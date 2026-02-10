import { useState } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import { useMixingStore } from '../stores/mixing-store.ts';
import { useProductionStore } from '../stores/production-store.ts';
import { useSamplerStore } from '../stores/sampler-store.ts';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import { useIsMobile } from '../hooks/useMediaQuery.ts';
import { AuthButton } from '../components/AuthButton.tsx';
import { AuthModal } from '../components/AuthModal.tsx';
import { ProgressStats } from '../components/menu/ProgressStats.tsx';
import { SandboxButtons } from '../components/menu/SandboxButtons.tsx';
import { OnboardingTooltip } from '../components/menu/OnboardingTooltip.tsx';
import { TrackSection } from '../components/menu/TrackSection.tsx';
import { RecommendedChallenges } from '../components/menu/RecommendedChallenges.tsx';
import { usePlayerModel } from '../hooks/usePlayerModel.ts';
import {
  sdMenuChallenges,
  mixingMenuChallenges,
  productionMenuChallenges,
  samplingMenuChallenges,
  drumSequencingMenuChallenges,
} from '../../data/challenges/menu-metadata.ts';
import {
  sdModules,
  mixingFundamentalsModules,
  mixingIntermediateModules,
  mixingAdvancedModules,
  mixingMasteryModules,
  productionModules as prodModules,
  samplingModules as smModules,
  drumSequencingModules as dsModules,
} from '../../data/challenges/menu-modules.ts';
import { cn } from '../utils/cn.ts';

interface MenuViewProps {
  onNavigate: (view: string) => void;
  onStartChallenge: (id: string) => void;
  onStartMixingChallenge: (id: string) => void;
  onStartProductionChallenge: (id: string) => void;
  onStartSamplingChallenge: (id: string) => void;
  onStartDrumSequencingChallenge: (id: string) => void;
}

export function MenuView({
  onNavigate,
  onStartChallenge,
  onStartMixingChallenge,
  onStartProductionChallenge,
  onStartSamplingChallenge,
  onStartDrumSequencingChallenge,
}: MenuViewProps) {
  const isMobile = useIsMobile();

  // Progress stores
  const { getChallengeProgress, getTotalProgress, getModuleProgress } = useChallengeStore();
  const { getChallengeProgress: getMixingProgress, getModuleProgress: getMixingModuleProgress } = useMixingStore();
  const { getChallengeProgress: getProductionProgress, getModuleProgress: getProductionModuleProgress } = useProductionStore();
  const { getChallengeProgress: getSamplingProgress, getModuleProgress: getSamplingModuleProgress } = useSamplerStore();
  const { getChallengeProgress: getDrumSequencingProgress, getModuleProgress: getDrumSequencingModuleProgress } = useDrumSequencerStore();

  // Adaptive curriculum
  const { recommendations, totalAttempted } = usePlayerModel();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('mixcraft-onboarding-seen');
  });

  const dismissOnboarding = () => {
    localStorage.setItem('mixcraft-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  // Total progress for stats + continue button
  const totalProgress = getTotalProgress();

  // Continue challenge logic — uses lightweight metadata, no full challenge data needed
  const continueChallenge = (() => {
    if (totalProgress.completed === 0 || totalProgress.completed === totalProgress.total) return null;
    const next = sdMenuChallenges.find(c => !getChallengeProgress(c.id)?.completed);
    if (!next) return null;
    return { id: next.id, title: next.title };
  })();

  // Normalize progress getters to { stars, completed } | undefined
  const sdProgress = (id: string) => {
    const p = getChallengeProgress(id);
    return p ? { stars: p.stars, completed: p.completed } : undefined;
  };
  const mixProgress = (id: string) => {
    const p = getMixingProgress(id);
    return p ? { stars: p.stars, completed: p.completed } : undefined;
  };
  const prodProgress = (id: string) => {
    const p = getProductionProgress(id);
    return p ? { stars: p.stars, completed: p.completed } : undefined;
  };
  const smProgress = (id: string) => {
    const p = getSamplingProgress(id);
    return p ? { stars: p.stars, completed: p.completed } : undefined;
  };
  const dsProgress = (id: string) => {
    const p = getDrumSequencingProgress(id);
    return p ? { stars: p.stars, completed: p.completed } : undefined;
  };

  // Cast metadata arrays for store getModuleProgress (stores only use .id and .module)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mixChallengesForProgress = mixingMenuChallenges as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prodChallengesForProgress = productionMenuChallenges as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const smChallengesForProgress = samplingMenuChallenges as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dsChallengesForProgress = drumSequencingMenuChallenges as any;

  return (
    <div className={cn(
      'min-h-screen bg-bg-primary text-text-primary font-sans',
      isMobile ? 'py-6 px-4' : 'p-12'
    )}>
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-5xl font-light text-success-light m-0">
            MIXCRAFT
          </h1>
          <AuthButton />
        </div>
        <p className="text-text-muted mb-6">
          Learn Sound Design Through Play
        </p>

        <AuthModal />

        <ProgressStats
          completed={totalProgress.completed}
          total={totalProgress.total}
          stars={totalProgress.stars}
          isMobile={isMobile}
        />

        <SandboxButtons
          isMobile={isMobile}
          continueChallenge={continueChallenge}
          onContinue={onStartChallenge}
          onNavigate={onNavigate}
        />

        <RecommendedChallenges
          recommendations={recommendations}
          totalAttempted={totalAttempted}
          onStartChallenge={onStartChallenge}
          onStartMixingChallenge={onStartMixingChallenge}
          onStartProductionChallenge={onStartProductionChallenge}
          onStartSamplingChallenge={onStartSamplingChallenge}
          onStartDrumSequencingChallenge={onStartDrumSequencingChallenge}
        />

        {/* Sound Design Track */}
        <TrackSection
          title="Challenges"
          color="#666"
          modules={sdModules}
          allChallenges={sdMenuChallenges}
          getModuleProgress={getModuleProgress}
          getChallengeProgress={sdProgress}
          onStartChallenge={onStartChallenge}
        >
          <OnboardingTooltip visible={showOnboarding} onDismiss={dismissOnboarding} />
        </TrackSection>

        {/* Mixing Fundamentals Track (F1-F8 only) */}
        <TrackSection
          title="Mixing Fundamentals"
          color="#3b82f6"
          modules={mixingFundamentalsModules}
          allChallenges={mixingMenuChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, mixChallengesForProgress)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Intermediate Track */}
        <TrackSection
          title="Mixing Intermediate"
          color="#3b82f6"
          modules={mixingIntermediateModules}
          allChallenges={mixingMenuChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, mixChallengesForProgress)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Advanced Track */}
        <TrackSection
          title="Mixing Advanced"
          color="#3b82f6"
          modules={mixingAdvancedModules}
          allChallenges={mixingMenuChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, mixChallengesForProgress)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Mastery Track */}
        <TrackSection
          title="Mixing Mastery"
          color="#3b82f6"
          modules={mixingMasteryModules}
          allChallenges={mixingMenuChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, mixChallengesForProgress)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Sampling Track */}
        <TrackSection
          title="Sampling"
          color="#d946ef"
          modules={smModules}
          allChallenges={samplingMenuChallenges}
          getModuleProgress={(moduleId) => getSamplingModuleProgress(moduleId, smChallengesForProgress)}
          getChallengeProgress={smProgress}
          onStartChallenge={onStartSamplingChallenge}
        />

        {/* Drum Sequencing Track */}
        <TrackSection
          title="Drum Sequencing"
          color="#f97316"
          modules={dsModules}
          allChallenges={drumSequencingMenuChallenges}
          getModuleProgress={(moduleId) => getDrumSequencingModuleProgress(moduleId, dsChallengesForProgress)}
          getChallengeProgress={dsProgress}
          onStartChallenge={onStartDrumSequencingChallenge}
        />

        {/* Production Track */}
        <TrackSection
          title="Production"
          color="#a855f7"
          modules={prodModules}
          allChallenges={productionMenuChallenges}
          getModuleProgress={(moduleId) => getProductionModuleProgress(moduleId, prodChallengesForProgress)}
          getChallengeProgress={prodProgress}
          onStartChallenge={onStartProductionChallenge}
        />
      </div>
    </div>
  );
}
