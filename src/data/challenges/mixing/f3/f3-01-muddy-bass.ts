/**
 * F3-01: Muddy Bass
 * Fix a bass sound with too much low-mid buildup
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f3-01-muddy-bass',
  title: 'Muddy Bass',
  description: 'This bass sounds muddy and indistinct. Clean it up by addressing the problem frequencies. Listen for the clarity improvement.',
  difficulty: 2,
  module: 'F3',
  sourceConfig: {
    type: 'bass',
    frequency: 55,
  },
  target: {
    type: 'problem',
    description: 'Bass sounds muddy due to excessive low-mid frequencies',
    solution: {
      eq: {
        low: [-6, 0],    // Cut or leave flat
        mid: [-8, -3],   // Scoop the mud
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    '"Mud" usually lives in the low-mid frequencies around 200-500Hz',
    'The mid knob affects this range - try cutting it',
    'You might also reduce some sub-bass for tightness',
  ],
};
