import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createBackbeatSnare,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds1-02-the-backbeat',
  title: 'The Backbeat',
  description:
    'Add snare drums on beats 2 and 4. The backbeat is the backbone of rock, pop, and R&B. Place snares on steps 5 and 13.',
  difficulty: 1,
  module: 'DS1',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('The Backbeat', 120, 16),
  targetPattern: createStandardPattern(
    'The Backbeat',
    120,
    0,
    16,
    createEmptySteps(16),
    createBackbeatSnare(16, 0.9),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'The snare goes on beats 2 and 4, not 1 and 3.',
    'In a 16-step grid, beat 2 is step 5 and beat 4 is step 13.',
    'Count along: 1-e-and-a-2-e-and-a-3-e-and-a-4-e-and-a.',
  ],
};
