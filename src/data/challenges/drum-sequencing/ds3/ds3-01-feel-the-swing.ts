import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createFourOnFloorKick,
  createBackbeatSnare,
  createEighthNoteSteps,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds3-01-feel-the-swing',
  title: 'Feel the Swing',
  description:
    'Add 50% swing to a basic beat. Swing delays every other 16th note, creating a triplet-like feel that adds groove and bounce to your pattern.',
  difficulty: 2,
  module: 'DS3',
  challengeType: 'match-beat',
  startingPattern: createStandardPattern(
    'Feel the Swing',
    100,
    0, // No swing initially
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createEighthNoteSteps(16, 0.7),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Feel the Swing',
    100,
    0.5, // 50% swing
    16,
    createFourOnFloorKick(16, 0.9),
    createBackbeatSnare(16, 0.9),
    createEighthNoteSteps(16, 0.7),
    createEmptySteps(16)
  ),
  evaluationFocus: ['swing'],
  hints: [
    'The pattern is already programmed - you just need to add swing.',
    'Find the swing control and set it to 50%.',
    'Listen to how the offbeat notes get pushed later in time.',
  ],
};
