import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds5-03-trap',
  title: 'Trap Beat',
  description:
    'Create a trap beat with rolling hi-hats and heavy 808. Trap features rapid hi-hat patterns, sparse but powerful kicks, and hard-hitting snares. Think Metro Boomin, Lex Luger.',
  difficulty: 3,
  module: 'DS5',
  challengeType: 'genre-challenge',
  startingPattern: createStandardPattern(
    'Trap',
    140,
    0,
    16,
    createStepsWithVelocities(16, []),
    createStepsWithVelocities(16, []),
    createStepsWithVelocities(16, []),
    createStepsWithVelocities(16, [])
  ),
  targetPattern: createStandardPattern(
    'Trap',
    140,
    0, // Trap is straight
    16,
    // Sparse 808 kick pattern
    createStepsWithVelocities(16, [
      [0, 0.95],   // Beat 1
      [10, 0.85],  // Syncopated hit
    ]),
    // Hard snare on beat 3 (or clap)
    createStepsWithVelocities(16, [
      [8, 0.95],   // Beat 3 (trap often uses 3 instead of 2&4)
    ]),
    // Rolling hi-hats with velocity variation (trap signature)
    createStepsWithVelocities(16, [
      [0, 0.7],
      [1, 0.5],
      [2, 0.65],
      [3, 0.55],
      [4, 0.7],
      [5, 0.5],
      [6, 0.65],
      [7, 0.55],
      [8, 0.75],
      [9, 0.5],
      [10, 0.65],
      [11, 0.55],
      [12, 0.7],
      [13, 0.55],
      [14, 0.65],
      [15, 0.6],
    ]),
    // Open hi-hat for accent
    createStepsWithVelocities(16, [
      [4, 0.8],
      [12, 0.75],
    ])
  ),
  evaluationFocus: ['pattern', 'velocity'],
  hints: [
    'Trap hi-hats often play on every 16th note (all 16 steps).',
    'The kick is sparse - just beat 1 and one syncopated hit.',
    'Vary the hi-hat velocities for that rolling, mechanical feel.',
  ],
};
