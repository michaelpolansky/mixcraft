import type { SamplingChallenge } from '../../../../core/types.ts';

export const challenge: SamplingChallenge = {
  id: 'sm1-03-pitch-shift',
  title: 'Pitch Shift',
  description: 'Shift the sample up by 5 semitones to match the target pitch. Pitch shifting changes the key without changing speed.',
  difficulty: 1,
  module: 'SM1',
  challengeType: 'tune-to-track',
  sourceSampleUrl: '/samples/challenges/sm1-03-source.wav',
  targetParams: {
    pitch: 5,
  },
  hints: [
    'Use the Pitch control to shift the sample up.',
    'Each semitone is one note on a piano.',
    '+5 semitones = 5 half steps up (like C to F).',
  ],
};
