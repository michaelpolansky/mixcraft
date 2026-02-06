import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds4-03-building-intensity',
  title: 'Building Intensity',
  description:
    'Create a crescendo pattern where the hi-hats gradually get louder. This builds tension and energy, perfect for leading into a chorus or drop.',
  difficulty: 2,
  module: 'DS4',
  challengeType: 'add-dynamics',
  startingPattern: createStandardPattern(
    'Building Intensity',
    128,
    0,
    16,
    createStepsWithVelocities(16, [
      [0, 0.9],
      [4, 0.85],
      [8, 0.9],
      [12, 0.85],
    ]),
    createStepsWithVelocities(16, [
      [4, 0.9],
      [12, 0.9],
    ]),
    // All hi-hats at same velocity (flat)
    createStepsWithVelocities(16, [
      [0, 0.6],
      [1, 0.6],
      [2, 0.6],
      [3, 0.6],
      [4, 0.6],
      [5, 0.6],
      [6, 0.6],
      [7, 0.6],
      [8, 0.6],
      [9, 0.6],
      [10, 0.6],
      [11, 0.6],
      [12, 0.6],
      [13, 0.6],
      [14, 0.6],
      [15, 0.6],
    ]),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Building Intensity',
    128,
    0,
    16,
    createStepsWithVelocities(16, [
      [0, 0.9],
      [4, 0.85],
      [8, 0.9],
      [12, 0.85],
    ]),
    createStepsWithVelocities(16, [
      [4, 0.9],
      [12, 0.9],
    ]),
    // Hi-hats with crescendo
    createStepsWithVelocities(16, [
      [0, 0.35],
      [1, 0.4],
      [2, 0.45],
      [3, 0.5],
      [4, 0.55],
      [5, 0.6],
      [6, 0.65],
      [7, 0.7],
      [8, 0.75],
      [9, 0.8],
      [10, 0.85],
      [11, 0.9],
      [12, 0.92],
      [13, 0.95],
      [14, 0.97],
      [15, 1.0],
    ]),
    createEmptySteps(16)
  ),
  evaluationFocus: ['velocity'],
  hints: [
    'Start the hi-hats quiet (around 35% velocity) and end loud (100%).',
    'The increase should be gradual across all 16 steps.',
    'Each step should be slightly louder than the previous one.',
  ],
};
