import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createFourOnFloorKick,
  createBackbeatSnare,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds1-03-basic-rock',
  title: 'Basic Rock Beat',
  description:
    'Combine kick and snare to create the essential rock beat. Kick on every beat (1, 2, 3, 4), snare on the backbeat (2 and 4).',
  difficulty: 1,
  module: 'DS1',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('Basic Rock', 120, 16),
  targetPattern: createStandardPattern(
    'Basic Rock',
    120,
    0,
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Start with the kick on every quarter note (steps 1, 5, 9, 13).',
    'Add snare on beats 2 and 4 (steps 5 and 13).',
    'Notice how kick and snare hit together on beats 2 and 4.',
  ],
};
