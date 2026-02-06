/**
 * Sampling Challenges Registry
 * Central index of all sampling challenges (SM1-SM6)
 */

import type { SamplingChallenge } from '../../../core/types.ts';

// SM1 - Sample Basics
import { sm1_01, sm1_02, sm1_03, sm1_04 } from './sm1/index.ts';

// SM2 - Building Instruments
import { sm2_01, sm2_02, sm2_03, sm2_04 } from './sm2/index.ts';

// SM3 - Time & Pitch
import { sm3_01, sm3_02, sm3_03, sm3_04 } from './sm3/index.ts';

// SM4 - Chopping
import { sm4_01, sm4_02, sm4_03, sm4_04 } from './sm4/index.ts';

// SM5 - Flipping
import { sm5_01, sm5_02, sm5_03, sm5_04 } from './sm5/index.ts';

// SM6 - Polish & Clean
import { sm6_01, sm6_02, sm6_03, sm6_04 } from './sm6/index.ts';

/**
 * All sampling challenges indexed by ID
 */
export const samplingChallengesById: Record<string, SamplingChallenge> = {
  // SM1 - Sample Basics
  'sm1-01-load-and-play': sm1_01,
  'sm1-02-trigger-one-shot': sm1_02,
  'sm1-03-pitch-shift': sm1_03,
  'sm1-04-layer-sounds': sm1_04,
  // SM2 - Building Instruments
  'sm2-01-build-a-kit': sm2_01,
  'sm2-02-key-mapping': sm2_02,
  'sm2-03-velocity-layers': sm2_03,
  'sm2-04-multi-sample': sm2_04,
  // SM3 - Time & Pitch
  'sm3-01-time-stretch': sm3_01,
  'sm3-02-tune-to-key': sm3_02,
  'sm3-03-warp-timing': sm3_03,
  'sm3-04-tempo-match': sm3_04,
  // SM4 - Chopping
  'sm4-01-slice-breaks': sm4_01,
  'sm4-02-chop-vocals': sm4_02,
  'sm4-03-manual-slices': sm4_03,
  'sm4-04-trigger-patterns': sm4_04,
  // SM5 - Flipping
  'sm5-01-find-the-loop': sm5_01,
  'sm5-02-rearrange': sm5_02,
  'sm5-03-obscure-source': sm5_03,
  'sm5-04-creative-flip': sm5_04,
  // SM6 - Polish & Clean
  'sm6-01-trim-silence': sm6_01,
  'sm6-02-fade-edges': sm6_02,
  'sm6-03-normalize': sm6_03,
  'sm6-04-perfect-loop': sm6_04,
};

/**
 * Sampling challenges grouped by module
 */
export const samplingChallengesByModule: Record<string, SamplingChallenge[]> = {
  SM1: [sm1_01, sm1_02, sm1_03, sm1_04],
  SM2: [sm2_01, sm2_02, sm2_03, sm2_04],
  SM3: [sm3_01, sm3_02, sm3_03, sm3_04],
  SM4: [sm4_01, sm4_02, sm4_03, sm4_04],
  SM5: [sm5_01, sm5_02, sm5_03, sm5_04],
  SM6: [sm6_01, sm6_02, sm6_03, sm6_04],
};

/**
 * Ordered list of all sampling challenges
 */
export const allSamplingChallenges: SamplingChallenge[] = [
  // SM1 - Sample Basics
  sm1_01,
  sm1_02,
  sm1_03,
  sm1_04,
  // SM2 - Building Instruments
  sm2_01,
  sm2_02,
  sm2_03,
  sm2_04,
  // SM3 - Time & Pitch
  sm3_01,
  sm3_02,
  sm3_03,
  sm3_04,
  // SM4 - Chopping
  sm4_01,
  sm4_02,
  sm4_03,
  sm4_04,
  // SM5 - Flipping
  sm5_01,
  sm5_02,
  sm5_03,
  sm5_04,
  // SM6 - Polish & Clean
  sm6_01,
  sm6_02,
  sm6_03,
  sm6_04,
];

/**
 * Sampling module metadata
 */
export const samplingModules = {
  SM1: {
    id: 'SM1',
    title: 'Sample Basics',
    description: 'Learn to load, play, and manipulate samples. The fundamentals of sampling.',
    challengeCount: 4,
  },
  SM2: {
    id: 'SM2',
    title: 'Building Instruments',
    description: 'Create playable instruments from samples. Drum kits, key mapping, and velocity layers.',
    challengeCount: 4,
  },
  SM3: {
    id: 'SM3',
    title: 'Time & Pitch',
    description: 'Master time stretching and pitch shifting. Match samples to any tempo or key.',
    challengeCount: 4,
  },
  SM4: {
    id: 'SM4',
    title: 'Chopping',
    description: 'Slice samples into playable parts. Chop breaks, vocals, and create new patterns.',
    challengeCount: 4,
  },
  SM5: {
    id: 'SM5',
    title: 'Flipping',
    description: 'Transform samples into something new. Rearrange, reverse, and reimagine.',
    challengeCount: 4,
  },
  SM6: {
    id: 'SM6',
    title: 'Polish & Clean',
    description: 'Clean up samples for professional results. Trim, fade, normalize, and loop.',
    challengeCount: 4,
  },
} as const;

/**
 * Get a sampling challenge by ID
 */
export function getSamplingChallenge(id: string): SamplingChallenge | undefined {
  return samplingChallengesById[id];
}

/**
 * Get sampling challenges for a module
 */
export function getSamplingModuleChallenges(moduleId: string): SamplingChallenge[] {
  return samplingChallengesByModule[moduleId] ?? [];
}

/**
 * Get the next sampling challenge after the given one
 */
export function getNextSamplingChallenge(currentId: string): SamplingChallenge | undefined {
  const index = allSamplingChallenges.findIndex(c => c.id === currentId);
  if (index === -1 || index >= allSamplingChallenges.length - 1) {
    return undefined;
  }
  return allSamplingChallenges[index + 1];
}
