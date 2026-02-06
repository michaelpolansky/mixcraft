import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm4-01-slice-breaks',
  title: 'Slice Breaks',
  description: 'Slice a drum break into 8 equal parts. Each slice should isolate one hit from the break.',
  difficulty: 2,
  module: 'SM4',
  challengeType: 'chop-challenge',
  sourceSampleUrl: '/samples/challenges/sm4-01-source.wav',
  expectedSlices: 8,
  hints: [
    'Drum breaks have a repeating pattern of hits.',
    'Look at the waveform to find the transients.',
    'Place slices right before each drum hit.',
  ],
};
