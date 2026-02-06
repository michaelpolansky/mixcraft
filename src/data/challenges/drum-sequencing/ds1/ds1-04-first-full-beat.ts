import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createFourOnFloorKick,
  createBackbeatSnare,
  createEighthNoteSteps,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds1-04-first-full-beat',
  title: 'First Full Beat',
  description:
    'Create a complete drum beat with kick, snare, and hi-hat. This is the foundation of countless songs. Kick on beats, snare on the backbeat, and hi-hats on eighth notes.',
  difficulty: 1,
  module: 'DS1',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('First Full Beat', 120, 16),
  targetPattern: createStandardPattern(
    'First Full Beat',
    120,
    0,
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createEighthNoteSteps(16, 0.7),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Build on what you learned: kick on 1-5-9-13, snare on 5-13.',
    'Add closed hi-hats on every eighth note (steps 1, 3, 5, 7, 9, 11, 13, 15).',
    'The hi-hat gives the beat its pulse and energy.',
  ],
};
