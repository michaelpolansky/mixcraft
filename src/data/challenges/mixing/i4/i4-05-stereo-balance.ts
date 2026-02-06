/**
 * I4-05: Stereo Balance
 * Balance elements across the stereo field
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-05-stereo-balance',
  title: 'Stereo Balance',
  description:
    'A mix should feel balanced - not too heavy on one side. If you have something panned left, balance it with something on the right. Create a stereo image that feels even and complete.',
  difficulty: 2,
  module: 'I4',
  tracks: [
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialPan: -0.7, // Already left
      color: '#f97316',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialPan: 0, // Needs to balance guitar
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialPan: 0,
      color: '#8b5cf6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a balanced stereo image',
    conditions: [
      { type: 'pan_position', track: 'guitar', position: 'left' },
      { type: 'pan_position', track: 'keys', position: 'right' },
      { type: 'pan_position', track: 'pad', position: 'center' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'The guitar is already panned left - it needs something to balance it on the right',
    'Pan the keys to the right to mirror the guitar\'s position',
    'The pad should stay centered to fill the middle',
  ],
};
