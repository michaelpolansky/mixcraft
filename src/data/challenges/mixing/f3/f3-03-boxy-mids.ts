/**
 * F3-03: Boxy Mids
 * Fix a sound with resonant, boxy midrange
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f3-03-boxy-mids',
  title: 'Boxy Mids',
  description: 'This drum sound is boxy and cardboard-like. Remove the boxy quality while preserving the punch and character.',
  difficulty: 2,
  module: 'F3',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'problem',
    description: 'Drum sounds boxy with resonant midrange',
    solution: {
      eq: {
        mid: [-8, -3],   // Cut the boxy frequencies
        low: [0, 6],     // Can add punch
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    '"Boxy" sound is typically around 300-600Hz',
    'Cutting the mids will reduce the cardboard quality',
    'You can boost lows to restore some punch',
  ],
};
