import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm4-04-trigger-patterns',
  title: 'Trigger Patterns',
  description: 'Trigger your slices in a new order to create a different rhythm. Rearrange the beat.',
  difficulty: 2,
  module: 'SM4',
  challengeType: 'chop-challenge',
  sourceSampleUrl: '/samples/challenges/sm4-04-source.wav',
  expectedSlices: 8,
  targetSampleUrl: '/samples/challenges/sm4-04-target.wav',
  hints: [
    'Once chopped, slices can be triggered in any order.',
    'Try playing slices backwards or shuffled.',
    'Match the target pattern by triggering slices correctly.',
  ],
};
