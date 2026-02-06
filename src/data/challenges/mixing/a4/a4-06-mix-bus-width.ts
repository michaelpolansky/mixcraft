/**
 * A4-06: Mix Bus Width
 * Create stereo width on the mix bus
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-06-mix-bus-width',
  title: 'Mix Bus Width',
  description:
    'A wide mix sounds professional and immersive. Use individual track panning to create width, while keeping the foundation solid in the center.',
  difficulty: 2,
  module: 'A4',
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
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      initialPan: -0.3,
      color: '#f97316',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      initialPan: 0.3,
      color: '#fb923c',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -6,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a wide stereo image',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'pan_spread', track1: 'guitarL', track2: 'guitarR', minSpread: 100 },
      { type: 'volume_balanced', track1: 'guitarL', track2: 'guitarR', tolerance: 2 },
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
    'Keep kick and bass centered',
    'Pan guitars hard left and right',
    'Match guitar levels for balanced width',
  ],
};
