import { useState, useRef, useCallback } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import type { MixingChallenge, ProductionChallenge, SamplingChallenge, DrumSequencingChallenge } from '../../core/types.ts';

export type View =
  | 'menu'
  | 'sandbox'
  | 'fm-sandbox'
  | 'additive-sandbox'
  | 'sampler'
  | 'drum-sequencer'
  | 'challenge'
  | 'mixing-challenge'
  | 'production-challenge'
  | 'sampling-challenge'
  | 'drum-sequencer-challenge';

/**
 * Lazy-loaded challenge data modules.
 * These are loaded on first challenge navigation, not on page load.
 * This keeps ~300KB of challenge data out of the initial bundle.
 */
type MixingModule = typeof import('../../data/challenges/mixing/index.ts');
type ProductionModule = typeof import('../../data/challenges/production/index.ts');
type MainModule = typeof import('../../data/challenges/index.ts');

let mixingModule: MixingModule | null = null;
let productionModule: ProductionModule | null = null;
let mainModule: MainModule | null = null;

async function getMixingModule(): Promise<MixingModule> {
  if (!mixingModule) {
    mixingModule = await import('../../data/challenges/mixing/index.ts');
  }
  return mixingModule;
}

async function getProductionModule(): Promise<ProductionModule> {
  if (!productionModule) {
    productionModule = await import('../../data/challenges/production/index.ts');
  }
  return productionModule;
}

async function getMainModule(): Promise<MainModule> {
  if (!mainModule) {
    mainModule = await import('../../data/challenges/index.ts');
  }
  return mainModule;
}

export function useNavigation() {
  const [view, setView] = useState<View>('menu');
  const { loadChallenge, currentChallenge, exitChallenge } = useChallengeStore();
  const [currentMixingChallenge, setCurrentMixingChallenge] = useState<MixingChallenge | null>(null);
  const [currentProductionChallenge, setCurrentProductionChallenge] = useState<ProductionChallenge | null>(null);
  const [currentSamplingChallenge, setCurrentSamplingChallenge] = useState<SamplingChallenge | null>(null);
  const [currentDrumSequencingChallenge, setCurrentDrumSequencingChallenge] = useState<DrumSequencingChallenge | null>(null);

  // Cache module references after first load for synchronous hasNext checks
  const mixingModRef = useRef<MixingModule | null>(mixingModule);
  const productionModRef = useRef<ProductionModule | null>(productionModule);
  const mainModRef = useRef<MainModule | null>(mainModule);

  const handleStartChallenge = useCallback((challengeId: string) => {
    loadChallenge(challengeId);
    setView('challenge');
  }, [loadChallenge]);

  const handleStartMixingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMixingModule();
    mixingModRef.current = mod;
    const challenge = mod.getMixingChallenge(challengeId);
    if (challenge) {
      setCurrentMixingChallenge(challenge);
      setView('mixing-challenge');
    }
  }, []);

  const handleNextMixingChallenge = useCallback(async () => {
    if (currentMixingChallenge) {
      const mod = await getMixingModule();
      mixingModRef.current = mod;
      const next = mod.getNextMixingChallenge(currentMixingChallenge.id);
      if (next) {
        setCurrentMixingChallenge(next);
      } else {
        setCurrentMixingChallenge(null);
        setView('menu');
      }
    }
  }, [currentMixingChallenge]);

  const handleStartProductionChallenge = useCallback(async (challengeId: string) => {
    const mod = await getProductionModule();
    productionModRef.current = mod;
    const challenge = mod.getProductionChallenge(challengeId);
    if (challenge) {
      setCurrentProductionChallenge(challenge);
      setView('production-challenge');
    }
  }, []);

  const handleNextProductionChallenge = useCallback(async () => {
    if (currentProductionChallenge) {
      const mod = await getProductionModule();
      productionModRef.current = mod;
      const next = mod.getNextProductionChallenge(currentProductionChallenge.id);
      if (next) {
        setCurrentProductionChallenge(next);
      } else {
        setCurrentProductionChallenge(null);
        setView('menu');
      }
    }
  }, [currentProductionChallenge]);

  const handleStartSamplingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMainModule();
    mainModRef.current = mod;
    const challenge = mod.getSamplingChallenge(challengeId);
    if (challenge) {
      setCurrentSamplingChallenge(challenge);
      setView('sampling-challenge');
    }
  }, []);

  const handleNextSamplingChallenge = useCallback(async () => {
    if (currentSamplingChallenge) {
      const mod = await getMainModule();
      mainModRef.current = mod;
      const next = mod.getNextSamplingChallenge(currentSamplingChallenge.id);
      if (next) {
        setCurrentSamplingChallenge(next);
      } else {
        setCurrentSamplingChallenge(null);
        setView('menu');
      }
    }
  }, [currentSamplingChallenge]);

  const handleStartDrumSequencingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMainModule();
    mainModRef.current = mod;
    const challenge = mod.getDrumSequencingChallenge(challengeId);
    if (challenge) {
      setCurrentDrumSequencingChallenge(challenge);
      setView('drum-sequencer-challenge');
    }
  }, []);

  const handleNextDrumSequencingChallenge = useCallback(async () => {
    if (currentDrumSequencingChallenge) {
      const mod = await getMainModule();
      mainModRef.current = mod;
      const next = mod.getNextDrumSequencingChallenge(currentDrumSequencingChallenge.id);
      if (next) {
        setCurrentDrumSequencingChallenge(next);
      } else {
        setCurrentDrumSequencingChallenge(null);
        setView('menu');
      }
    }
  }, [currentDrumSequencingChallenge]);

  const handleExitChallenge = useCallback(() => {
    exitChallenge();
    setCurrentMixingChallenge(null);
    setCurrentProductionChallenge(null);
    setCurrentSamplingChallenge(null);
    setCurrentDrumSequencingChallenge(null);
    setView('menu');
  }, [exitChallenge]);

  // hasNext flags — use cached module refs (available after first challenge load)
  const hasNextMixingChallenge = currentMixingChallenge && mixingModRef.current
    ? !!mixingModRef.current.getNextMixingChallenge(currentMixingChallenge.id)
    : false;
  const hasNextProductionChallenge = currentProductionChallenge && productionModRef.current
    ? !!productionModRef.current.getNextProductionChallenge(currentProductionChallenge.id)
    : false;
  const hasNextSamplingChallenge = currentSamplingChallenge && mainModRef.current
    ? !!mainModRef.current.getNextSamplingChallenge(currentSamplingChallenge.id)
    : false;
  const hasNextDrumSequencingChallenge = currentDrumSequencingChallenge && mainModRef.current
    ? !!mainModRef.current.getNextDrumSequencingChallenge(currentDrumSequencingChallenge.id)
    : false;

  return {
    view,
    setView,
    currentChallenge,
    currentMixingChallenge,
    currentProductionChallenge,
    currentSamplingChallenge,
    currentDrumSequencingChallenge,
    handleStartChallenge,
    handleStartMixingChallenge,
    handleNextMixingChallenge,
    hasNextMixingChallenge,
    handleStartProductionChallenge,
    handleNextProductionChallenge,
    hasNextProductionChallenge,
    handleStartSamplingChallenge,
    handleNextSamplingChallenge,
    hasNextSamplingChallenge,
    handleStartDrumSequencingChallenge,
    handleNextDrumSequencingChallenge,
    hasNextDrumSequencingChallenge,
    handleExitChallenge,
  };
}
