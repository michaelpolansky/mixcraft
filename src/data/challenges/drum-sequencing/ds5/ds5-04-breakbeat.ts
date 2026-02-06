import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds5-04-breakbeat',
  title: 'Breakbeat (Funk)',
  description:
    'Create a syncopated funk breakbeat. This pattern has a more complex, funky feel with ghost notes and syncopated kicks. Think James Brown, Clyde Stubblefield, breakdancing.',
  difficulty: 3,
  module: 'DS5',
  challengeType: 'genre-challenge',
  startingPattern: createStandardPattern(
    'Breakbeat',
    100,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Breakbeat',
    100,
    0.15, // Light swing
    16,
    // Syncopated funk kick
    createStepsWithVelocities(16, [
      [0, 0.95],   // Beat 1
      [5, 0.75],   // Syncopation
      [8, 0.85],   // Beat 3
      [11, 0.7],   // Syncopation
    ]),
    // Snare with ghost notes for funk
    createStepsWithVelocities(16, [
      [2, 0.25],   // Ghost
      [4, 0.9],    // Beat 2
      [6, 0.3],    // Ghost
      [10, 0.25],  // Ghost
      [12, 0.9],   // Beat 4
      [14, 0.3],   // Ghost
    ]),
    // Hi-hat pattern with accents
    createStepsWithVelocities(16, [
      [0, 0.75],
      [2, 0.6],
      [4, 0.7],
      [6, 0.55],
      [8, 0.75],
      [10, 0.6],
      [12, 0.7],
      [14, 0.55],
    ]),
    // Open hi-hat on upbeats
    createStepsWithVelocities(16, [
      [6, 0.6],
      [14, 0.55],
    ])
  ),
  evaluationFocus: ['pattern', 'velocity', 'swing'],
  hints: [
    'The kick has syncopation - hits on the "e" of 2 and "a" of 3.',
    'Add ghost notes (quiet hits) around the main snare hits.',
    'A touch of swing makes it feel more human and funky.',
  ],
};
