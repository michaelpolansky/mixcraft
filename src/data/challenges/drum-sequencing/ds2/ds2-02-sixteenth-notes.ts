import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createStandardPattern,
  createSixteenthNoteSteps,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds2-02-sixteenth-notes',
  title: 'Sixteenth Note Hi-Hats',
  description:
    'Fill every step with hi-hats for a driving sixteenth note pattern. This high-energy pattern is essential for dance music, funk, and hip-hop.',
  difficulty: 1,
  module: 'DS2',
  challengeType: 'match-beat',
  startingPattern: createEmptyPattern('Sixteenth Notes', 100, 16),
  targetPattern: createStandardPattern(
    'Sixteenth Notes',
    100,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createSixteenthNoteSteps(16, 0.6),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Every single step should have a hi-hat.',
    'That means all 16 steps are active.',
    'Try a slower tempo if it sounds too fast.',
  ],
};
