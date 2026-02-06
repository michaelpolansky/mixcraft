import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm6-04-perfect-loop',
  title: 'Perfect Loop',
  description: 'Set precise loop points for seamless playback. The sample should loop indefinitely without any artifacts.',
  difficulty: 2,
  module: 'SM6',
  challengeType: 'clean-sample',
  sourceSampleUrl: '/samples/challenges/sm6-04-source.wav',
  targetParams: {
    loop: true,
    startPoint: 0.0,
    endPoint: 0.5,
    fadeIn: 0.005,
    fadeOut: 0.005,
  },
  hints: [
    'Perfect loops require matching waveform positions.',
    'Start and end should be at zero crossings.',
    'Tiny crossfades hide any remaining discontinuity.',
  ],
};
