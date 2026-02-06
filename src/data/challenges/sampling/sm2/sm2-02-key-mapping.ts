import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm2-02-key-mapping',
  title: 'Key Mapping',
  description: 'Map a single sample across a keyboard range. Each key should play the sample at a different pitch.',
  difficulty: 1,
  module: 'SM2',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm2-02-source.wav',
  targetKey: 'C',
  hints: [
    'Key mapping lets you play a sample at different pitches.',
    'The root key plays at original pitch.',
    'Higher keys pitch up, lower keys pitch down.',
  ],
};
