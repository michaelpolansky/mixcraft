import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithHits,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds3-04-pocket-feel',
  title: 'Pocket Feel',
  description:
    'Create a laid-back groove with light swing. The "pocket" is that comfortable, locked-in feel where everything sits just right. Program the pattern and find the right swing amount.',
  difficulty: 2,
  module: 'DS3',
  challengeType: 'match-beat',
  startingPattern: createStandardPattern(
    'Pocket Feel',
    95,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Pocket Feel',
    95,
    0.35, // Light swing for pocket feel
    16,
    // Kick pattern with syncopation: 0, 6, 8, 14
    createStepsWithHits(16, [0, 6, 8, 14], 0.85),
    // Snare on backbeat with ghost note: 4, 10, 12
    createStepsWithHits(16, [4, 12], 0.9),
    // Hi-hat on eighth notes
    createStepsWithHits(16, [0, 2, 4, 6, 8, 10, 12, 14], 0.65),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern', 'swing'],
  hints: [
    'The kick has some syncopation - it is not just four on the floor.',
    'Listen for kicks on beat 1, the "and" of 2, beat 3, and the "and" of 4.',
    'Find the swing that makes it feel relaxed but still groovy (around 30-40%).',
  ],
};
