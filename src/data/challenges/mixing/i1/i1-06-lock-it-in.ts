/**
 * I1-06: Lock It In
 * Complete kick and bass relationship - all frequencies working together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-06-lock-it-in',
  title: 'Lock It In',
  description:
    'Final challenge: create the complete kick and bass relationship. The kick should punch through on every hit, the bass should provide consistent low-end weight, and both should have their own space across the entire frequency spectrum.',
  difficulty: 3,
  module: 'I1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Perfect kick and bass separation across all frequencies',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'mid' },
      { type: 'eq_boost', track: 'kick', band: 'high', minBoost: 2 },
      { type: 'eq_boost', track: 'bass', band: 'mid', minBoost: 2 },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
  },
  hints: [
    'Apply everything you\'ve learned: sub separation, mid clarity, high-end attack',
    'The kick should boost highs for click, the bass should boost mids for growl',
    'Make sure they\'re not both boosting the same bands',
  ],
};
