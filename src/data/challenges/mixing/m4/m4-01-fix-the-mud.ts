/**
 * M4-01: Fix the Mud
 * Diagnose and fix a muddy mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-01-fix-the-mud',
  title: 'Fix the Mud',
  description:
    'This mix is muddy and unclear. Too much low-mid energy is clouding the sound. Find the problem frequencies and clean up the mix.',
  difficulty: 2,
  module: 'M4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 2,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 220 },
      initialVolume: -2,
      color: '#22c55e',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Clean up the muddy mix',
    conditions: [
      { type: 'eq_cut', track: 'bass', band: 'mid', minCut: 2 },
      { type: 'eq_cut', track: 'guitar', band: 'low', minCut: 2 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
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
    'Cut muddy low-mids from bass',
    'Remove unnecessary lows from guitar',
    'Separate kick and bass frequencies',
  ],
};
