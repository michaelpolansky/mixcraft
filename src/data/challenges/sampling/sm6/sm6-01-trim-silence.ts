import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm6-01-trim-silence',
  title: 'Trim Silence',
  description: 'Remove dead air from the beginning and end of the sample. Clean samples trigger more accurately.',
  difficulty: 1,
  module: 'SM6',
  challengeType: 'clean-sample',
  sourceSampleUrl: '/samples/challenges/sm6-01-source.wav',
  targetParams: {
    startPoint: 0.1,
    endPoint: 0.9,
  },
  hints: [
    'Silence at the start causes timing delays.',
    'Look for where the waveform begins.',
    'Trim close to the first transient but not into it.',
  ],
};
