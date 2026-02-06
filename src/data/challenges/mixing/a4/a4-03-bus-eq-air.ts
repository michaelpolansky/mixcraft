/**
 * A4-03: Bus EQ Air
 * Add sparkle and air to the entire mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-03-bus-eq-air',
  title: 'Bus EQ Air',
  description:
    'A gentle high-frequency boost on the mix bus can open up the entire mix, adding sparkle and air. This gives the mix a polished, professional sheen.',
  difficulty: 2,
  module: 'A4',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
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
    description: 'Add air and sparkle to the mix',
    conditions: [
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
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
    'A gentle high boost adds sheen',
    'Keep the vocal as the focal point',
    'Too much high boost can sound harsh',
  ],
};
