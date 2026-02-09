import { useState } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import { getMixingChallenge, getNextMixingChallenge } from '../../data/challenges/mixing/index.ts';
import { getProductionChallenge, getNextProductionChallenge } from '../../data/challenges/production/index.ts';
import { getSamplingChallenge, getNextSamplingChallenge, getDrumSequencingChallenge, getNextDrumSequencingChallenge } from '../../data/challenges/index.ts';
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

export function useNavigation() {
  const [view, setView] = useState<View>('menu');
  const { loadChallenge, currentChallenge, exitChallenge } = useChallengeStore();
  const [currentMixingChallenge, setCurrentMixingChallenge] = useState<MixingChallenge | null>(null);
  const [currentProductionChallenge, setCurrentProductionChallenge] = useState<ProductionChallenge | null>(null);
  const [currentSamplingChallenge, setCurrentSamplingChallenge] = useState<SamplingChallenge | null>(null);
  const [currentDrumSequencingChallenge, setCurrentDrumSequencingChallenge] = useState<DrumSequencingChallenge | null>(null);

  const handleStartChallenge = (challengeId: string) => {
    loadChallenge(challengeId);
    setView('challenge');
  };

  const handleStartMixingChallenge = (challengeId: string) => {
    const challenge = getMixingChallenge(challengeId);
    if (challenge) {
      setCurrentMixingChallenge(challenge);
      setView('mixing-challenge');
    }
  };

  const handleNextMixingChallenge = () => {
    if (currentMixingChallenge) {
      const next = getNextMixingChallenge(currentMixingChallenge.id);
      if (next) {
        setCurrentMixingChallenge(next);
      } else {
        setCurrentMixingChallenge(null);
        setView('menu');
      }
    }
  };

  const handleStartProductionChallenge = (challengeId: string) => {
    const challenge = getProductionChallenge(challengeId);
    if (challenge) {
      setCurrentProductionChallenge(challenge);
      setView('production-challenge');
    }
  };

  const handleNextProductionChallenge = () => {
    if (currentProductionChallenge) {
      const next = getNextProductionChallenge(currentProductionChallenge.id);
      if (next) {
        setCurrentProductionChallenge(next);
      } else {
        setCurrentProductionChallenge(null);
        setView('menu');
      }
    }
  };

  const handleStartSamplingChallenge = (challengeId: string) => {
    const challenge = getSamplingChallenge(challengeId);
    if (challenge) {
      setCurrentSamplingChallenge(challenge);
      setView('sampling-challenge');
    }
  };

  const handleNextSamplingChallenge = () => {
    if (currentSamplingChallenge) {
      const next = getNextSamplingChallenge(currentSamplingChallenge.id);
      if (next) {
        setCurrentSamplingChallenge(next);
      } else {
        setCurrentSamplingChallenge(null);
        setView('menu');
      }
    }
  };

  const handleStartDrumSequencingChallenge = (challengeId: string) => {
    const challenge = getDrumSequencingChallenge(challengeId);
    if (challenge) {
      setCurrentDrumSequencingChallenge(challenge);
      setView('drum-sequencer-challenge');
    }
  };

  const handleNextDrumSequencingChallenge = () => {
    if (currentDrumSequencingChallenge) {
      const next = getNextDrumSequencingChallenge(currentDrumSequencingChallenge.id);
      if (next) {
        setCurrentDrumSequencingChallenge(next);
      } else {
        setCurrentDrumSequencingChallenge(null);
        setView('menu');
      }
    }
  };

  const handleExitChallenge = () => {
    exitChallenge();
    setCurrentMixingChallenge(null);
    setCurrentProductionChallenge(null);
    setCurrentSamplingChallenge(null);
    setCurrentDrumSequencingChallenge(null);
    setView('menu');
  };

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
    handleStartProductionChallenge,
    handleNextProductionChallenge,
    handleStartSamplingChallenge,
    handleNextSamplingChallenge,
    handleStartDrumSequencingChallenge,
    handleNextDrumSequencingChallenge,
    handleExitChallenge,
  };
}
