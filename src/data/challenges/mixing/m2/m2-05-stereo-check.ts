/**
 * M2-05: Stereo Check
 * Verify proper stereo imaging
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-05-stereo-check',
  title: 'Stereo Check',
  description:
    'A good master has a balanced stereo image. Low frequencies stay centered, width comes from mid and high frequencies, and the image is symmetrical.',
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
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: -0.5,
      color: '#22c55e',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: 0.5,
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Verify balanced stereo imaging',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
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
    'Low end and vocals stay centered',
    'Width elements should be symmetrical',
    'Balance left and right levels',
  ],
};
