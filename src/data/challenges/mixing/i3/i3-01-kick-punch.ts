/**
 * I3-01: Kick Punch
 * Adding punch to a kick drum
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-01-kick-punch',
  title: 'Kick Punch',
  description:
    'This kick drum sounds weak and lacks punch. Use EQ to enhance the attack (2-5kHz for beater click) and the body (60-100Hz for thump). The goal is a kick that hits hard on every beat.',
  difficulty: 2,
  module: 'I3',
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
      sourceConfig: { type: 'bass', frequency: 55 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Make the kick punch through',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'high', minBoost: 2 },
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 1 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Kick punch comes from two places: the beater click (highs) and the thump (lows)',
    'Boost the kick highs for more attack definition',
    'A subtle low boost adds weight, but watch for mud with the bass',
  ],
};
