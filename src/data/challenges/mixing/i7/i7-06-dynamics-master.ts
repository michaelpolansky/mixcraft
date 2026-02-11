/**
 * I7-06: Dynamics Master
 * Compress all tracks at different levels for a professional dynamic balance
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-06-dynamics-master',
  title: 'Dynamics Master',
  description:
    'In a professional mix, every track has its own compression setting. Compress the vocal for consistency, the kick for punch, the bass for evenness, and keep the guitar more dynamic. Make the vocal the loudest element.',
  difficulty: 3,
  module: 'I7',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -3,
      color: '#a855f7',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum', frequency: 60 },
      initialVolume: -4,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -5,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress each track differently and balance the mix with the vocal on top',
    conditions: [
      { type: 'track_compression', track: 'vocal', minAmount: 20, maxAmount: 50 },
      { type: 'track_compression', track: 'kick', minAmount: 30, maxAmount: 70 },
      { type: 'track_compression', track: 'bass', minAmount: 35 },
      { type: 'compression_contrast', moreCompressed: 'kick', lessCompressed: 'guitar', minDifference: 20 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'Each track needs a different compression approach based on its role',
    'Vocal: gentle compression (20-50%) to preserve expression. Kick: moderate (30-70%) for punch. Bass: firm (35%+) for consistency.',
    'The guitar should have less compression than the kick — keep it expressive. And make sure the vocal is the loudest element overall.',
  ],
};
