import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createPattern,
  createTrack,
  createStepsWithVelocities,
  createStepsWithHits,
  createEmptySteps,
  DRUM_SAMPLES,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds6-01-drum-fill',
  title: 'Drum Fill',
  description:
    'Add a drum fill in the last beat of the bar. Fills signal transitions and keep the groove interesting. Complete the pattern by adding hits in the final 4 steps.',
  difficulty: 2,
  module: 'DS6',
  challengeType: 'complete-loop',
  startingPattern: createPattern(
    'Drum Fill',
    110,
    0,
    16,
    [
      // Kick - normal groove for first 12 steps
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick,
        createStepsWithVelocities(16, [
          [0, 0.9],
          [4, 0.85],
          [8, 0.9],
          // No kick in last beat - leave room for fill
        ])
      ),
      // Snare - normal backbeat for first 12 steps
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare,
        createStepsWithVelocities(16, [
          [4, 0.9],
          // No snare on beat 4 - fill goes here
        ])
      ),
      // Tom for fill
      createTrack('tom', 'Tom', DRUM_SAMPLES.tom, createEmptySteps(16)),
      // Hi-hat - normal pattern for first 12 steps
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed,
        createStepsWithHits(16, [0, 2, 4, 6, 8, 10], 0.7)
      ),
    ]
  ),
  targetPattern: createPattern(
    'Drum Fill',
    110,
    0,
    16,
    [
      // Kick
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick,
        createStepsWithVelocities(16, [
          [0, 0.9],
          [4, 0.85],
          [8, 0.9],
          // Kick at end of fill
          [15, 0.95],
        ])
      ),
      // Snare with fill on last beat
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare,
        createStepsWithVelocities(16, [
          [4, 0.9],
          [12, 0.75], // Start of fill
          [14, 0.85], // Fill continues
        ])
      ),
      // Tom fill
      createTrack('tom', 'Tom', DRUM_SAMPLES.tom,
        createStepsWithVelocities(16, [
          [13, 0.8],  // Fill
        ])
      ),
      // Hi-hat - stops for fill
      createTrack('hihat-closed', 'HH Closed', DRUM_SAMPLES.hihatClosed,
        createStepsWithHits(16, [0, 2, 4, 6, 8, 10], 0.7)
      ),
    ]
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'The fill happens in the last 4 steps (13-16) of the bar.',
    'Use snare and tom hits to create movement.',
    'End the fill with a kick on step 16 to lead back to beat 1.',
  ],
};
