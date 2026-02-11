/**
 * I3-03: Snare Body
 * Adding weight and body to a thin snare
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-03-snare-body',
  title: 'Snare Body',
  description:
    'This snare has crack but no body - it sounds thin and weak. Add weight in the low-mids (150-300Hz) to give it some chest. Balance the crack with the body for a full snare sound.',
  difficulty: 2,
  module: 'I3',
  tracks: [
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add body to the thin snare',
    conditions: [
      { type: 'eq_boost', track: 'snare', band: 'low', minBoost: 2 },
      { type: 'frequency_separation', track1: 'snare', track2: 'kick', band: 'low' },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'Snare body lives around 150-300Hz in the low band',
    'Boost the snare lows to add weight and chest',
    'Cut the kick slightly in this area to avoid mud',
  ],
};
