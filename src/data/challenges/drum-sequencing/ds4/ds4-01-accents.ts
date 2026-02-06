import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds4-01-accents',
  title: 'Accents',
  description:
    'Add accents to emphasize beat 1. Accents are louder hits that give the pattern shape and help listeners feel where the bar starts. Make the first kick hit significantly louder.',
  difficulty: 2,
  module: 'DS4',
  challengeType: 'add-dynamics',
  startingPattern: createStandardPattern(
    'Accents',
    120,
    0,
    16,
    // All kicks at medium velocity
    createStepsWithVelocities(16, [
      [0, 0.7],
      [4, 0.7],
      [8, 0.7],
      [12, 0.7],
    ]),
    createStepsWithVelocities(16, [
      [4, 0.8],
      [12, 0.8],
    ]),
    createStepsWithVelocities(16, [
      [0, 0.6],
      [2, 0.6],
      [4, 0.6],
      [6, 0.6],
      [8, 0.6],
      [10, 0.6],
      [12, 0.6],
      [14, 0.6],
    ]),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Accents',
    120,
    0,
    16,
    // Accented kick on beat 1, softer on other beats
    createStepsWithVelocities(16, [
      [0, 1.0],  // Accented!
      [4, 0.7],
      [8, 0.7],
      [12, 0.7],
    ]),
    createStepsWithVelocities(16, [
      [4, 0.8],
      [12, 0.8],
    ]),
    // Hi-hats with accent on beat 1
    createStepsWithVelocities(16, [
      [0, 0.85], // Accented
      [2, 0.55],
      [4, 0.6],
      [6, 0.55],
      [8, 0.6],
      [10, 0.55],
      [12, 0.6],
      [14, 0.55],
    ]),
    createEmptySteps(16)
  ),
  evaluationFocus: ['velocity'],
  hints: [
    'Select the kick on step 1 and increase its velocity.',
    'The accent should be noticeably louder than the other kicks.',
    'You can also accent the hi-hat on beat 1 to reinforce the downbeat.',
  ],
};
