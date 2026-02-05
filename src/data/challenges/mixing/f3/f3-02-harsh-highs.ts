/**
 * F3-02: Harsh Highs
 * Fix a sound with painful high frequency content
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f3-02-harsh-highs',
  title: 'Harsh Highs',
  description: 'This noise is painfully bright and harsh. Tame those aggressive high frequencies without making it sound too dull.',
  difficulty: 2,
  module: 'F3',
  sourceConfig: {
    type: 'noise',
  },
  target: {
    type: 'problem',
    description: 'Sound is too bright and harsh in the high frequencies',
    solution: {
      eq: {
        high: [-10, -4],  // Cut the harshness
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Harshness is usually in the 2-8kHz range and above',
    'Cut the high band to tame the brightness',
    'Find the balance between smooth and dull',
  ],
};
