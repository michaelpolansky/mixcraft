/**
 * F4-03: Heavy Squeeze
 * Applying heavy compression for a pumping effect
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f4-03-heavy-squeeze',
  title: 'Heavy Squeeze',
  description: 'Create a heavily compressed, "pumping" sound. Set a low threshold to catch most of the signal, and crank up the compression amount.',
  difficulty: 2,
  module: 'F4',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'compressor',
    threshold: -30,
    amount: 75,
  },
  controls: {
    eq: false,
    compressor: 'simple',
  },
  hints: [
    'Low threshold (-30 dB) means almost all signal gets compressed',
    'High amount (75%) creates obvious "pumping" effect',
    'This aggressive style is common in electronic music',
  ],
};
