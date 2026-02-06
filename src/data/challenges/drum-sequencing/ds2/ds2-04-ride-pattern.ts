import type { DrumSequencingChallenge } from '../../../../core/types.ts';
import {
  createEmptyPattern,
  createPattern,
  createTrack,
  createStepsWithHits,
  createEmptySteps,
  DRUM_SAMPLES,
} from '../pattern-helpers.ts';

export const challenge: DrumSequencingChallenge = {
  id: 'ds2-04-ride-pattern',
  title: 'Ride Cymbal Pattern',
  description:
    'Create a basic ride cymbal pattern. The ride cymbal provides a more sustained, shimmering sound compared to hi-hats. Common in jazz, rock verses, and breakdowns.',
  difficulty: 2,
  module: 'DS2',
  challengeType: 'match-beat',
  startingPattern: createPattern(
    'Ride Pattern',
    100,
    0,
    16,
    [
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick, createEmptySteps(16)),
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare, createEmptySteps(16)),
      createTrack('ride', 'Ride', DRUM_SAMPLES.ride, createEmptySteps(16)),
      createTrack('crash', 'Crash', DRUM_SAMPLES.crash, createEmptySteps(16)),
    ]
  ),
  targetPattern: createPattern(
    'Ride Pattern',
    100,
    0,
    16,
    [
      createTrack('kick', 'Kick', DRUM_SAMPLES.kick, createEmptySteps(16)),
      createTrack('snare', 'Snare', DRUM_SAMPLES.snare, createEmptySteps(16)),
      // Ride on quarter notes with accent on beat 1
      createTrack('ride', 'Ride', DRUM_SAMPLES.ride, createStepsWithHits(16, [0, 4, 8, 12], 0.75)),
      createTrack('crash', 'Crash', DRUM_SAMPLES.crash, createEmptySteps(16)),
    ]
  ),
  evaluationFocus: ['pattern'],
  hints: [
    'The ride cymbal often plays on quarter notes like the kick drum.',
    'Place ride hits on steps 1, 5, 9, and 13.',
    'The ride has a more sustained sound than the hi-hat.',
  ],
};
