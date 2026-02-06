/**
 * I4-01: Center the Foundation
 * Keep kick and bass centered for a solid low-end
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-01-center-the-foundation',
  title: 'Center the Foundation',
  description:
    'The low end is the foundation of your mix. Kick and bass should stay centered to maintain punch and mono compatibility. Learn to keep the foundation solid while other elements can spread wide.',
  difficulty: 1,
  module: 'I4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialPan: -0.5, // Starts off-center (problem to fix)
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialPan: 0.3, // Starts off-center (problem to fix)
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Center the kick and bass for a solid foundation',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'Low frequencies work best when centered - they take up the same energy in both speakers',
    'The kick and bass need to hit with equal force on both sides',
    'Pan both to the center position',
  ],
};
