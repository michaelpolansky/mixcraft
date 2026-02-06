import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm6-02-fade-edges',
  title: 'Fade Edges',
  description: 'Add fade in and fade out to prevent clicks. Smooth edges make samples sound professional.',
  difficulty: 1,
  module: 'SM6',
  challengeType: 'clean-sample',
  sourceSampleUrl: '/samples/challenges/sm6-02-source.wav',
  targetParams: {
    fadeIn: 0.01,
    fadeOut: 0.05,
  },
  hints: [
    'Clicks happen when audio starts/stops abruptly.',
    'A tiny fade in (10ms) removes the initial click.',
    'A longer fade out (50ms) gives a natural decay.',
  ],
};
