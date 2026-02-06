import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm3-03-warp-timing',
  title: 'Warp Timing',
  description: 'Adjust the timing of the sample to sit better in the groove. Use time stretch to tighten up a loose performance.',
  difficulty: 2,
  module: 'SM3',
  challengeType: 'tune-to-track',
  sourceSampleUrl: '/samples/challenges/sm3-03-source.wav',
  targetParams: {
    timeStretch: 0.95,
  },
  hints: [
    'Sometimes samples are slightly off-tempo.',
    'A slight time stretch can tighten the timing.',
    'Compress to 95% to make it punch harder.',
  ],
};
