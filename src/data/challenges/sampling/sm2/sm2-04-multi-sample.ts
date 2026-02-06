import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm2-04-multi-sample',
  title: 'Multi-Sample Instrument',
  description: 'Create a playable instrument using multiple samples mapped across the keyboard with proper zones.',
  difficulty: 2,
  module: 'SM2',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm2-04-source.wav',
  expectedSlices: 4,
  hints: [
    'Multi-sampling uses different recordings for different ranges.',
    'This prevents artifacts from extreme pitch shifting.',
    'Overlap zones slightly for smooth transitions.',
  ],
};
