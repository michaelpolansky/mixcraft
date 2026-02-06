/**
 * A5-04: EDM Width
 * Create a wide, powerful EDM mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-04-edm-width',
  title: 'EDM Width',
  description:
    'EDM mixes are wide, loud, and powerful. Synths spread across the stereo field while the kick and bass anchor the center. Create an immersive electronic sound.',
  difficulty: 2,
  module: 'A5',
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
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'synthL',
      name: 'Synth L',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -4,
      initialPan: -0.3,
      color: '#22c55e',
    },
    {
      id: 'synthR',
      name: 'Synth R',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -4,
      initialPan: 0.3,
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a wide EDM stereo image',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'synthL', track2: 'synthR' },
      { type: 'pan_spread', track1: 'synthL', track2: 'synthR', minSpread: 100 },
      { type: 'volume_balanced', track1: 'synthL', track2: 'synthR', tolerance: 2 },
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
    'Keep kick and bass dead center',
    'Pan synths hard left and right',
    'Balance synth levels for even width',
  ],
};
