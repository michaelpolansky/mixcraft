import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds4-04-dynamic-groove',
  title: 'Dynamic Groove',
  description:
    'Create a fully dynamic groove with varied velocities on all drums. Real drummers never hit every note at the same volume. Make this pattern feel alive with dynamics.',
  difficulty: 3,
  module: 'DS4',
  challengeType: 'add-dynamics',
  startingPattern: createStandardPattern(
    'Dynamic Groove',
    100,
    0.2,
    16,
    // Flat velocities
    createStepsWithVelocities(16, [
      [0, 0.8],
      [6, 0.8],
      [10, 0.8],
    ]),
    createStepsWithVelocities(16, [
      [4, 0.8],
      [12, 0.8],
    ]),
    createStepsWithVelocities(16, [
      [0, 0.7],
      [2, 0.7],
      [4, 0.7],
      [6, 0.7],
      [8, 0.7],
      [10, 0.7],
      [12, 0.7],
      [14, 0.7],
    ]),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Dynamic Groove',
    100,
    0.2,
    16,
    // Kick with accented downbeat and varied dynamics
    createStepsWithVelocities(16, [
      [0, 0.95],  // Strong downbeat
      [6, 0.7],   // Softer syncopation
      [10, 0.8],  // Medium
    ]),
    // Snare with accent on 2 and 4, different feel
    createStepsWithVelocities(16, [
      [4, 0.9],   // Strong beat 2
      [12, 0.85], // Slightly softer beat 4
    ]),
    // Hi-hats with natural accents on downbeats, softer in between
    createStepsWithVelocities(16, [
      [0, 0.8],   // Downbeat accent
      [2, 0.5],   // Soft
      [4, 0.75],  // Beat 2 accent
      [6, 0.45],  // Soft
      [8, 0.7],   // Beat 3 accent
      [10, 0.5],  // Soft
      [12, 0.75], // Beat 4 accent
      [14, 0.45], // Soft
    ]),
    createEmptySteps(16)
  ),
  evaluationFocus: ['velocity'],
  hints: [
    'Accent the downbeats (steps 1, 5, 9, 13) with higher velocities.',
    'The "ands" (steps 3, 7, 11, 15) should be softer.',
    'The kick on beat 1 should be the strongest hit in the bar.',
  ],
};
