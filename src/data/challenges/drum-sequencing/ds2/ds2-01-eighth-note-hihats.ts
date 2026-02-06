import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createEighthNoteSteps,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds2-01-eighth-note-hihats',
  title: 'Eighth Note Hi-Hats',
  description:
    'Program hi-hats on every eighth note. This steady pulse drives the rhythm forward and is the most common hi-hat pattern in popular music.',
  difficulty: 1,
  module: 'DS2',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('Eighth Note Hi-Hats', 120, 16),
  targetPattern: createStandardPattern(
    'Eighth Note Hi-Hats',
    120,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEighthNoteSteps(16, 0.7),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Eighth notes fall on every other step in a 16th note grid.',
    'That means steps 1, 3, 5, 7, 9, 11, 13, 15 (8 hits total).',
    'Use the closed hi-hat row for this pattern.',
  ],
};
