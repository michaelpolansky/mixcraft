/**
 * M2-04: High End Sparkle
 * Add air and presence to the master
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-04-high-end-sparkle',
  title: 'High End Sparkle',
  description:
    'A polished master has air and sparkle in the high frequencies. Use gentle high-frequency EQ to open up the mix without adding harshness.',
  difficulty: 2,
  module: 'M2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -6,
      color: '#f97316',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -4,
      color: '#22c55e',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add sparkle and air to the master',
    conditions: [
      { type: 'bus_eq_boost', band: 'high', minBoost: 2 },
      { type: 'volume_louder', track1: 'vocal', track2: 'hihat' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'A gentle high boost adds polish',
    'Too much can sound harsh',
    'The vocal should still dominate',
  ],
};
