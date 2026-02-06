/**
 * I3-06: Punchy Kit
 * Complete drum kit with maximum impact
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-06-punchy-kit',
  title: 'Punchy Kit',
  description:
    'Final challenge: create a punchy, impactful drum mix that sits with a bass line. Every hit should have power, the kit should have definition, and everything should work together without fighting.',
  difficulty: 3,
  module: 'I3',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      color: '#eab308',
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
    description: 'Create a powerful, cohesive drum and bass foundation',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'high', minBoost: 2 },
      { type: 'eq_boost', track: 'snare', band: 'mid', minBoost: 1 },
      { type: 'eq_cut', track: 'hihat', band: 'low', minCut: 4 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
  },
  hints: [
    'Start with the kick and bass relationship - get the low end right first',
    'Add snare presence without competing with the kick\'s attack',
    'Hi-hats should sparkle on top without harshness',
  ],
};
