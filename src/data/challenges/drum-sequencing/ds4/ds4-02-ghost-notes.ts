import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createStepsWithHits,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds4-02-ghost-notes',
  title: 'Ghost Notes',
  description:
    'Add ghost notes to the snare drum. Ghost notes are very soft hits that fill in the groove without being obvious. They add texture and make the pattern feel more human.',
  difficulty: 2,
  module: 'DS4',
  challengeType: 'add-dynamics',
  startingPattern: createStandardPattern(
    'Ghost Notes',
    95,
    0.15,
    16,
    createStepsWithHits(16, [0, 8], 0.9),
    // Only backbeat snares, no ghosts
    createStepsWithVelocities(16, [
      [4, 0.9],
      [12, 0.9],
    ]),
    createStepsWithHits(16, [0, 2, 4, 6, 8, 10, 12, 14], 0.6),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Ghost Notes',
    95,
    0.15,
    16,
    createStepsWithHits(16, [0, 8], 0.9),
    // Backbeat snares with ghost notes
    createStepsWithVelocities(16, [
      [2, 0.25],  // Ghost
      [4, 0.9],   // Main hit
      [6, 0.2],   // Ghost
      [10, 0.25], // Ghost
      [12, 0.9],  // Main hit
      [14, 0.2],  // Ghost
    ]),
    createStepsWithHits(16, [0, 2, 4, 6, 8, 10, 12, 14], 0.6),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern', 'velocity'],
  hints: [
    'Ghost notes should be very quiet - around 20-30% velocity.',
    'Add ghost notes between the main snare hits on beats 2 and 4.',
    'Common ghost note positions are just before and after the main hits.',
  ],
};
