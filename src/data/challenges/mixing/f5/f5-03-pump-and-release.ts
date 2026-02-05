/**
 * F5-03: Pump and Release
 * Using release time for rhythmic pumping
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f5-03-pump-and-release',
  title: 'Pump and Release',
  description: 'Create a rhythmic "pumping" effect on this drum. Use heavy compression with a medium release that matches the tempo for a breathing effect.',
  difficulty: 3,
  module: 'F5',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'compressor',
    threshold: -24,
    amount: 70,
    attack: 0.01,    // 10ms
    release: 0.3,    // 300ms - medium, creates pump
  },
  controls: {
    eq: false,
    compressor: 'full',
  },
  hints: [
    'Heavy compression with medium release creates "pump"',
    'The release should roughly match the rhythm',
    'Too fast release = no pump, too slow = constant compression',
  ],
};
