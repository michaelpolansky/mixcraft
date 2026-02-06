/**
 * MIXCRAFT Synth Engine
 * Wraps Tone.js MonoSynth with exposed parameters for subtractive synthesis
 */

import * as Tone from 'tone';
import type {
  SynthParams,
  OscillatorType,
  FilterType,
  ADSREnvelope,
  FilterEnvelopeParams,
  LFOParams,
  LFOWaveform,
  AnalyserConfig,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
} from './types.ts';
import {
  DEFAULT_SYNTH_PARAMS,
  DEFAULT_ANALYSER_CONFIG,
} from './types.ts';
import { EffectsChain } from './effects-chain.ts';

/**
 * Converts our filter type names to Tone.js BiquadFilterType
 */
function toToneFilterType(type: FilterType): BiquadFilterType {
  return type; // Our types match Tone.js naming
}

/**
 * Converts our oscillator type names to Tone.js OscillatorType
 */
function toToneOscillatorType(type: OscillatorType): Tone.ToneOscillatorType {
  return type;
}

/**
 * Calculates frequency with octave offset
 */
function applyOctaveOffset(baseFreq: number, octave: number): number {
  return baseFreq * Math.pow(2, octave);
}

/**
 * SynthEngine class - wraps Tone.MonoSynth for subtractive synthesis
 *
 * All parameters are exposed and can be updated in real-time.
 * The engine maintains its own copy of params to ensure 1:1 UI mapping.
 */
export class SynthEngine {
  private synth: Tone.MonoSynth;
  private lfo: Tone.LFO;
  private lfoGain: Tone.Gain;
  private analyser: AnalyserNode;
  private params: SynthParams;
  private isInitialized = false;

  // Effects chain
  private effectsChain: EffectsChain;

  constructor(initialParams: Partial<SynthParams> = {}) {
    this.params = { ...DEFAULT_SYNTH_PARAMS, ...initialParams };

    // Create the MonoSynth with our parameters
    // Note: We cast oscillator options since Tone's type system is overly strict for our use case
    this.synth = new Tone.MonoSynth({
      oscillator: {
        type: this.params.oscillator.type,
      } as Tone.OmniOscillatorOptions,
      filter: {
        type: toToneFilterType(this.params.filter.type),
        frequency: this.params.filter.cutoff,
        Q: this.params.filter.resonance,
      },
      filterEnvelope: {
        attack: this.params.filterEnvelope.attack,
        decay: this.params.filterEnvelope.decay,
        sustain: this.params.filterEnvelope.sustain,
        release: this.params.filterEnvelope.release,
        baseFrequency: this.params.filter.cutoff,
        octaves: this.params.filterEnvelope.amount,
      },
      envelope: {
        attack: this.params.amplitudeEnvelope.attack,
        decay: this.params.amplitudeEnvelope.decay,
        sustain: this.params.amplitudeEnvelope.sustain,
        release: this.params.amplitudeEnvelope.release,
      },
      volume: this.params.volume,
    });

    // Set up detune
    this.synth.detune.value = this.params.oscillator.detune;

    // Create LFO for filter modulation
    this.lfo = new Tone.LFO({
      frequency: this.params.lfo.rate,
      type: this.params.lfo.waveform,
      min: 0,
      max: 1,
    });

    // LFO gain controls the depth of modulation
    this.lfoGain = new Tone.Gain(this.params.lfo.depth * this.params.filter.cutoff);

    // Connect LFO -> gain -> filter frequency
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.synth.filter.frequency);

    // Start the LFO
    this.lfo.start();

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser node for spectrum visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: synth → effectsChain → analyser → destination
    this.synth.connect(this.effectsChain.input);
    this.effectsChain.connect(this.analyser);
    Tone.connect(this.analyser, Tone.getDestination());
  }

  /**
   * Configures the analyser node settings
   */
  configureAnalyser(config: Partial<AnalyserConfig>): void {
    const fullConfig = { ...DEFAULT_ANALYSER_CONFIG, ...config };
    this.analyser.fftSize = fullConfig.fftSize;
    this.analyser.smoothingTimeConstant = fullConfig.smoothingTimeConstant;
    this.analyser.minDecibels = fullConfig.minDecibels;
    this.analyser.maxDecibels = fullConfig.maxDecibels;
  }

  /**
   * Ensures the audio context is started (requires user gesture)
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
  }

  /**
   * Returns whether audio context has been started
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Gets the current synth parameters
   */
  getParams(): SynthParams {
    return { ...this.params };
  }

  /**
   * Gets the analyser node for visualization
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * Gets frequency data from the analyser for spectrum visualization
   */
  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Gets time domain data from the analyser for waveform visualization
   */
  getTimeDomainData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // ============================================
  // Oscillator Controls
  // ============================================

  setOscillatorType(type: OscillatorType): void {
    this.params.oscillator.type = type;
    this.synth.oscillator.type = type as Tone.ToneOscillatorType;
  }

  setOctave(octave: number): void {
    this.params.oscillator.octave = octave;
    // Octave is applied when triggering notes
  }

  setDetune(cents: number): void {
    this.params.oscillator.detune = cents;
    this.synth.detune.value = cents;
  }

  // ============================================
  // Filter Controls
  // ============================================

  setFilterType(type: FilterType): void {
    this.params.filter.type = type;
    this.synth.filter.type = toToneFilterType(type);
  }

  setFilterCutoff(frequency: number): void {
    this.params.filter.cutoff = frequency;
    this.synth.filter.frequency.value = frequency;
    // Also update the filter envelope's base frequency
    this.synth.filterEnvelope.baseFrequency = frequency;
    // Update LFO gain (depth is relative to cutoff)
    this.lfoGain.gain.value = this.params.lfo.depth * frequency;
  }

  setFilterResonance(q: number): void {
    this.params.filter.resonance = q;
    this.synth.filter.Q.value = q;
  }

  // ============================================
  // Amplitude Envelope Controls
  // ============================================

  setAmplitudeEnvelope(envelope: Partial<ADSREnvelope>): void {
    this.params.amplitudeEnvelope = { ...this.params.amplitudeEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.synth.envelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.synth.envelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.synth.envelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.synth.envelope.release = envelope.release;
    }
  }

  setAmplitudeAttack(time: number): void {
    this.setAmplitudeEnvelope({ attack: time });
  }

  setAmplitudeDecay(time: number): void {
    this.setAmplitudeEnvelope({ decay: time });
  }

  setAmplitudeSustain(level: number): void {
    this.setAmplitudeEnvelope({ sustain: level });
  }

  setAmplitudeRelease(time: number): void {
    this.setAmplitudeEnvelope({ release: time });
  }

  // ============================================
  // Filter Envelope Controls
  // ============================================

  setFilterEnvelope(envelope: Partial<FilterEnvelopeParams>): void {
    this.params.filterEnvelope = { ...this.params.filterEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.synth.filterEnvelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.synth.filterEnvelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.synth.filterEnvelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.synth.filterEnvelope.release = envelope.release;
    }
    if (envelope.amount !== undefined) {
      this.synth.filterEnvelope.octaves = envelope.amount;
    }
  }

  setFilterEnvelopeAttack(time: number): void {
    this.setFilterEnvelope({ attack: time });
  }

  setFilterEnvelopeDecay(time: number): void {
    this.setFilterEnvelope({ decay: time });
  }

  setFilterEnvelopeSustain(level: number): void {
    this.setFilterEnvelope({ sustain: level });
  }

  setFilterEnvelopeRelease(time: number): void {
    this.setFilterEnvelope({ release: time });
  }

  setFilterEnvelopeAmount(octaves: number): void {
    this.setFilterEnvelope({ amount: octaves });
  }

  // ============================================
  // LFO Controls
  // ============================================

  setLFO(lfoParams: Partial<LFOParams>): void {
    this.params.lfo = { ...this.params.lfo, ...lfoParams };

    if (lfoParams.rate !== undefined) {
      this.lfo.frequency.value = lfoParams.rate;
    }
    if (lfoParams.waveform !== undefined) {
      this.lfo.type = lfoParams.waveform;
    }
    if (lfoParams.depth !== undefined) {
      // Scale depth by cutoff frequency for audible modulation
      this.lfoGain.gain.value = lfoParams.depth * this.params.filter.cutoff;
    }
  }

  setLFORate(rate: number): void {
    this.setLFO({ rate });
  }

  setLFODepth(depth: number): void {
    this.setLFO({ depth });
  }

  setLFOWaveform(waveform: LFOWaveform): void {
    this.setLFO({ waveform });
  }

  // ============================================
  // Effects Controls
  // ============================================

  // Distortion
  setDistortion(distortionParams: Partial<DistortionParams>): void {
    this.params.effects.distortion = { ...this.params.effects.distortion, ...distortionParams };
    this.effectsChain.setDistortion(distortionParams);
  }

  setDistortionAmount(amount: number): void {
    this.setDistortion({ amount });
  }

  setDistortionMix(mix: number): void {
    this.setDistortion({ mix });
  }

  // Delay
  setDelay(delayParams: Partial<DelayParams>): void {
    this.params.effects.delay = { ...this.params.effects.delay, ...delayParams };
    this.effectsChain.setDelay(delayParams);
  }

  setDelayTime(time: number): void {
    this.setDelay({ time });
  }

  setDelayFeedback(feedback: number): void {
    this.setDelay({ feedback });
  }

  setDelayMix(mix: number): void {
    this.setDelay({ mix });
  }

  // Reverb
  setReverb(reverbParams: Partial<ReverbParams>): void {
    this.params.effects.reverb = { ...this.params.effects.reverb, ...reverbParams };
    this.effectsChain.setReverb(reverbParams);
  }

  setReverbDecay(decay: number): void {
    this.setReverb({ decay });
  }

  setReverbMix(mix: number): void {
    this.setReverb({ mix });
  }

  // Chorus
  setChorus(chorusParams: Partial<ChorusParams>): void {
    this.params.effects.chorus = { ...this.params.effects.chorus, ...chorusParams };
    this.effectsChain.setChorus(chorusParams);
  }

  setChorusRate(rate: number): void {
    this.setChorus({ rate });
  }

  setChorusDepth(depth: number): void {
    this.setChorus({ depth });
  }

  setChorusMix(mix: number): void {
    this.setChorus({ mix });
  }

  // ============================================
  // Volume Control
  // ============================================

  setVolume(db: number): void {
    this.params.volume = db;
    this.synth.volume.value = db;
  }

  // ============================================
  // Note Triggering
  // ============================================

  /**
   * Triggers a note with the current envelope settings
   * @param note - Note name (e.g., 'C4', 'A3') or frequency in Hz
   * @param duration - Optional duration (e.g., '8n', '4n', or seconds)
   */
  triggerAttack(note: string | number): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const adjustedFreq = applyOctaveOffset(frequency, this.params.oscillator.octave);
    this.synth.triggerAttack(adjustedFreq);
  }

  /**
   * Releases the current note
   */
  triggerRelease(): void {
    this.synth.triggerRelease();
  }

  /**
   * Triggers a note for a specific duration
   * @param note - Note name or frequency
   * @param duration - Duration in seconds or Tone.js time notation
   */
  triggerAttackRelease(note: string | number, duration: number | string = '8n'): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const adjustedFreq = applyOctaveOffset(frequency, this.params.oscillator.octave);
    this.synth.triggerAttackRelease(adjustedFreq, duration);
  }

  // ============================================
  // Bulk Updates
  // ============================================

  /**
   * Updates all synth parameters at once
   */
  setParams(params: Partial<SynthParams>): void {
    if (params.oscillator) {
      if (params.oscillator.type !== undefined) {
        this.setOscillatorType(params.oscillator.type);
      }
      if (params.oscillator.octave !== undefined) {
        this.setOctave(params.oscillator.octave);
      }
      if (params.oscillator.detune !== undefined) {
        this.setDetune(params.oscillator.detune);
      }
    }

    if (params.filter) {
      if (params.filter.type !== undefined) {
        this.setFilterType(params.filter.type);
      }
      if (params.filter.cutoff !== undefined) {
        this.setFilterCutoff(params.filter.cutoff);
      }
      if (params.filter.resonance !== undefined) {
        this.setFilterResonance(params.filter.resonance);
      }
    }

    if (params.filterEnvelope) {
      this.setFilterEnvelope(params.filterEnvelope);
    }

    if (params.amplitudeEnvelope) {
      this.setAmplitudeEnvelope(params.amplitudeEnvelope);
    }

    if (params.lfo) {
      this.setLFO(params.lfo);
    }

    if (params.effects) {
      if (params.effects.distortion) {
        this.setDistortion(params.effects.distortion);
      }
      if (params.effects.delay) {
        this.setDelay(params.effects.delay);
      }
      if (params.effects.reverb) {
        this.setReverb(params.effects.reverb);
      }
      if (params.effects.chorus) {
        this.setChorus(params.effects.chorus);
      }
    }

    if (params.volume !== undefined) {
      this.setVolume(params.volume);
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Disposes of the synth and releases resources
   */
  dispose(): void {
    this.lfo.stop();
    this.lfo.dispose();
    this.lfoGain.dispose();
    this.effectsChain.dispose();
    this.synth.dispose();
  }
}

/**
 * Creates a new synth engine instance
 */
export function createSynthEngine(params?: Partial<SynthParams>): SynthEngine {
  return new SynthEngine(params);
}
