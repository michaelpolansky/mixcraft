/**
 * I6-06: Full Band Balance
 * Balance a complete band mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-06-full-band-balance',
  title: 'Full Band Balance',
  description:
    'Final challenge: balance a full band mix. Vocal on top, rhythm section locked, guitars supporting, nothing overpowering. This is the foundation of every great mix.',
  difficulty: 3,
  module: 'I6',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
      color: '#a855f7',
    },
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
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 2,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a balanced full band mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'kick' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_range', track: 'vocal', minDb: -6, maxDb: 3 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Start with the rhythm section - get kick and bass balanced',
    'Add the guitar as support, not competition',
    'Vocal goes on top - it should be clearly the loudest',
  ],
};
