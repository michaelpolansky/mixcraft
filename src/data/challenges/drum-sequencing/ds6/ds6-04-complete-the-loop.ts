import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds6-04-complete-the-loop',
  title: 'Complete the Loop',
  description:
    'Finish this incomplete drum pattern. The kick and some hi-hats are programmed, but the snare and remaining hi-hats are missing. Listen to what is there and complete the groove.',
  difficulty: 3,
  module: 'DS6',
  challengeType: 'complete-loop',
  startingPattern: createStandardPattern(
    'Complete the Loop',
    110,
    0.15,
    16,
    // Kick is already done
    createStepsWithVelocities(16, [
      [0, 0.9],
      [6, 0.75],
      [8, 0.85],
      [14, 0.7],
    ]),
    // Snare is empty - needs to be filled
    createEmptySteps(16),
    // Partial hi-hats
    createStepsWithVelocities(16, [
      [0, 0.65],
      [4, 0.65],
      [8, 0.65],
      [12, 0.65],
    ]),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Complete the Loop',
    110,
    0.15,
    16,
    // Kick stays the same
    createStepsWithVelocities(16, [
      [0, 0.9],
      [6, 0.75],
      [8, 0.85],
      [14, 0.7],
    ]),
    // Snare with backbeat and ghost notes
    createStepsWithVelocities(16, [
      [4, 0.9],
      [10, 0.3],   // Ghost note
      [12, 0.9],
    ]),
    // Complete hi-hat pattern
    createStepsWithVelocities(16, [
      [0, 0.65],
      [2, 0.55],
      [4, 0.65],
      [6, 0.55],
      [8, 0.65],
      [10, 0.55],
      [12, 0.65],
      [14, 0.55],
    ]),
    // Open hi-hat for color
    createStepsWithVelocities(16, [
      [6, 0.6],
    ])
  ),
  evaluationFocus: ['pattern', 'velocity'],
  hints: [
    'The snare needs to go on beats 2 and 4 (steps 5 and 13).',
    'Fill in the missing hi-hats to create eighth notes.',
    'A ghost note before beat 4 can add nice groove.',
  ],
};
