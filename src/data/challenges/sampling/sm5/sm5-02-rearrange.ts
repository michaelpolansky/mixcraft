import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm5-02-rearrange',
  title: 'Rearrange Chops',
  description: 'Rearrange the chopped sections to create a new groove. Flip the sample into something fresh.',
  difficulty: 2,
  module: 'SM5',
  challengeType: 'flip-this',
  sourceSampleUrl: '/samples/challenges/sm5-02-source.wav',
  expectedSlices: 4,
  targetSampleUrl: '/samples/challenges/sm5-02-target.wav',
  hints: [
    'Flipping means creating something new from existing material.',
    'Try reversing the order of sections.',
    'Experiment with different arrangements until it grooves.',
  ],
};
