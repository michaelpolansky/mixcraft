/**
 * A5-03: Hip-Hop Low End
 * Create a heavy hip-hop low end
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-03-hip-hop-low-end',
  title: 'Hip-Hop Low End',
  description:
    'Hip-hop lives in the low end. The 808 and kick need to hit hard while leaving room for the vocal. Create a powerful, sub-heavy hip-hop foundation.',
  difficulty: 2,
  module: 'A5',
  tracks: [
    {
      id: 'kick',
      name: '808',
      sourceConfig: { type: 'bass', frequency: 40 },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -6,
      color: '#f97316',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 180 },
      initialVolume: -2,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a heavy hip-hop low end',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 2 },
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 2 },
      { type: 'volume_louder', track1: 'vocal', track2: 'hihat' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
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
    'Boost the 808 lows for weight',
    'Cut vocal lows to avoid conflict',
    'Keep bass and vocal centered',
  ],
};
