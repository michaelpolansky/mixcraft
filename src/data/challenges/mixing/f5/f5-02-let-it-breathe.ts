/**
 * F5-02: Let It Breathe
 * Using slow attack to preserve transients
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f5-02-let-it-breathe',
  title: 'Let It Breathe',
  description: 'Compress this bass while preserving its attack. Use a slower attack time to let the initial transient through, then compress the sustain.',
  difficulty: 2,
  module: 'F5',
  sourceConfig: {
    type: 'bass',
    frequency: 60,
  },
  target: {
    type: 'compressor',
    threshold: -20,
    amount: 55,
    attack: 0.05,    // 50ms - slow
    release: 0.2,    // 200ms
  },
  controls: {
    eq: false,
    compressor: 'full',
  },
  hints: [
    'Slow attack (30-80ms) lets the transient punch through',
    'The compressor then catches the sustain portion',
    'This preserves punch while controlling overall level',
  ],
};
