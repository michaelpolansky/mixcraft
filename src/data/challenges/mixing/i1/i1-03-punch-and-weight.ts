/**
 * I1-03: Punch and Weight
 * Balancing kick attack with bass sustain
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-03-punch-and-weight',
  title: 'Punch and Weight',
  description:
    'Create a powerful low end where the kick provides the punch and the bass provides the weight. The kick should hit hard on the attack, then the bass sustains the low end between kicks.',
  difficulty: 2,
  module: 'I1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      kick: { low: 3, mid: 0, high: 2 },
      bass: { low: -3, mid: 2, high: 0 },
    },
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Boost the kick lows for more thump on the hit',
    'Cut the bass lows so it doesn\'t compete with the kick',
    'Add some high end to the kick for beater click and attack',
  ],
};
