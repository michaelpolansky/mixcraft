import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm5-04-creative-flip',
  title: 'Creative Flip',
  description: 'Create something entirely new from the source material. Combine all your skills to make it your own.',
  difficulty: 3,
  module: 'SM5',
  challengeType: 'flip-this',
  sourceSampleUrl: '/samples/challenges/sm5-04-source.wav',
  targetSampleUrl: '/samples/challenges/sm5-04-target.wav',
  hints: [
    'There is no wrong answer - creativity is key.',
    'Combine chopping, pitch shifting, and effects.',
    'Match the vibe of the target, not the exact sound.',
  ],
};
