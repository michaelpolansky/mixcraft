/**
 * F4-02: Tame the Peaks
 * Using compression to control loud transients
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f4-02-tame-the-peaks',
  title: 'Tame the Peaks',
  description: 'This bass has some harsh peaks. Use a higher threshold to only catch the loudest moments, with moderate compression to smooth them out.',
  difficulty: 1,
  module: 'F4',
  sourceConfig: {
    type: 'bass',
    frequency: 55,
  },
  target: {
    type: 'compressor',
    threshold: -12,
    amount: 50,
  },
  controls: {
    eq: false,
    compressor: 'simple',
  },
  hints: [
    'A higher threshold (-12 dB) only compresses the loudest peaks',
    'Medium compression (50%) smooths without over-squashing',
    'Watch the gain reduction meter to see compression in action',
  ],
};
