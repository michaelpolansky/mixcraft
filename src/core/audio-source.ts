/**
 * Audio Source System
 * Procedural audio generators for mixing challenges
 */

import * as Tone from 'tone';

/**
 * Audio source configuration
 */
export interface AudioSourceConfig {
  type: 'tone' | 'noise' | 'drum' | 'bass' | 'pad' | 'vocal' | 'keys' | 'guitar' | 'snare' | 'hihat';
  frequency?: number;     // For tone/bass (Hz)
  duration?: number;      // For one-shots (seconds)
  loop?: boolean;         // Continuous playback
  // Future: url for stems
}

/**
 * Audio source instance that can be played
 */
export interface AudioSource {
  connect(destination: Tone.InputNode): void;
  disconnect(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

/**
 * Create a simple tone source (sine, saw, square)
 */
function createToneSource(
  frequency: number,
  waveform: 'sine' | 'sawtooth' | 'square' = 'sine'
): AudioSource {
  const osc = new Tone.Oscillator(frequency, waveform);

  return {
    connect: (dest) => osc.connect(dest),
    disconnect: () => osc.disconnect(),
    start: () => osc.start(),
    stop: () => osc.stop(),
    dispose: () => osc.dispose(),
  };
}

/**
 * Create a noise source (white or pink)
 */
function createNoiseSource(noiseType: 'white' | 'pink' = 'pink'): AudioSource {
  const noise = new Tone.Noise(noiseType);

  return {
    connect: (dest) => noise.connect(dest),
    disconnect: () => noise.disconnect(),
    start: () => noise.start(),
    stop: () => noise.stop(),
    dispose: () => noise.dispose(),
  };
}

/**
 * Create a drum hit source (kick-like transient)
 */
function createDrumSource(): AudioSource {
  // Drum hit: sine for body + noise burst for attack
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.1,
    },
  });

  let interval: number | null = null;

  return {
    connect: (dest) => kick.connect(dest),
    disconnect: () => kick.disconnect(),
    start: () => {
      // Play drum hit repeatedly for continuous practice
      kick.triggerAttackRelease('C1', '8n');
      interval = window.setInterval(() => {
        kick.triggerAttackRelease('C1', '8n');
      }, 600); // ~100 BPM quarter notes
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      kick.dispose();
    },
  };
}

/**
 * Create a snare drum source
 */
function createSnareSource(): AudioSource {
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
    },
  });

  // Add some body with a pitched element
  const body = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
      release: 0.05,
    },
  });

  // Filter the noise to sound more snare-like
  const filter = new Tone.Filter(5000, 'highpass');
  snare.connect(filter);

  let interval: number | null = null;

  return {
    connect: (dest) => {
      filter.connect(dest);
      body.connect(dest);
    },
    disconnect: () => {
      filter.disconnect();
      body.disconnect();
    },
    start: () => {
      snare.triggerAttackRelease('8n');
      body.triggerAttackRelease('E2', '16n');
      interval = window.setInterval(() => {
        snare.triggerAttackRelease('8n');
        body.triggerAttackRelease('E2', '16n');
      }, 600);
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      snare.dispose();
      body.dispose();
      filter.dispose();
    },
  };
}

/**
 * Create a hi-hat source
 */
function createHihatSource(): AudioSource {
  const hihat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.1,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });

  let interval: number | null = null;

  return {
    connect: (dest) => hihat.connect(dest),
    disconnect: () => hihat.disconnect(),
    start: () => {
      hihat.triggerAttackRelease(200, '16n');
      interval = window.setInterval(() => {
        hihat.triggerAttackRelease(200, '16n');
      }, 150); // 16th notes at ~100 BPM
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      hihat.dispose();
    },
  };
}

/**
 * Create a bass source (low sine with harmonics)
 */
function createBassSource(frequency: number = 60): AudioSource {
  // Bass: fundamental + octave for richness
  const synth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: {
      type: 'lowpass',
      frequency: 400,
      Q: 2,
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.3,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
      baseFrequency: 200,
      octaves: 2,
    },
  });

  let interval: number | null = null;
  const note = Tone.Frequency(frequency, 'hz').toNote();

  return {
    connect: (dest) => synth.connect(dest),
    disconnect: () => synth.disconnect(),
    start: () => {
      synth.triggerAttack(note);
      // Retrigger periodically for sustained practice
      interval = window.setInterval(() => {
        synth.triggerRelease();
        setTimeout(() => synth.triggerAttack(note), 50);
      }, 2000);
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      synth.triggerRelease();
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      synth.dispose();
    },
  };
}

/**
 * Create a pad source (slow attack, sustained)
 */
function createPadSource(frequency: number = 220): AudioSource {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0,
    },
  });

  const filter = new Tone.Filter(2000, 'lowpass');
  synth.connect(filter);

  const note = Tone.Frequency(frequency, 'hz').toNote();
  // Add some detuned notes for richness
  const chord = [note, Tone.Frequency(frequency * 1.5, 'hz').toNote()];

  return {
    connect: (dest) => filter.connect(dest),
    disconnect: () => filter.disconnect(),
    start: () => {
      synth.triggerAttack(chord);
    },
    stop: () => {
      synth.triggerRelease(chord);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
    },
  };
}

/**
 * Create a vocal-like source (formant-ish synth)
 */
function createVocalSource(frequency: number = 220): AudioSource {
  // Simulate vocals with filtered sawtooth + formant-like filtering
  const synth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: {
      type: 'bandpass',
      frequency: 1200,  // First formant region
      Q: 2,
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
      baseFrequency: 800,
      octaves: 1.5,
    },
  });

  // Add second formant with another filter
  const formant2 = new Tone.Filter(2500, 'bandpass', -12);
  formant2.Q.value = 3;
  synth.connect(formant2);

  const note = Tone.Frequency(frequency, 'hz').toNote();
  let interval: number | null = null;

  return {
    connect: (dest) => formant2.connect(dest),
    disconnect: () => formant2.disconnect(),
    start: () => {
      synth.triggerAttack(note);
      // Slight pitch variations for realism
      interval = window.setInterval(() => {
        synth.triggerRelease();
        setTimeout(() => synth.triggerAttack(note), 100);
      }, 2500);
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      synth.triggerRelease();
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      synth.dispose();
      formant2.dispose();
    },
  };
}

/**
 * Create a keys/piano-like source
 */
function createKeysSource(frequency: number = 440): AudioSource {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.01,
      decay: 0.8,
      sustain: 0.3,
      release: 1.2,
    },
  });

  const note = Tone.Frequency(frequency, 'hz').toNote();
  // Create a simple chord
  const chord = [
    note,
    Tone.Frequency(frequency * 1.25, 'hz').toNote(), // Major third
    Tone.Frequency(frequency * 1.5, 'hz').toNote(),  // Fifth
  ];

  let interval: number | null = null;

  return {
    connect: (dest) => synth.connect(dest),
    disconnect: () => synth.disconnect(),
    start: () => {
      synth.triggerAttack(chord);
      interval = window.setInterval(() => {
        synth.triggerRelease(chord);
        setTimeout(() => synth.triggerAttack(chord), 50);
      }, 2000);
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      synth.triggerRelease(chord);
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      synth.dispose();
    },
  };
}

/**
 * Create a guitar-like source
 */
function createGuitarSource(frequency: number = 330): AudioSource {
  const synth = new Tone.PluckSynth({
    attackNoise: 2,
    dampening: 4000,
    resonance: 0.95,
  });

  const note = Tone.Frequency(frequency, 'hz').toNote();
  let interval: number | null = null;

  return {
    connect: (dest) => synth.connect(dest),
    disconnect: () => synth.disconnect(),
    start: () => {
      synth.triggerAttack(note);
      interval = window.setInterval(() => {
        synth.triggerAttack(note);
      }, 800);
    },
    stop: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    dispose: () => {
      if (interval) clearInterval(interval);
      synth.dispose();
    },
  };
}

/**
 * Create an audio source from configuration
 */
export function createAudioSource(config: AudioSourceConfig): AudioSource {
  switch (config.type) {
    case 'tone':
      return createToneSource(config.frequency ?? 440);
    case 'noise':
      return createNoiseSource('pink');
    case 'drum':
      return createDrumSource();
    case 'bass':
      return createBassSource(config.frequency ?? 60);
    case 'pad':
      return createPadSource(config.frequency ?? 220);
    case 'vocal':
      return createVocalSource(config.frequency ?? 220);
    case 'keys':
      return createKeysSource(config.frequency ?? 440);
    case 'guitar':
      return createGuitarSource(config.frequency ?? 330);
    case 'snare':
      return createSnareSource();
    case 'hihat':
      return createHihatSource();
    default:
      throw new Error(`Unknown audio source type: ${config.type}`);
  }
}

/**
 * Predefined audio sources for common mixing scenarios
 */
export const MIXING_SOURCES = {
  // F1: Frequency basics - tones at different frequencies
  lowTone: { type: 'tone' as const, frequency: 100 },
  midTone: { type: 'tone' as const, frequency: 1000 },
  highTone: { type: 'tone' as const, frequency: 4000 },

  // F2-F3: EQ exercises - noise and complex tones
  pinkNoise: { type: 'noise' as const },
  richTone: { type: 'bass' as const, frequency: 100 },
  brightTone: { type: 'tone' as const, frequency: 2000 },

  // F4-F5: Compression - drums and dynamic material
  kick: { type: 'drum' as const },
  bass: { type: 'bass' as const, frequency: 60 },

  // F6-F7: Reverb/Delay - pads and sustained sounds
  pad: { type: 'pad' as const, frequency: 220 },
  lead: { type: 'tone' as const, frequency: 440 },
};
