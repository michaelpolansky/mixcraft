/**
 * I7-03: Bass Consistency
 * Combine EQ and compression for a solid bass tone
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-03-bass-consistency',
  title: 'Bass Consistency',
  description:
    'Bass notes can vary wildly in volume depending on the pitch. Use compression to tame the dynamics, and a gentle EQ cut in the low-mids to keep things clean.',
  difficulty: 2,
  module: 'I7',
  tracks: [
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -3,
      color: '#3b82f6',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -5,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress the bass for consistency and clean up low-mids with EQ',
    conditions: [
      { type: 'track_compression', track: 'bass', minAmount: 40 },
      { type: 'eq_cut', track: 'bass', band: 'low', minCut: 2 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'The bass has big volume swings between notes — compression will smooth this out',
    'After compressing, cut 2-3 dB from the lows to reduce muddiness',
    'EQ and compression work together: compress first to tame dynamics, then shape the tone with EQ',
  ],
};
