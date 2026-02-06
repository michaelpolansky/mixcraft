/**
 * M1-06: Create Width
 * Establish the stereo image
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-06-create-width',
  title: 'Create Width',
  description:
    'A professional mix uses the full stereo field. Keep the foundation centered, spread supporting elements wide, and create an immersive soundstage.',
  difficulty: 3,
  module: 'M1',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
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
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: -0.3,
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
    description: 'Create a wide stereo image',
    conditions: [
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'pan_spread', track1: 'guitarL', track2: 'guitarR', minSpread: 100 },
      { type: 'volume_balanced', track1: 'guitarL', track2: 'guitarR', tolerance: 2 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Vocal, kick, bass stay centered',
    'Pan guitars hard left and right',
    'Balance guitar levels for even width',
  ],
};
