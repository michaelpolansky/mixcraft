/**
 * F5-04: Smooth Sustain
 * Using long release for smooth, sustained compression
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f5-04-smooth-sustain',
  title: 'Smooth Sustain',
  description: 'Create smooth, transparent compression on this pad. Use gentle settings with a long release for invisible level control that sounds natural.',
  difficulty: 3,
  module: 'F5',
  sourceConfig: {
    type: 'pad',
    frequency: 330,
  },
  target: {
    type: 'compressor',
    threshold: -16,
    amount: 35,
    attack: 0.03,    // 30ms
    release: 0.5,    // 500ms - long, smooth
  },
  controls: {
    eq: false,
    compressor: 'full',
  },
  hints: [
    'Long release (400-600ms) creates smooth, transparent compression',
    'Gentle settings prevent obvious "pumping"',
    'Goal: level control you can feel but not obviously hear',
  ],
};
