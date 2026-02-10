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
import { allChallenges, modules, allSamplingChallenges, samplingModules, allDrumSequencingChallenges, drumSequencingModules } from '../../data/challenges/index.ts';
import { allMixingChallenges, mixingModules } from '../../data/challenges/mixing/index.ts';
import { allProductionChallenges, productionModules } from '../../data/challenges/production/index.ts';
import type { ChallengeItem } from '../components/menu/ChallengeModuleCard.tsx';
import { cn } from '../utils/cn.ts';

interface MenuViewProps {
  onNavigate: (view: string) => void;
  onStartChallenge: (id: string) => void;
  onStartMixingChallenge: (id: string) => void;
  onStartProductionChallenge: (id: string) => void;
  onStartSamplingChallenge: (id: string) => void;
  onStartDrumSequencingChallenge: (id: string) => void;
}

// Static module definitions — converted from the `as const` module objects to arrays
const sdModules = Object.values(modules);
const mixFundamentalsModules = (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'] as const).map(id => mixingModules[id]);
const mixIntermediateModules = (['I1', 'I2', 'I3', 'I4', 'I5', 'I6'] as const).map(id => mixingModules[id]);
const mixAdvancedModules = (['A1', 'A2', 'A3', 'A4', 'A5'] as const).map(id => mixingModules[id]);
const mixMasteryModules = (['M1', 'M2', 'M3', 'M4'] as const).map(id => mixingModules[id]);
const smModules = Object.values(samplingModules);
const dsModules = Object.values(drumSequencingModules);
const prodModules = Object.values(productionModules);

// Cast challenge arrays to ChallengeItem (they all have id, title, difficulty, module)
const sdChallenges = allChallenges as unknown as ChallengeItem[];
const mixChallenges = allMixingChallenges as unknown as ChallengeItem[];
const smChallenges = allSamplingChallenges as unknown as ChallengeItem[];
const dsChallenges = allDrumSequencingChallenges as unknown as ChallengeItem[];
const prodChallenges = allProductionChallenges as unknown as ChallengeItem[];

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

  // Continue challenge logic
  const continueChallenge = (() => {
    if (totalProgress.completed === 0 || totalProgress.completed === totalProgress.total) return null;
    const next = allChallenges.find(c => !getChallengeProgress(c.id)?.completed);
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

        {/* Sound Design Track */}
        <TrackSection
          title="Challenges"
          color="#666"
          modules={sdModules}
          allChallenges={sdChallenges}
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
          modules={mixFundamentalsModules}
          allChallenges={mixChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, allMixingChallenges)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Intermediate Track */}
        <TrackSection
          title="Mixing Intermediate"
          color="#3b82f6"
          modules={mixIntermediateModules}
          allChallenges={mixChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, allMixingChallenges)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Advanced Track */}
        <TrackSection
          title="Mixing Advanced"
          color="#3b82f6"
          modules={mixAdvancedModules}
          allChallenges={mixChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, allMixingChallenges)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Mixing Mastery Track */}
        <TrackSection
          title="Mixing Mastery"
          color="#3b82f6"
          modules={mixMasteryModules}
          allChallenges={mixChallenges}
          getModuleProgress={(moduleId) => getMixingModuleProgress(moduleId, allMixingChallenges)}
          getChallengeProgress={mixProgress}
          onStartChallenge={onStartMixingChallenge}
        />

        {/* Sampling Track */}
        <TrackSection
          title="Sampling"
          color="#d946ef"
          modules={smModules}
          allChallenges={smChallenges}
          getModuleProgress={(moduleId) => getSamplingModuleProgress(moduleId, allSamplingChallenges)}
          getChallengeProgress={smProgress}
          onStartChallenge={onStartSamplingChallenge}
        />

        {/* Drum Sequencing Track */}
        <TrackSection
          title="Drum Sequencing"
          color="#f97316"
          modules={dsModules}
          allChallenges={dsChallenges}
          getModuleProgress={(moduleId) => getDrumSequencingModuleProgress(moduleId, allDrumSequencingChallenges)}
          getChallengeProgress={dsProgress}
          onStartChallenge={onStartDrumSequencingChallenge}
        />

        {/* Production Track */}
        <TrackSection
          title="Production"
          color="#a855f7"
          modules={prodModules}
          allChallenges={prodChallenges}
          getModuleProgress={(moduleId) => getProductionModuleProgress(moduleId, allProductionChallenges)}
          getChallengeProgress={prodProgress}
          onStartChallenge={onStartProductionChallenge}
        />
      </div>
    </div>
  );
}
