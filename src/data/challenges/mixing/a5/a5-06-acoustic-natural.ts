/**
 * A5-06: Acoustic Natural
 * Create a natural acoustic mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-06-acoustic-natural',
  title: 'Acoustic Natural',
  description:
    'Acoustic and folk mixes should sound natural and unprocessed. Minimal EQ, subtle dynamics, and just enough space to feel like a live performance.',
  difficulty: 2,
  module: 'A5',
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
      name: 'Acoustic Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a natural acoustic sound',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'reverb_amount', track: 'vocal', minMix: 10, maxMix: 30 },
      { type: 'reverb_amount', track: 'guitar', minMix: 15, maxMix: 40 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Keep EQ moves subtle',
    'A little reverb creates natural space',
    'The vocal should be the focus',
  ],
};
