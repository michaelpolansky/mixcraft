/**
 * A1-08: Punchy Kit Master
 * Create the punchiest, most impactful drum sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-08-punchy-kit-master',
  title: 'Punchy Kit Master',
  description:
    'Final challenge: create a drum mix that hits hard, sounds wide, and sits perfectly in a mix. Use everything you\'ve learned - EQ, compression, panning, reverb, and levels.',
  difficulty: 3,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -3,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -3,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: 0,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create the ultimate punchy drum mix',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 3 },
      { type: 'eq_boost', track: 'snare', band: 'high', minBoost: 2 },
      { type: 'eq_cut', track: 'hihat', band: 'low', minCut: 6 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'snare', position: 'center' },
      { type: 'depth_placement', track: 'kick', depth: 'front' },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Kick: boost lows hard, keep it center and dry',
    'Snare: boost highs for crack, keep center, touch of reverb',
    'Hi-hat: cut all lows, pan left, can have more reverb',
  ],
};
