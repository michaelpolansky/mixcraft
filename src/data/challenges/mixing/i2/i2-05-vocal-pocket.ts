/**
 * I2-05: Vocal Pocket
 * Creating space for vocals in a dense mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-05-vocal-pocket',
  title: 'Vocal Pocket',
  description:
    'The guitar is masking the vocal. Create a "pocket" for the vocal by cutting the guitar\'s midrange where the vocal lives. This is called "frequency carving" - making space for the lead element.',
  difficulty: 2,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 250 },
      color: '#f59e0b',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 400 },
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Carve a pocket for the vocal in the guitar',
    conditions: [
      { type: 'eq_cut', track: 'guitar', band: 'mid', minCut: 2 },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
      { type: 'frequency_separation', track1: 'vocal', track2: 'guitar', band: 'mid' },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'The vocal\'s fundamental frequencies are in the mid band',
    'Cut the guitar mids to create a "pocket" for the vocal',
    'A subtle vocal mid boost helps it sit in that pocket',
  ],
};
