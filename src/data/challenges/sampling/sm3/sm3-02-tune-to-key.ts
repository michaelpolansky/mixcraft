import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm3-02-tune-to-key',
  title: 'Tune to Key',
  description: 'Tune the sample to match the target key of C major. The source sample is slightly sharp.',
  difficulty: 2,
  module: 'SM3',
  challengeType: 'tune-to-track',
  sourceSampleUrl: '/samples/challenges/sm3-02-source.wav',
  targetKey: 'C',
  targetParams: {
    pitch: -2,
  },
  hints: [
    'Listen carefully to the pitch relationship.',
    'The sample sounds sharp compared to the target.',
    'Tune down by 2 semitones to reach C.',
  ],
};
