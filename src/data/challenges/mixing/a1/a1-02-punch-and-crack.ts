/**
 * A1-02: Punch and Crack
 * Shape kick punch and snare crack with EQ
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-02-punch-and-crack',
  title: 'Punch and Crack',
  description:
    'Use EQ to give the kick punch and the snare crack. The kick needs low-end weight and upper-mid click. The snare needs body and high-end snap. Shape them to cut through.',
  difficulty: 2,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Shape kick punch and snare crack',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 2 },
      { type: 'eq_boost', track: 'kick', band: 'high', minBoost: 1 },
      { type: 'eq_boost', track: 'snare', band: 'mid', minBoost: 2 },
      { type: 'eq_boost', track: 'snare', band: 'high', minBoost: 2 },
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
    'Boost kick lows for weight, highs for click/attack',
    'Boost snare mids for body, highs for crack/snap',
    'These EQ moves make drums cut through a mix',
  ],
};
