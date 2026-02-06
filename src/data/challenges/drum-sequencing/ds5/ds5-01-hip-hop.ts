import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createStepsWithVelocities,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds5-01-hip-hop',
  title: 'Hip-Hop (Boom Bap)',
  description:
    'Create a classic boom-bap hip-hop beat. This 90s East Coast style features a heavy kick, snappy snare on the backbeat, and sparse hi-hats. Think J Dilla, DJ Premier, Pete Rock.',
  difficulty: 2,
  module: 'DS5',
  challengeType: 'genre-challenge',
  startingPattern: createStandardPattern(
    'Hip-Hop',
    90,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'Hip-Hop',
    90,
    0.2, // Light swing for that head-nod feel
    16,
    // Boom-bap kick: beat 1, and of 2, beat 3
    createStepsWithVelocities(16, [
      [0, 0.95],  // Beat 1
      [6, 0.8],   // And of 2
      [8, 0.85],  // Beat 3
    ]),
    // Snappy snare on 2 and 4
    createStepsWithVelocities(16, [
      [4, 0.95],
      [12, 0.95],
    ]),
    // Sparse hi-hats on eighth notes
    createStepsWithVelocities(16, [
      [0, 0.7],
      [2, 0.5],
      [4, 0.65],
      [6, 0.5],
      [8, 0.65],
      [10, 0.5],
      [12, 0.65],
      [14, 0.5],
    ]),
    createEmptySteps(16)
  ),
  evaluationFocus: ['pattern', 'swing'],
  hints: [
    'The kick pattern has syncopation - not just four on the floor.',
    'Place kicks on beat 1, the "and" of 2, and beat 3.',
    'Add a touch of swing (around 20%) for that head-nod feel.',
  ],
};
