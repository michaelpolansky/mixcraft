import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createFourOnFloorKick,
  createBackbeatSnare,
  createSixteenthNoteSteps,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds3-03-straight-vs-swing',
  title: 'Straight vs Swing',
  description:
    'The target pattern has subtle swing. Listen carefully and match the timing feel. This teaches you to hear the difference between straight and swung rhythms.',
  difficulty: 2,
  module: 'DS3',
  challengeType: 'fix-groove',
  startingPattern: createStandardPattern(
    'Straight vs Swing',
    110,
    0.5, // Starting with swing (wrong)
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createSixteenthNoteSteps(16, 0.6),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Straight vs Swing',
    110,
    0.25, // Target has light swing
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createSixteenthNoteSteps(16, 0.6),
    createEmptySteps(16)
  ),
  evaluationFocus: ['swing'],
  hints: [
    'Listen to both patterns back to back.',
    'The target has a subtle swing - not straight, but not heavy swing.',
    'Try adjusting swing around 20-30%.',
  ],
};
