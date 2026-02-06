/**
 * A2-03: Vocal Air
 * Add sparkle and air to the top end
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-03-vocal-air',
  title: 'Vocal Air',
  description:
    'The "air" frequencies above 10kHz add shimmer and openness to vocals. A high shelf boost makes vocals sound expensive and polished. Add air without harshness.',
  difficulty: 2,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
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
    description: 'Add air and sparkle to the vocal',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 3 },
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 1 },
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
    'Boost the highs to add air and presence',
    'A slight low cut keeps things clean',
    'The vocal should shimmer on top of the keys',
  ],
};
