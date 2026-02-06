/**
 * M4-02: Fix the Harshness
 * Diagnose and fix a harsh, fatiguing mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-02-fix-the-harshness',
  title: 'Fix the Harshness',
  description:
    'This mix is harsh and fatiguing. Too much high-frequency energy is making it painful to listen to. Tame the harshness while keeping clarity.',
  difficulty: 2,
  module: 'M4',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -2,
      color: '#f97316',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 880 },
      initialVolume: -3,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Tame the harsh frequencies',
    conditions: [
      { type: 'eq_cut', track: 'hihat', band: 'high', minCut: 2 },
      { type: 'eq_cut', track: 'keys', band: 'high', minCut: 2 },
      { type: 'volume_louder', track1: 'vocal', track2: 'hihat' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
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
    'Cut harsh highs from hi-hat',
    'Reduce high frequencies on keys',
    'Keep the vocal clear but not harsh',
  ],
};
