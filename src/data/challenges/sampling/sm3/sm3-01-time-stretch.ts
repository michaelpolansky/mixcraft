import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm3-01-time-stretch',
  title: 'Time Stretch',
  description: 'Stretch the sample to 120% length without changing its pitch. Time stretching lets you fit samples to different tempos.',
  difficulty: 2,
  module: 'SM3',
  challengeType: 'tune-to-track',
  sourceSampleUrl: '/samples/challenges/sm3-01-source.wav',
  targetParams: {
    timeStretch: 1.2,
  },
  hints: [
    'Time stretch changes duration without affecting pitch.',
    '1.2 means 120% of original length (20% slower).',
    'Listen for artifacts - too much stretch causes warbling.',
  ],
};
