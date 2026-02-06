/**
 * M2-03: Low End Control
 * Manage the low frequencies for translation
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-03-low-end-control',
  title: 'Low End Control',
  description:
    'Low frequencies can overwhelm a master. Control the low end so it translates well across all playback systems - from headphones to car speakers.',
  difficulty: 2,
  module: 'M2',
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
      initialVolume: 0,
      color: '#3b82f6',
    },
    {
      id: 'synth',
      name: 'Sub Synth',
      sourceConfig: { type: 'pad', frequency: 55 },
      initialVolume: -4,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Control the low end for translation',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'eq_cut', track: 'synth', band: 'low', minCut: 2 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'Separate kick and bass frequencies',
    'Cut sub lows from non-essential elements',
    'Keep all low-frequency content centered',
  ],
};
