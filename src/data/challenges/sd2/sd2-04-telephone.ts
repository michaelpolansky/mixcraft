import type { Challenge } from '../../../core/types.ts';

/**
 * SD2-04: Telephone
 * Teaches: Bandpass filter (combining high and lowpass concepts)
 *
 * Players learn that bandpass filters cut both lows AND highs,
 * leaving only a narrow band of frequencies - like a telephone or radio.
 */
export const challenge: Challenge = {
  id: 'sd2-04-telephone',
  title: 'Telephone',
  description: 'Create that classic "telephone" or old radio sound. Narrow and midrange-focused, like sound through a tiny speaker.',
  difficulty: 2,
  module: 'SD2',
  testNote: 'C4',
  hints: [
    'Bandpass filters cut BOTH the lows and the highs.',
    'The cutoff frequency becomes the center of the band that passes through.',
    'A narrow bandpass around 1-2kHz gives that classic telephone quality.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'bandpass',
      cutoff: 1500,
      resonance: 4,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.2,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
