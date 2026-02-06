/**
 * A4-02: Bus EQ Warmth
 * Add warmth to the entire mix with bus EQ
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-02-bus-eq-warmth',
  title: 'Bus EQ Warmth',
  description:
    'Sometimes the whole mix needs a tonal shift. Use bus EQ to add warmth and body to the entire mix without affecting individual track balances.',
  difficulty: 2,
  module: 'A4',
  tracks: [
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
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -4,
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add warmth to the entire mix',
    conditions: [
      { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
      { type: 'bus_eq_cut', band: 'high', minCut: 1 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'A small low boost adds weight',
    'A subtle high cut removes harshness',
    'Bus EQ moves are typically subtle - 1-2dB',
  ],
};
