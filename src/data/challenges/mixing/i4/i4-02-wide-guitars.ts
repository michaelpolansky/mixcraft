/**
 * I4-02: Wide Guitars
 * Create stereo width by panning guitars left and right
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-02-wide-guitars',
  title: 'Wide Guitars',
  description:
    'Double-tracked guitars are a classic technique for creating width. Pan one guitar left and one right to create a wide, enveloping sound. The wider the spread, the bigger the sound.',
  difficulty: 1,
  module: 'I4',
  tracks: [
    {
      id: 'guitar_l',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialPan: 0, // Starts centered
      color: '#f97316',
    },
    {
      id: 'guitar_r',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 329 }, // Slightly detuned for realism
      initialPan: 0, // Starts centered
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Pan guitars to opposite sides for stereo width',
    conditions: [
      { type: 'pan_opposite', track1: 'guitar_l', track2: 'guitar_r' },
      { type: 'pan_spread', track1: 'guitar_l', track2: 'guitar_r', minSpread: 1.0 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'Pan one guitar hard left and one hard right',
    'The wider the spread, the bigger the sound',
    'Double-tracked guitars are meant to be opposite each other',
  ],
};
