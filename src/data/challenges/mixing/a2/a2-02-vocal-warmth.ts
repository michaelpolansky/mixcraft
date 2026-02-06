/**
 * A2-02: Vocal Warmth
 * Add body and warmth to thin vocals
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-02-vocal-warmth',
  title: 'Vocal Warmth',
  description:
    'Some vocals sound thin and need warmth. A gentle low-mid boost adds body without mud. Find the sweet spot that adds fullness while keeping clarity.',
  difficulty: 1,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 280 }, // Higher, thinner vocal
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Acoustic Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add warmth and body to the vocal',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'low', minBoost: 2 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
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
    'Boost the lows gently to add body',
    'Too much low boost creates mud',
    'The vocal should feel full but not boomy',
  ],
};
