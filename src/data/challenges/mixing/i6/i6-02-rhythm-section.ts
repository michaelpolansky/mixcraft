/**
 * I6-02: Rhythm Section Balance
 * Balance the kick and bass together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-02-rhythm-section',
  title: 'Rhythm Section',
  description:
    'The kick and bass form the rhythm section foundation. They should be balanced with each other - neither should overpower the other. Find the sweet spot where they work as one.',
  difficulty: 1,
  module: 'I6',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -8,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Balance kick and bass together',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Neither kick nor bass should dominate',
    'They should feel like one instrument',
    'Within 3 dB of each other is a good target',
  ],
};
