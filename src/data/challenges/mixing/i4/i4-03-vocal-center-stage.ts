/**
 * I4-03: Vocal Center Stage
 * Keep the lead vocal centered while spreading backing elements
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-03-vocal-center-stage',
  title: 'Vocal Center Stage',
  description:
    'The lead vocal is the star of the mix and should stay front and center. Spread the backing elements wide to create space around the vocal while keeping it locked in the middle.',
  difficulty: 2,
  module: 'I4',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialPan: -0.4, // Starts off-center
      color: '#a855f7',
    },
    {
      id: 'keys_l',
      name: 'Keys L',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialPan: 0, // Starts centered
      color: '#22c55e',
    },
    {
      id: 'keys_r',
      name: 'Keys R',
      sourceConfig: { type: 'keys', frequency: 442 },
      initialPan: 0, // Starts centered
      color: '#14b8a6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Center the vocal and spread the keys for width',
    conditions: [
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_opposite', track1: 'keys_l', track2: 'keys_r' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'The lead vocal should always be dead center - it\'s the focal point',
    'Spread the keys left and right to create space around the vocal',
    'This creates a "pocket" in the center for the voice',
  ],
};
