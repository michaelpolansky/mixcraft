/**
 * F7-04: Control the Dynamics
 * Fix uneven dynamics that jump around
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f7-04-control-the-dynamics',
  title: 'Control the Dynamics',
  description: 'This sound has wild dynamics - some parts are too quiet, others jump out. Even it out so the level stays consistent.',
  difficulty: 3,
  module: 'F7',
  sourceConfig: {
    type: 'bass',
    frequency: 80,
  },
  target: {
    type: 'problem',
    description: 'Dynamics are uneven and inconsistent',
    solution: {
      compressor: {
        threshold: [-28, -16],
        amount: [45, 75],
      },
    },
  },
  controls: {
    eq: false,
    compressor: 'simple',
  },
  hints: [
    'Compression is the tool for controlling dynamics',
    'Lower threshold catches more of the signal',
    'Higher amount creates more level consistency',
  ],
};
