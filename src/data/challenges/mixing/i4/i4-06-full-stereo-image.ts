/**
 * I4-06: Full Stereo Image
 * Create a complete stereo mix with proper imaging
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-06-full-stereo-image',
  title: 'Full Stereo Image',
  description:
    'Final challenge: build a complete stereo image. Low end centered, lead vocal centered, guitars wide, drums naturally placed. This is how professional mixes achieve width while maintaining focus and power.',
  difficulty: 3,
  module: 'I4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialPan: 0.2, // Slightly off
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialPan: -0.15, // Slightly off
      color: '#3b82f6',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialPan: 0.1, // Slightly off
      color: '#a855f7',
    },
    {
      id: 'guitar_l',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialPan: 0,
      color: '#f97316',
    },
    {
      id: 'guitar_r',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 329 },
      initialPan: 0,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a professional stereo image with proper placement',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_opposite', track1: 'guitar_l', track2: 'guitar_r' },
      { type: 'pan_spread', track1: 'guitar_l', track2: 'guitar_r', minSpread: 1.2 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'Foundation first: kick, bass, and vocal should all be centered',
    'Guitars create width - pan them hard left and right',
    'A centered foundation with wide elements creates the best stereo image',
  ],
};
