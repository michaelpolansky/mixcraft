import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm1-02-trigger-one-shot',
  title: 'Trigger One-Shot',
  description: 'Trigger a drum sample as a one-shot. One-shots play once and stop, perfect for drums and hits.',
  difficulty: 1,
  module: 'SM1',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm1-02-source.wav',
  targetParams: {
    loop: false,
  },
  hints: [
    'One-shot mode plays the sample once without looping.',
    'Make sure Loop is turned OFF.',
    'Adjust the envelope for a clean, punchy hit.',
  ],
};
