import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createFourOnFloorKick,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds1-01-four-on-floor',
  title: 'Four on the Floor',
  description:
    'Program the kick drum on every beat. This foundational pattern drives dance music from disco to house. Place kicks on steps 1, 5, 9, and 13 (the quarter notes).',
  difficulty: 1,
  module: 'DS1',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('Four on the Floor', 120, 16),
  targetPattern: createStandardPattern(
    'Four on the Floor',
    120,
    0,
    16,
    createFourOnFloorKick(16, 0.9),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Click on the kick drum row to place hits.',
    'The grid has 16 steps representing one bar of 16th notes.',
    'Quarter notes land on steps 1, 5, 9, and 13 (every 4th step starting from 1).',
  ],
};
