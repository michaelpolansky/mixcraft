import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm6-03-normalize',
  title: 'Normalize Levels',
  description: 'Set the sample to proper levels. Normalize boosts quiet samples without clipping.',
  difficulty: 2,
  module: 'SM6',
  challengeType: 'clean-sample',
  sourceSampleUrl: '/samples/challenges/sm6-03-source.wav',
  targetParams: {
    volume: -3,
  },
  hints: [
    'Normalizing brings the peak to a target level.',
    '-3 dB gives headroom while maintaining volume.',
    'Watch the meters - avoid red/clipping.',
  ],
};
