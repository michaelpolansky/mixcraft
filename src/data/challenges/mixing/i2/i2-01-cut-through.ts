/**
 * I2-01: Cut Through
 * Making vocals audible over a busy backing track
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-01-cut-through',
  title: 'Cut Through',
  description:
    'The vocal is getting lost behind the keys. Use EQ to carve space for the voice in the midrange. The vocal\'s presence lives around 2-4kHz - boost it there while cutting the same area on the keys.',
  difficulty: 2,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#f59e0b', // amber
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      color: '#8b5cf6', // violet
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Make the vocal cut through the keys',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'frequency_separation', track1: 'vocal', track2: 'keys', band: 'high' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Vocal presence lives in the 2-4kHz range - the "high" band',
    'Boost the vocal highs to add clarity and presence',
    'Cut the keys highs to make room for the vocal',
  ],
};
