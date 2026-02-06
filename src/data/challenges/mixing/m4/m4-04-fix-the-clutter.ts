/**
 * M4-04: Fix the Clutter
 * Diagnose and fix a cluttered, busy mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-04-fix-the-clutter',
  title: 'Fix the Clutter',
  description:
    'This mix is cluttered and confusing. Everything is fighting for attention. Create space and hierarchy so each element has room to breathe.',
  difficulty: 3,
  module: 'M4',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      initialPan: 0,
      color: '#22c55e',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: 0,
      initialPan: 0,
      color: '#f97316',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: 0,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create space and hierarchy',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
      { type: 'pan_opposite', track1: 'guitar', track2: 'keys' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
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
    'Make the vocal the clear focus',
    'Pan competing elements apart',
    'Push background elements back with reverb',
  ],
};
