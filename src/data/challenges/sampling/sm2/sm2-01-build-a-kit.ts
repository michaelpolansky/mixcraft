import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm2-01-build-a-kit',
  title: 'Build a Kit',
  description: 'Create a 4-pad drum kit with kick, snare, hi-hat, and clap. Map each sample to a different pad.',
  difficulty: 1,
  module: 'SM2',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm2-01-source.wav',
  expectedSlices: 4,
  hints: [
    'A drum kit maps different sounds to different triggers.',
    'Slice the sample to isolate each drum hit.',
    'You need 4 slices: kick, snare, hi-hat, and clap.',
  ],
};
