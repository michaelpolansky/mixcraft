/**
 * F5-01: Snappy Attack
 * Using fast attack to control transients
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f5-01-snappy-attack',
  title: 'Snappy Attack',
  description: 'This drum has too much initial punch. Use a fast attack to catch and tame those transients while keeping the body of the sound.',
  difficulty: 2,
  module: 'F5',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'compressor',
    threshold: -18,
    amount: 50,
    attack: 0.005,   // 5ms - fast
    release: 0.15,   // 150ms
  },
  controls: {
    eq: false,
    compressor: 'full',
  },
  hints: [
    'Fast attack (under 10ms) catches the initial transient',
    'This reduces the "punch" of drums',
    'Try attack around 5ms, release around 150ms',
  ],
};
