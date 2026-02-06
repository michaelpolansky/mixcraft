/**
 * Production Challenge Registry
 * Central index for production challenges
 */

import type { ProductionChallenge } from '../../../core/types.ts';

// P1 - Frequency Stacking
import { challenge as p1_01 } from './p1/p1-01-find-the-space.ts';
import { challenge as p1_02 } from './p1/p1-02-bass-vs-keys.ts';
import { challenge as p1_03 } from './p1/p1-03-clear-the-mud.ts';
import { challenge as p1_04 } from './p1/p1-04-stack-the-spectrum.ts';

// P2 - Layering
import { challenge as p2_01 } from './p2/p2-01-attack-plus-body.ts';
import { challenge as p2_02 } from './p2/p2-02-drum-stack.ts';
import { challenge as p2_03 } from './p2/p2-03-thick-pad.ts';
import { challenge as p2_04 } from './p2/p2-04-hybrid-bass.ts';

// P3 - Arrangement Energy
import { challenge as p3_01 } from './p3/p3-01-build-the-drop.ts';
import { challenge as p3_02 } from './p3/p3-02-strip-it-back.ts';
import { challenge as p3_03 } from './p3/p3-03-call-and-response.ts';
import { challenge as p3_04 } from './p3/p3-04-dynamic-range.ts';

// P4 - Rhythm and Groove
import { challenge as p4_01 } from './p4/p4-01-wide-drums.ts';
import { challenge as p4_02 } from './p4/p4-02-pocket-balance.ts';
import { challenge as p4_03 } from './p4/p4-03-percussion-spread.ts';
import { challenge as p4_04 } from './p4/p4-04-groove-foundation.ts';

// P5 - Space and Depth
import { challenge as p5_01 } from './p5/p5-01-front-and-back.ts';
import { challenge as p5_02 } from './p5/p5-02-frequency-carving.ts';
import { challenge as p5_03 } from './p5/p5-03-wide-and-deep.ts';
import { challenge as p5_04 } from './p5/p5-04-the-full-picture.ts';

/**
 * All production challenges indexed by ID
 */
export const productionChallengesById: Record<string, ProductionChallenge> = {
  'p1-01-find-the-space': p1_01,
  'p1-02-bass-vs-keys': p1_02,
  'p1-03-clear-the-mud': p1_03,
  'p1-04-stack-the-spectrum': p1_04,
  'p2-01-attack-plus-body': p2_01,
  'p2-02-drum-stack': p2_02,
  'p2-03-thick-pad': p2_03,
  'p2-04-hybrid-bass': p2_04,
  'p3-01-build-the-drop': p3_01,
  'p3-02-strip-it-back': p3_02,
  'p3-03-call-and-response': p3_03,
  'p3-04-dynamic-range': p3_04,
  'p4-01-wide-drums': p4_01,
  'p4-02-pocket-balance': p4_02,
  'p4-03-percussion-spread': p4_03,
  'p4-04-groove-foundation': p4_04,
  'p5-01-front-and-back': p5_01,
  'p5-02-frequency-carving': p5_02,
  'p5-03-wide-and-deep': p5_03,
  'p5-04-the-full-picture': p5_04,
};

/**
 * Production challenges grouped by module
 */
export const productionChallengesByModule: Record<string, ProductionChallenge[]> = {
  P1: [p1_01, p1_02, p1_03, p1_04],
  P2: [p2_01, p2_02, p2_03, p2_04],
  P3: [p3_01, p3_02, p3_03, p3_04],
  P4: [p4_01, p4_02, p4_03, p4_04],
  P5: [p5_01, p5_02, p5_03, p5_04],
};

/**
 * Ordered list of all production challenges
 */
export const allProductionChallenges: ProductionChallenge[] = [
  // P1 - Frequency Stacking
  p1_01,
  p1_02,
  p1_03,
  p1_04,
  // P2 - Layering
  p2_01,
  p2_02,
  p2_03,
  p2_04,
  // P3 - Arrangement Energy
  p3_01,
  p3_02,
  p3_03,
  p3_04,
  // P4 - Rhythm and Groove
  p4_01,
  p4_02,
  p4_03,
  p4_04,
  // P5 - Space and Depth
  p5_01,
  p5_02,
  p5_03,
  p5_04,
];

/**
 * Production module metadata
 */
export const productionModules = {
  P1: {
    id: 'P1',
    title: 'Frequency Stacking',
    description: 'Learn to balance elements in their own frequency ranges using volume and mute.',
    challengeCount: 4,
  },
  P2: {
    id: 'P2',
    title: 'Layering',
    description: 'Combine multiple layers to create rich, cohesive sounds.',
    challengeCount: 4,
  },
  P3: {
    id: 'P3',
    title: 'Arrangement Energy',
    description: 'Control energy and dynamics with muting and panning.',
    challengeCount: 4,
  },
  P4: {
    id: 'P4',
    title: 'Rhythm and Groove',
    description: 'Build solid grooves with proper stereo placement.',
    challengeCount: 4,
  },
  P5: {
    id: 'P5',
    title: 'Space and Depth',
    description: 'Create 3D soundstages using EQ for depth and pan for width.',
    challengeCount: 4,
  },
} as const;

/**
 * Get a production challenge by ID
 */
export function getProductionChallenge(id: string): ProductionChallenge | undefined {
  return productionChallengesById[id];
}

/**
 * Get the next production challenge after the given one
 */
export function getNextProductionChallenge(currentId: string): ProductionChallenge | undefined {
  const index = allProductionChallenges.findIndex((c) => c.id === currentId);
  if (index === -1 || index >= allProductionChallenges.length - 1) {
    return undefined;
  }
  return allProductionChallenges[index + 1];
}
