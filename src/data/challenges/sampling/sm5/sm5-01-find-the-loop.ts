import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm5-01-find-the-loop',
  title: 'Find the Loop',
  description: 'Find the perfect loop point in a sample. A good loop should be seamless with no clicks or pops.',
  difficulty: 2,
  module: 'SM5',
  challengeType: 'flip-this',
  sourceSampleUrl: '/samples/challenges/sm5-01-source.wav',
  targetParams: {
    loop: true,
    startPoint: 0.25,
    endPoint: 0.75,
  },
  hints: [
    'Look for a section that repeats musically.',
    'Loop points should be at zero crossings.',
    'Listen for clicks - they mean the loop points are off.',
  ],
};
