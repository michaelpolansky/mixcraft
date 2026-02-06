/**
 * M1-01: Start with Drums
 * Begin a mix by establishing the drum foundation
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-01-start-with-drums',
  title: 'Start with Drums',
  description:
    'Every great mix starts with a solid foundation. Begin by getting the drums right - balanced levels, proper EQ, and a cohesive kit sound.',
  difficulty: 2,
  module: 'M1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -4,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -6,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Establish the drum foundation',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 1 },
      { type: 'eq_boost', track: 'snare', band: 'mid', minBoost: 1 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'snare', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Balance kick and snare first',
    'Boost kick lows for punch',
    'Boost snare mids for crack',
  ],
};
