/**
 * A2-06: Vocal in the Mix
 * Sit the vocal perfectly with instruments
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-06-vocal-in-the-mix',
  title: 'Vocal in the Mix',
  description:
    'The vocal must sit on top of the mix without fighting the instruments. Use EQ to carve space and levels to establish hierarchy. The vocal is the star.',
  difficulty: 2,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      color: '#f97316',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: 0,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Sit the vocal perfectly in the mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
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
    'The vocal should be the loudest element',
    'Boost vocal mids to help it cut through',
    'Keep the vocal dead center',
  ],
};
