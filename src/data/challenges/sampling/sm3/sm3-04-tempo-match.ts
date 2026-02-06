import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm3-04-tempo-match',
  title: 'Tempo Match',
  description: 'Match the sample to 120 BPM. The original sample is at 100 BPM - stretch it to fit the target tempo.',
  difficulty: 2,
  module: 'SM3',
  challengeType: 'tune-to-track',
  sourceSampleUrl: '/samples/challenges/sm3-04-source.wav',
  targetBpm: 120,
  targetParams: {
    timeStretch: 0.833,
  },
  hints: [
    'To match tempo: target BPM / source BPM = stretch factor.',
    '100 BPM to 120 BPM requires speeding up.',
    '100/120 = 0.833 (time compress to fit more beats in less time).',
  ],
};
