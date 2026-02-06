import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createPattern,
  createTrack,
  createStepsWithVelocities,
  createEmptySteps,
  DRUM_SAMPLES,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds6-03-transition-build',
  title: 'Transition Build',
  description:
    'Create a build-up pattern leading to a drop. Build energy with increasing density and intensity. The snare roll at the end signals something big is coming.',
  difficulty: 3,
  module: 'DS6',
  challengeType: 'complete-loop',
  startingPattern: createPattern(
    'Transition Build',
    128,
    0,
    16,
    [
      // Sparse kick
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick,
        createStepsWithVelocities(16, [
          [0, 0.8],
          [8, 0.8],
        ])
      ),
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare, createEmptySteps(16)),
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed, createEmptySteps(16)),
      createTrack('crash', 'Crash', DRUM_SAMPLES.crash, createEmptySteps(16)),
    ]
  ),
  targetPattern: createPattern(
    'Transition Build',
    128,
    0,
    16,
    [
      // Kick builds
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick,
        createStepsWithVelocities(16, [
          [0, 0.8],
          [4, 0.75],
          [8, 0.85],
          [12, 0.9],
        ])
      ),
      // Snare roll builds intensity
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare,
        createStepsWithVelocities(16, [
          [8, 0.5],
          [10, 0.6],
          [12, 0.7],
          [13, 0.8],
          [14, 0.9],
          [15, 1.0],
        ])
      ),
      // Hi-hats build from sparse to dense
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed,
        createStepsWithVelocities(16, [
          [0, 0.5],
          [4, 0.55],
          [6, 0.55],
          [8, 0.6],
          [9, 0.6],
          [10, 0.65],
          [11, 0.65],
          [12, 0.7],
          [13, 0.75],
          [14, 0.8],
          [15, 0.85],
        ])
      ),
      createTrack('crash', 'Crash', DRUM_SAMPLES.crash, createEmptySteps(16)),
    ]
  ),
  evaluationFocus: ['pattern', 'velocity'],
  hints: [
    'Start sparse and add more hits as the bar progresses.',
    'A snare roll (rapid hits) in the last beat creates tension.',
    'Increase velocities toward the end for a crescendo effect.',
  ],
};
