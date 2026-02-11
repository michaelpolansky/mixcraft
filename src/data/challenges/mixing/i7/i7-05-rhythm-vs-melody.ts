/**
 * I7-05: Rhythm vs Melody
 * Compress rhythm elements hard, melodic elements light
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-05-rhythm-vs-melody',
  title: 'Rhythm vs Melody',
  description:
    'Rhythm section instruments (drums, bass) can handle heavy compression for tightness. Melodic instruments (guitar, keys) sound better with lighter compression to preserve expression. Create this contrast.',
  difficulty: 2,
  module: 'I7',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum', frequency: 60 },
      initialVolume: -3,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare', frequency: 200 },
      initialVolume: -4,
      color: '#eab308',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -4,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -5,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress rhythm hard, melody light — create dynamic separation',
    conditions: [
      { type: 'track_compression', track: 'snare', minAmount: 40, maxAmount: 80 },
      { type: 'compression_contrast', moreCompressed: 'snare', lessCompressed: 'guitar', minDifference: 25 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'Rhythm instruments (kick, snare, bass) can handle heavier compression',
    'The guitar should stay expressive — use lighter compression or none at all',
    'The snare should be at least 25% more compressed than the guitar',
  ],
};
