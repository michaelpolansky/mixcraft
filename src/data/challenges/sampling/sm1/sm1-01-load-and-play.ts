import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm1-01-load-and-play',
  title: 'Load and Play',
  description: 'Load a sample and trigger it. Learn the basics of sample playback.',
  difficulty: 1,
  module: 'SM1',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm1-01-source.wav',
  hints: [
    'Click on a sample in the library to load it.',
    'Press the Play button to hear the full sample.',
    'Try adjusting the start and end points to play a portion.',
  ],
};
