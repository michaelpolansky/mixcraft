/**
 * MIXCRAFT FM Synth Engine
 * Wraps Tone.js FMSynth for FM synthesis with exposed parameters
 */

import * as Tone from 'tone';
import type {
  FMSynthParams,
  OscillatorType,
  ADSREnvelope,
  AnalyserConfig,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
  FMLFOParams,
  FMLFODestination,
  LFOWaveform,
} from './types.ts';
import {
  DEFAULT_FM_SYNTH_PARAMS,
  DEFAULT_ANALYSER_CONFIG,
  FM_PARAM_RANGES,
} from './types.ts';
import { EffectsChain } from './effects-chain.ts';

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * FMSynthEngine class - wraps Tone.FMSynth for FM synthesis
 *
 * FM synthesis creates complex timbres by using one oscillator (modulator)
 * to modulate the frequency of another (carrier). Key parameters:
 * - harmonicity: ratio between modulator and carrier frequencies
 * - modulationIndex: depth of frequency modulation
 *
 * Signal flow: synth -> effectsChain -> analyser -> destination
 */
export class FMSynthEngine {
  private synth: Tone.FMSynth;
  private analyser: AnalyserNode;
  private params: FMSynthParams;
  private isInitialized = false;

  // Effects chain
  private effectsChain: EffectsChain;

  // LFO for FM-specific modulation
  private lfo: Tone.LFO;
  private lfoGain: Tone.Gain;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lfoDestinationNode: Tone.Signal<any> | null = null;

  constructor(initialParams: Partial<FMSynthParams> = {}) {
    // Merge defaults with initial params
    this.params = {
      ...DEFAULT_FM_SYNTH_PARAMS,
      ...initialParams,
      amplitudeEnvelope: {
        ...DEFAULT_FM_SYNTH_PARAMS.amplitudeEnvelope,
        ...initialParams.amplitudeEnvelope,
      },
      effects: {
        ...DEFAULT_FM_SYNTH_PARAMS.effects,
        distortion: {
          ...DEFAULT_FM_SYNTH_PARAMS.effects.distortion,
          ...initialParams.effects?.distortion,
        },
        delay: {
          ...DEFAULT_FM_SYNTH_PARAMS.effects.delay,
          ...initialParams.effects?.delay,
        },
        reverb: {
          ...DEFAULT_FM_SYNTH_PARAMS.effects.reverb,
          ...initialParams.effects?.reverb,
        },
        chorus: {
          ...DEFAULT_FM_SYNTH_PARAMS.effects.chorus,
          ...initialParams.effects?.chorus,
        },
      },
    };

    // Clamp FM-specific parameters
    this.params.harmonicity = clamp(
      this.params.harmonicity,
      FM_PARAM_RANGES.harmonicity.min,
      FM_PARAM_RANGES.harmonicity.max
    );
    this.params.modulationIndex = clamp(
      this.params.modulationIndex,
      FM_PARAM_RANGES.modulationIndex.min,
      FM_PARAM_RANGES.modulationIndex.max
    );
    this.params.modulationEnvelopeAmount = clamp(
      this.params.modulationEnvelopeAmount,
      FM_PARAM_RANGES.modulationEnvelopeAmount.min,
      FM_PARAM_RANGES.modulationEnvelopeAmount.max
    );

    // Create the FMSynth with our parameters
    this.synth = new Tone.FMSynth({
      harmonicity: this.params.harmonicity,
      modulationIndex: this.params.modulationIndex,
      oscillator: {
        type: this.params.carrierType,
      },
      modulation: {
        type: this.params.modulatorType,
      },
      envelope: {
        attack: this.params.amplitudeEnvelope.attack,
        decay: this.params.amplitudeEnvelope.decay,
        sustain: this.params.amplitudeEnvelope.sustain,
        release: this.params.amplitudeEnvelope.release,
      },
      modulationEnvelope: {
        attack: this.params.amplitudeEnvelope.attack,
        decay: this.params.amplitudeEnvelope.decay,
        sustain: this.params.modulationEnvelopeAmount,
        release: this.params.amplitudeEnvelope.release,
      },
      volume: this.params.volume,
    });

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser node for spectrum visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Create LFO for FM-specific modulation
    this.lfo = new Tone.LFO({
      frequency: this.params.lfo.rate,
      min: -1,
      max: 1,
      type: this.params.lfo.waveform as Tone.ToneOscillatorType,
    });
    this.lfoGain = new Tone.Gain(this.params.lfo.depth);
    this.lfo.connect(this.lfoGain);

    // Connect LFO to initial destination
    this.connectLFOToDestination(this.params.lfo.destination);

    // Wire: synth -> effectsChain -> analyser -> destination
    this.synth.connect(this.effectsChain.input);
    this.effectsChain.connect(this.analyser);
    Tone.connect(this.analyser, Tone.getDestination());
  }

  /**
   * Connects LFO to the specified destination parameter
   */
  private connectLFOToDestination(destination: FMLFODestination): void {
    // Disconnect from previous destination
    if (this.lfoDestinationNode) {
      this.lfoGain.disconnect(this.lfoDestinationNode);
    }

    // Connect to new destination
    switch (destination) {
      case 'modulationIndex':
        this.lfoDestinationNode = this.synth.modulationIndex;
        break;
      case 'harmonicity':
        this.lfoDestinationNode = this.synth.harmonicity;
        break;
      case 'pitch':
        this.lfoDestinationNode = this.synth.detune;
        break;
    }

    if (this.lfoDestinationNode) {
      this.lfoGain.connect(this.lfoDestinationNode);
    }
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
      this.lfo.start();
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
  getParams(): FMSynthParams {
    return {
      ...this.params,
      amplitudeEnvelope: { ...this.params.amplitudeEnvelope },
      effects: {
        distortion: { ...this.params.effects.distortion },
        delay: { ...this.params.effects.delay },
        reverb: { ...this.params.effects.reverb },
        chorus: { ...this.params.effects.chorus },
      },
      lfo: { ...this.params.lfo },
    };
  }

  /**
   * Gets the analyser node for visualization
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * Gets the output node for recording
   * Returns the analyser node which sits at the end of the signal chain
   */
  getOutputNode(): AudioNode {
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
  // FM-Specific Controls
  // ============================================

  /**
   * Sets the harmonicity (ratio between modulator and carrier frequency)
   * Higher values = more harmonically related sidebands
   * Clamped to 0.5-12
   */
  setHarmonicity(ratio: number): void {
    const clamped = clamp(
      ratio,
      FM_PARAM_RANGES.harmonicity.min,
      FM_PARAM_RANGES.harmonicity.max
    );
    this.params.harmonicity = clamped;
    this.synth.harmonicity.value = clamped;
  }

  /**
   * Sets the modulation index (depth of FM)
   * Higher values = more sidebands, brighter/harsher timbre
   * Clamped to 0-10
   */
  setModulationIndex(index: number): void {
    const clamped = clamp(
      index,
      FM_PARAM_RANGES.modulationIndex.min,
      FM_PARAM_RANGES.modulationIndex.max
    );
    this.params.modulationIndex = clamped;
    this.synth.modulationIndex.value = clamped;
  }

  /**
   * Sets the carrier oscillator waveform
   */
  setCarrierType(type: OscillatorType): void {
    this.params.carrierType = type;
    this.synth.oscillator.type = type as Tone.ToneOscillatorType;
  }

  /**
   * Sets the modulator oscillator waveform
   */
  setModulatorType(type: OscillatorType): void {
    this.params.modulatorType = type;
    this.synth.modulation.type = type as Tone.ToneOscillatorType;
  }

  // ============================================
  // Amplitude Envelope Controls
  // ============================================

  /**
   * Sets the amplitude envelope (ADSR)
   */
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

  /**
   * Sets how much the modulation envelope affects modulation index
   * The modulation envelope's sustain controls this (0 = no modulation change, 1 = full)
   * Clamped to 0-1
   */
  setModulationEnvelopeAmount(amount: number): void {
    const clamped = clamp(
      amount,
      FM_PARAM_RANGES.modulationEnvelopeAmount.min,
      FM_PARAM_RANGES.modulationEnvelopeAmount.max
    );
    this.params.modulationEnvelopeAmount = clamped;
    this.synth.modulationEnvelope.sustain = clamped;
  }

  // ============================================
  // Volume Control
  // ============================================

  /**
   * Sets the master volume in dB
   */
  setVolume(db: number): void {
    this.params.volume = db;
    this.synth.volume.value = db;
  }

  // ============================================
  // LFO Controls
  // ============================================

  /**
   * Sets the LFO rate in Hz
   */
  setLFORate(rate: number): void {
    this.params.lfo.rate = rate;
    this.lfo.frequency.value = rate;
  }

  /**
   * Sets the LFO depth/amount (0-1)
   */
  setLFODepth(depth: number): void {
    this.params.lfo.depth = depth;
    this.lfoGain.gain.value = depth;
  }

  /**
   * Sets the LFO waveform shape
   */
  setLFOWaveform(waveform: LFOWaveform): void {
    this.params.lfo.waveform = waveform;
    this.lfo.type = waveform as Tone.ToneOscillatorType;
  }

  /**
   * Sets the LFO modulation destination
   */
  setLFODestination(destination: FMLFODestination): void {
    this.params.lfo.destination = destination;
    this.connectLFOToDestination(destination);
  }

  /**
   * Sets all LFO parameters at once
   */
  setLFO(params: Partial<FMLFOParams>): void {
    if (params.rate !== undefined) this.setLFORate(params.rate);
    if (params.depth !== undefined) this.setLFODepth(params.depth);
    if (params.waveform !== undefined) this.setLFOWaveform(params.waveform);
    if (params.destination !== undefined) this.setLFODestination(params.destination);
  }

  // ============================================
  // Effects Controls (delegated to EffectsChain)
  // ============================================

  setDistortion(params: Partial<DistortionParams>): void {
    this.params.effects.distortion = { ...this.params.effects.distortion, ...params };
    this.effectsChain.setDistortion(params);
  }

  setDelay(params: Partial<DelayParams>): void {
    this.params.effects.delay = { ...this.params.effects.delay, ...params };
    this.effectsChain.setDelay(params);
  }

  setReverb(params: Partial<ReverbParams>): void {
    this.params.effects.reverb = { ...this.params.effects.reverb, ...params };
    this.effectsChain.setReverb(params);
  }

  setChorus(params: Partial<ChorusParams>): void {
    this.params.effects.chorus = { ...this.params.effects.chorus, ...params };
    this.effectsChain.setChorus(params);
  }

  // ============================================
  // Note Triggering
  // ============================================

  /**
   * Triggers a note with the current envelope settings
   * @param note - Note name (e.g., 'C4', 'A3') or frequency in Hz
   */
  triggerAttack(note: string | number): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();
    this.synth.triggerAttack(frequency);
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
    this.synth.triggerAttackRelease(frequency, duration);
  }

  // ============================================
  // Bulk Updates
  // ============================================

  /**
   * Updates multiple synth parameters at once
   */
  setParams(params: Partial<FMSynthParams>): void {
    if (params.harmonicity !== undefined) {
      this.setHarmonicity(params.harmonicity);
    }
    if (params.modulationIndex !== undefined) {
      this.setModulationIndex(params.modulationIndex);
    }
    if (params.carrierType !== undefined) {
      this.setCarrierType(params.carrierType);
    }
    if (params.modulatorType !== undefined) {
      this.setModulatorType(params.modulatorType);
    }
    if (params.amplitudeEnvelope) {
      this.setAmplitudeEnvelope(params.amplitudeEnvelope);
    }
    if (params.modulationEnvelopeAmount !== undefined) {
      this.setModulationEnvelopeAmount(params.modulationEnvelopeAmount);
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
    if (params.lfo) {
      this.setLFO(params.lfo);
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
 * Creates a new FM synth engine instance
 */
export function createFMSynthEngine(params?: Partial<FMSynthParams>): FMSynthEngine {
  return new FMSynthEngine(params);
}
