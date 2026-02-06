import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm4-02-chop-vocals',
  title: 'Chop Vocals',
  description: 'Chop a vocal phrase into individual words or syllables. Create playable vocal chops.',
  difficulty: 2,
  module: 'SM4',
  challengeType: 'chop-challenge',
  sourceSampleUrl: '/samples/challenges/sm4-02-source.wav',
  expectedSlices: 6,
  hints: [
    'Vocals have natural break points between words.',
    'Slice at the start of each syllable.',
    'Watch for breaths and pauses as slice points.',
  ],
};
