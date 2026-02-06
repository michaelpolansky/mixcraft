/**
 * M4-03: Fix the Thinness
 * Diagnose and fix a thin, weak mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-03-fix-the-thinness',
  title: 'Fix the Thinness',
  description:
    'This mix sounds thin and weak. It lacks body and weight. Add low-end foundation and warmth to give it power.',
  difficulty: 2,
  module: 'M4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -4,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -6,
      color: '#3b82f6',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: 0,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add weight and body to the thin mix',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 2 },
      { type: 'eq_boost', track: 'bass', band: 'low', minBoost: 2 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
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
    'Boost lows on kick and bass',
    'Bring up the rhythm section levels',
    'Add overall low-end with bus EQ',
  ],
};
