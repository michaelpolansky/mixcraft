/**
 * A2-07: Full Vocal Chain
 * Build a complete vocal processing chain
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-07-full-vocal-chain',
  title: 'Full Vocal Chain',
  description:
    'Combine all your vocal tools: EQ for tone, compression for dynamics, reverb for space. Build a professional vocal chain that sounds polished and present.',
  difficulty: 3,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -3,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -3,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Build a complete vocal processing chain',
    conditions: [
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 2 },
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
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
    'Cut lows to remove mud, boost highs for air',
    'Keep the vocal dry and upfront',
    'Center the vocal and make it the loudest',
  ],
};
