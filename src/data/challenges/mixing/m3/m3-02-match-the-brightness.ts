/**
 * M3-02: Match the Brightness
 * Match the high-frequency presence of a reference
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm3-02-match-the-brightness',
  title: 'Match the Brightness',
  description:
    'Professional mixes sparkle without being harsh. Match the high-frequency presence - crisp vocals, shimmering cymbals, airy overall tone.',
  difficulty: 2,
  module: 'M3',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -8,
      color: '#f97316',
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
    description: 'Match the professional brightness',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'volume_louder', track1: 'vocal', track2: 'hihat' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'Boost vocal highs for air',
    'Add overall brightness with bus EQ',
    'Keep the vocal as the focus',
  ],
};
