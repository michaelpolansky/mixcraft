/**
 * I1-02: Bass Clarity
 * Finding the bass's place above the kick
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-02-bass-clarity',
  title: 'Bass Clarity',
  description:
    'This bass sounds muddy against the kick. Boost the bass mids to help it cut through while keeping the low end clean. The goal is to hear the bass note clearly even when the kick hits.',
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
      sourceConfig: { type: 'bass', frequency: 65 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Make the bass cut through without muddying the kick',
    conditions: [
      { type: 'eq_boost', track: 'bass', band: 'mid', minBoost: 2 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'Bass clarity comes from the midrange, not the lows',
    'Boost the bass mids around 800-1200Hz to add definition',
    'You may also need to cut the bass lows slightly',
  ],
};
