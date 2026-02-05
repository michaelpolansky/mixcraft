/**
 * F4-04: Parallel Punch
 * Moderate compression for added punch and presence
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f4-04-parallel-punch',
  title: 'Parallel Punch',
  description: 'Add punch and sustain to this pad using medium compression. Find the sweet spot where the sound feels fuller without losing its natural dynamics.',
  difficulty: 2,
  module: 'F4',
  sourceConfig: {
    type: 'pad',
    frequency: 220,
  },
  target: {
    type: 'compressor',
    threshold: -24,
    amount: 45,
  },
  controls: {
    eq: false,
    compressor: 'simple',
  },
  hints: [
    'Medium threshold catches a good portion of the signal',
    'Moderate compression adds sustain without squashing',
    'The goal is "glue" - making the sound feel more cohesive',
  ],
};
