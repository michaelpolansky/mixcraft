import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm1-04-layer-sounds',
  title: 'Layer Sounds',
  description: 'Combine two samples at the correct levels. Layering adds depth and fullness to your sounds.',
  difficulty: 1,
  module: 'SM1',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm1-04-source.wav',
  targetSampleUrl: '/samples/challenges/sm1-04-target.wav',
  targetParams: {
    volume: -6,
  },
  hints: [
    'Layering means playing multiple sounds together.',
    'Balance the levels so neither sound dominates.',
    'Try setting the volume to -6 dB for a balanced mix.',
  ],
};
