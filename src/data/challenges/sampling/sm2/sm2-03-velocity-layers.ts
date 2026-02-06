import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm2-03-velocity-layers',
  title: 'Velocity Layers',
  description: 'Set up velocity-sensitive sample triggering. Soft hits play quiet samples, hard hits play loud samples.',
  difficulty: 2,
  module: 'SM2',
  challengeType: 'recreate-kit',
  sourceSampleUrl: '/samples/challenges/sm2-03-source.wav',
  hints: [
    'Velocity layers respond to how hard you play.',
    'Lower velocity triggers softer samples.',
    'Higher velocity triggers louder, more intense samples.',
  ],
};
