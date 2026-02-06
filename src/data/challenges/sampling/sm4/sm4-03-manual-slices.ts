import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm4-03-manual-slices',
  title: 'Manual Slices',
  description: 'Manually place slice points at the exact transients in a complex break. Precision is key.',
  difficulty: 2,
  module: 'SM4',
  challengeType: 'chop-challenge',
  sourceSampleUrl: '/samples/challenges/sm4-03-source.wav',
  expectedSlices: 8,
  hints: [
    'Zoom in to see the waveform detail.',
    'Transients appear as sharp spikes.',
    'Place slices just before each spike for clean hits.',
  ],
};
