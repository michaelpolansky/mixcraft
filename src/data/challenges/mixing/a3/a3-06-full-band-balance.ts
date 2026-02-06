/**
 * A3-06: Full Band Balance
 * Balance a complete band arrangement
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-06-full-band-balance',
  title: 'Full Band Balance',
  description:
    'A full band mix requires careful balance. Drums and bass form the foundation, guitars and keys fill the middle, and everything needs room to breathe.',
  difficulty: 3,
  module: 'A3',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -3,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#eab308',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -6,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a balanced full band mix',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 4 },
      { type: 'volume_louder', track1: 'kick', track2: 'guitar' },
      { type: 'volume_louder', track1: 'kick', track2: 'keys' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Rhythm section is the foundation',
    'Keep kick and bass centered',
    'Guitars and keys support the rhythm section',
  ],
};
