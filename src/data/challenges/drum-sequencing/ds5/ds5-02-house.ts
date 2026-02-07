import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createStandardPattern,
  createFourOnFloorKick,
  createStepsWithVelocities,
  createStepsWithHits,
  createOffbeatHihat,
  createEmptySteps,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds5-02-house',
  title: 'House Music',
  description:
    'Create a classic house beat with four-on-the-floor kick and offbeat hi-hats. This driving pattern is the foundation of electronic dance music from Chicago to Ibiza.',
  difficulty: 2,
  module: 'DS5',
  challengeType: 'genre-challenge',
  startingPattern: createStandardPattern(
    'House',
    125,
    0,
    16,
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16),
    createEmptySteps(16)
  ),
  targetPattern: createStandardPattern(
    'House',
    125,
    0, // House is usually straight
    16,
    // Four on the floor kick
    createFourOnFloorKick(16, 0.9),
    // Clap/snare on 2 and 4
    createStepsWithHits(16, [4, 12], 0.85),
    // Closed hi-hats on offbeats (the signature house groove)
    createOffbeatHihat(16, 0.75),
    // Open hi-hat on beat 2 for variation
    createStepsWithVelocities(16, [[4, 0.65]])
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'Start with the four-on-the-floor kick (every beat: 1, 5, 9, 13).',
    'The signature house hi-hat is on the offbeats (steps 3, 7, 11, 15).',
    'Add claps or snares on beats 2 and 4.',
  ],
};
