import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createStepsWithHits,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds6-02-variation',
  title: 'Pattern Variation (A to B)',
  description:
    'Create a variation of the main pattern. Good drum programming uses subtle variations to keep things interesting. Modify the second half of the bar to create an A-B feel.',
  difficulty: 2,
  module: 'DS6',
  challengeType: 'complete-loop',
  startingPattern: createStandardPattern(
    'Variation',
    105,
    0,
    16,
    // Simple repeating kick
    createStepsWithHits(16, [0, 4, 8, 12], 0.9),
    // Basic backbeat
    createStepsWithHits(16, [4, 12], 0.9),
    // Steady hi-hats
    createStepsWithHits(16, [0, 2, 4, 6, 8, 10, 12, 14], 0.65),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Variation',
    105,
    0,
    16,
    // Kick with variation in second half
    createStepsWithVelocities(16, [
      [0, 0.9],
      [4, 0.85],
      [8, 0.9],
      [10, 0.75],  // Added syncopation in B section
      [12, 0.85],
    ]),
    // Snare with extra hit in B section
    createStepsWithVelocities(16, [
      [4, 0.9],
      [12, 0.9],
      [14, 0.6],   // Extra ghost hit in B section
    ]),
    // Hi-hat with open hat in B section
    createStepsWithVelocities(16, [
      [0, 0.65],
      [2, 0.6],
      [4, 0.65],
      [6, 0.6],
      [8, 0.7],    // Accent start of B
      [10, 0.6],
      [12, 0.65],
      [14, 0.6],
    ]),
    // Open hi-hat on step 11 for variation
    createStepsWithVelocities(16, [
      [10, 0.7],
    ])
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'The first half (A) stays the same, the second half (B) has variations.',
    'Add a syncopated kick in the B section (around step 11).',
    'An open hi-hat can signal the variation.',
  ],
};
