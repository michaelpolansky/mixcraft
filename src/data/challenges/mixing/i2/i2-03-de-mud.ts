/**
 * I2-03: De-Mud
 * Cleaning up muddy vocals
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-03-de-mud',
  title: 'De-Mud',
  description:
    'This vocal has too much low-end buildup - it sounds muffled and muddy. Cut the mud frequencies (around 200-300Hz) to clean it up. The vocal should sound clear without losing its body.',
  difficulty: 2,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 180 },
      color: '#f59e0b',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      color: '#06b6d4', // cyan
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Clean up the muddy vocal',
    conditions: [
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 3 },
      { type: 'frequency_separation', track1: 'vocal', track2: 'pad', band: 'low' },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'Mud lives in the 200-300Hz range - the low band',
    'Cut the vocal lows by 3-6dB to remove the muddiness',
    'You may need to cut the pad lows too if they\'re competing',
  ],
};
