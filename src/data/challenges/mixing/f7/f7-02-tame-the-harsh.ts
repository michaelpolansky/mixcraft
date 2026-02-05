/**
 * F7-02: Tame the Harsh
 * Fix harsh, fatiguing high frequencies
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f7-02-tame-the-harsh',
  title: 'Tame the Harsh',
  description: 'This sound is painfully bright and harsh. Fix it so it\'s pleasant to listen to without losing all the definition.',
  difficulty: 2,
  module: 'F7',
  sourceConfig: {
    type: 'noise',
  },
  target: {
    type: 'problem',
    description: 'Sound is too harsh and bright',
    solution: {
      eq: {
        high: [-12, -5],  // Cut the harshness
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Harshness lives in the high frequencies',
    'Cut the highs to tame the brightness',
    'Find the balance between smooth and dull',
  ],
};
