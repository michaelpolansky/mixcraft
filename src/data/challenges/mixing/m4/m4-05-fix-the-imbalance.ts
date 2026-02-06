/**
 * M4-05: Fix the Imbalance
 * Diagnose and fix an unbalanced mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-05-fix-the-imbalance',
  title: 'Fix the Imbalance',
  description:
    'This mix is unbalanced. Some elements are too loud, others too quiet. The stereo image leans to one side. Restore proper balance.',
  difficulty: 2,
  module: 'M4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: 2,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -8,
      initialPan: 0.3,
      color: '#3b82f6',
    },
    {
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -2,
      initialPan: -0.8,
      color: '#22c55e',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: 0.3,
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Restore proper balance',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_balanced', track1: 'guitarL', track2: 'guitarR', tolerance: 2 },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Balance kick, snare, and bass levels',
    'Center the bass',
    'Match guitar levels and pan symmetrically',
  ],
};
