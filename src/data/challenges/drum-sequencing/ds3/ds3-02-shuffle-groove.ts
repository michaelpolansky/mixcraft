import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithHits,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds3-02-shuffle-groove',
  title: 'Shuffle Groove',
  description:
    'Create a heavy shuffle pattern with maximum swing. The shuffle feel is essential for blues, jazz, and early rock and roll. Program the pattern and dial in the swing.',
  difficulty: 2,
  module: 'DS3',
  challengeType: 'match-beat',
  startingPattern: createStandardPattern(
    'Shuffle Groove',
    90,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Shuffle Groove',
    90,
    0.66, // Heavy swing for shuffle
    16,
    // Kick on 1 and 3: steps 0 and 8
    createStepsWithHits(16, [0, 8], 0.9),
    // Snare on 2 and 4: steps 4 and 12
    createStepsWithHits(16, [4, 12], 0.9),
    // Hi-hat on all eighth notes, will be swung
    createStepsWithHits(16, [0, 2, 4, 6, 8, 10, 12, 14], 0.7),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern', 'swing'],
  hints: [
    'A shuffle uses kick on 1 and 3, snare on 2 and 4.',
    'Add hi-hats on eighth notes for the shuffle pattern.',
    'Set swing to around 66% for a heavy shuffle feel.',
  ],
};
