import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createStepsWithHits,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds2-03-open-and-closed',
  title: 'Open and Closed',
  description:
    'Combine open and closed hi-hats for a classic pattern. The open hi-hat on the "and" of each beat adds tension that resolves with the closed hit.',
  difficulty: 2,
  module: 'DS2',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('Open and Closed', 110, 16),
  targetPattern: createStandardPattern(
    'Open and Closed',
    110,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    // Closed hi-hats on quarter notes: 0, 4, 8, 12
    createStepsWithHits(16, [0, 4, 8, 12], 0.7),
    // Open hi-hats on the "and" of each beat: 2, 6, 10, 14
    createStepsWithHits(16, [2, 6, 10, 14], 0.8)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Closed hi-hats go on the main beats (steps 1, 5, 9, 13).',
    'Open hi-hats go on the offbeats (steps 3, 7, 11, 15).',
    'In real drumming, the open hi-hat is cut off by the closed one.',
  ],
};
