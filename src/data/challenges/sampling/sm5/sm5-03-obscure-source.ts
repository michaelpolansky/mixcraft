import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm5-03-obscure-source',
  title: 'Obscure the Source',
  description: 'Transform the sample so the original is unrecognizable. Use pitch, time, and effects to flip it completely.',
  difficulty: 3,
  module: 'SM5',
  challengeType: 'flip-this',
  sourceSampleUrl: '/samples/challenges/sm5-03-source.wav',
  targetParams: {
    pitch: -12,
    timeStretch: 1.5,
    reverse: true,
  },
  hints: [
    'Pitch down dramatically to change the character.',
    'Time stretch adds atmosphere and texture.',
    'Reverse playback makes it truly unrecognizable.',
  ],
};
