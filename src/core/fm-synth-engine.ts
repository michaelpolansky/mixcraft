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
  NoiseType,
  NoiseParams,
  GlideParams,
  FMVelocityParams,
  ArpPattern,
  ArpDivision,
  ArpeggiatorParams,
  FMModRoute,
  FMModMatrix,
  FMModDestination,
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

  // Noise generator
  private noise: Tone.Noise;
  private noiseGain: Tone.Gain;
  private noiseFilter: Tone.Filter;

  // Panner for stereo positioning
  private panner: Tone.Panner;

  // Velocity tracking
  private currentVelocity = 1;
  private baseModulationIndex: number;

  // Arpeggiator state
  private arpSequence: Tone.Sequence<string> | null = null;
  private heldNotes: string[] = [];
  private arpNotes: string[] = [];

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

    // Create noise generator with filter for shaping
    this.noiseFilter = new Tone.Filter({
      frequency: 5000,
      type: 'lowpass',
    });
    this.noiseGain = new Tone.Gain(this.params.noise.level);
    this.noise = new Tone.Noise(this.params.noise.type);
    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);

    // Create panner for stereo positioning
    this.panner = new Tone.Panner(this.params.pan);

    // Set up glide/portamento
    this.synth.portamento = this.params.glide.enabled ? this.params.glide.time : 0;

    // Store base modulation index for velocity scaling
    this.baseModulationIndex = this.params.modulationIndex;

    // Wire: synth + noise -> effectsChain -> panner -> analyser -> destination
    this.synth.connect(this.effectsChain.input);
    this.noiseGain.connect(this.effectsChain.input);
    this.effectsChain.connect(this.panner);
    Tone.connect(this.panner, this.analyser);
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
      this.noise.start();
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
      noise: { ...this.params.noise },
      glide: { ...this.params.glide },
      velocity: { ...this.params.velocity },
      arpeggiator: { ...this.params.arpeggiator },
      modMatrix: {
        routes: this.params.modMatrix.routes.map(route => ({ ...route })) as [FMModRoute, FMModRoute, FMModRoute, FMModRoute],
      },
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
    this.baseModulationIndex = clamped;
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
  // Noise Controls
  // ============================================

  /**
   * Sets the noise generator type (white, pink, brown)
   */
  setNoiseType(type: NoiseType): void {
    this.params.noise.type = type;
    this.noise.type = type;
  }

  /**
   * Sets the noise level (0-1)
   */
  setNoiseLevel(level: number): void {
    this.params.noise.level = level;
    this.noiseGain.gain.value = level;
  }

  /**
   * Sets all noise parameters at once
   */
  setNoise(params: Partial<NoiseParams>): void {
    if (params.type !== undefined) this.setNoiseType(params.type);
    if (params.level !== undefined) this.setNoiseLevel(params.level);
  }

  // ============================================
  // Glide/Portamento Controls
  // ============================================

  /**
   * Enables or disables glide/portamento
   */
  setGlideEnabled(enabled: boolean): void {
    this.params.glide.enabled = enabled;
    this.synth.portamento = enabled ? this.params.glide.time : 0;
  }

  /**
   * Sets the glide time in seconds
   */
  setGlideTime(time: number): void {
    this.params.glide.time = time;
    if (this.params.glide.enabled) {
      this.synth.portamento = time;
    }
  }

  /**
   * Sets all glide parameters at once
   */
  setGlide(params: Partial<GlideParams>): void {
    if (params.enabled !== undefined) this.setGlideEnabled(params.enabled);
    if (params.time !== undefined) this.setGlideTime(params.time);
  }

  // ============================================
  // Pan Control
  // ============================================

  /**
   * Sets the pan position (-1 to +1, 0 = center)
   */
  setPan(pan: number): void {
    this.params.pan = pan;
    this.panner.pan.value = pan;
  }

  // ============================================
  // Velocity Controls
  // ============================================

  /**
   * Sets how much velocity affects amplitude (0 to 1)
   * At 0, all notes play at full volume regardless of velocity
   * At 1, soft notes (low velocity) are much quieter
   */
  setVelocityAmpAmount(amount: number): void {
    this.params.velocity.ampAmount = clamp(amount, 0, 1);
  }

  /**
   * Sets how much velocity affects modulation index (0 to 1)
   * At 0, modulation index is constant regardless of velocity
   * At 1, soft notes have less modulation (darker timbre)
   */
  setVelocityModIndexAmount(amount: number): void {
    this.params.velocity.modIndexAmount = clamp(amount, 0, 1);
  }

  /**
   * Sets all velocity parameters at once
   */
  setVelocity(params: Partial<FMVelocityParams>): void {
    if (params.ampAmount !== undefined) this.setVelocityAmpAmount(params.ampAmount);
    if (params.modIndexAmount !== undefined) this.setVelocityModIndexAmount(params.modIndexAmount);
  }

  // ============================================
  // Mod Matrix Controls
  // ============================================

  /**
   * Gets the current modulated values for real-time display
   * Returns the current values of all mod destinations
   */
  getModulatedValues(): Record<FMModDestination, number> {
    return {
      modulationIndex: this.synth.modulationIndex.value,
      harmonicity: this.synth.harmonicity.value,
      pitch: this.synth.detune.value,
      pan: this.panner.pan.value,
      amplitude: 1, // Base amplitude (actual amplitude depends on velocity)
    };
  }

  /**
   * Sets a single modulation route
   * @param index - Route index (0-3)
   * @param route - Partial route parameters to update
   */
  setModRoute(index: number, route: Partial<FMModRoute>): void {
    if (index < 0 || index > 3) return;

    const currentRoute = this.params.modMatrix.routes[index];
    // Spread current route with partial updates - type assertion needed since
    // TypeScript can't verify that spreading Partial onto a complete object
    // produces a complete object
    this.params.modMatrix.routes[index] = {
      ...currentRoute,
      ...route,
    } as FMModRoute;
  }

  /**
   * Sets the entire modulation matrix
   * @param params - Partial mod matrix parameters to update
   *
   * Note: The mod matrix provides additional flexibility beyond the existing
   * LFO destination system. The core modulation is handled by:
   * - LFO with destination selector (modulationIndex, harmonicity, pitch)
   * - Mod envelope affecting modulation index
   * - Velocity affecting amplitude and mod index
   *
   * The mod matrix allows for more complex routing combinations.
   */
  setModMatrix(params: Partial<FMModMatrix>): void {
    if (params.routes) {
      for (let i = 0; i < 4; i++) {
        const route = params.routes[i];
        if (route) {
          this.setModRoute(i, route);
        }
      }
    }
  }

  // ============================================
  // Arpeggiator
  // ============================================

  /**
   * Builds the note pattern array based on held notes and arp settings
   */
  private buildArpPattern(): string[] {
    if (this.heldNotes.length === 0) return [];

    // Sort notes by frequency (low to high)
    const notes = [...this.heldNotes].sort((a, b) => {
      return Tone.Frequency(a).toFrequency() - Tone.Frequency(b).toFrequency();
    });

    // Expand across octaves
    const expanded: string[] = [];
    for (let oct = 0; oct < this.params.arpeggiator.octaves; oct++) {
      for (const note of notes) {
        const freq = Tone.Frequency(note).toFrequency();
        const octaveFreq = freq * Math.pow(2, oct);
        expanded.push(Tone.Frequency(octaveFreq).toNote());
      }
    }

    // Apply pattern
    switch (this.params.arpeggiator.pattern) {
      case 'up':
        return expanded;
      case 'down':
        return expanded.reverse();
      case 'upDown':
        if (expanded.length <= 1) return expanded;
        const down = expanded.slice(1, -1).reverse();
        return [...expanded, ...down];
      case 'random':
        return expanded; // Shuffle happens in sequence callback
      default:
        return expanded;
    }
  }

  /**
   * Starts the arpeggiator sequence
   */
  private startArpeggiator(): void {
    this.stopArpeggiator();

    this.arpNotes = this.buildArpPattern();
    if (this.arpNotes.length === 0) return;

    const division = this.params.arpeggiator.division;
    const gate = this.params.arpeggiator.gate;
    const isRandom = this.params.arpeggiator.pattern === 'random';

    let index = 0;
    this.arpSequence = new Tone.Sequence(
      (time, _) => {
        let note: string;
        if (isRandom) {
          note = this.arpNotes[Math.floor(Math.random() * this.arpNotes.length)]!;
        } else {
          note = this.arpNotes[index % this.arpNotes.length]!;
          index++;
        }

        // Calculate gate duration
        const stepDuration = Tone.Time(division).toSeconds();
        const noteDuration = stepDuration * gate;

        // Trigger the note with velocity-aware method
        this.triggerAttack(note, 0.8);
        Tone.getTransport().scheduleOnce(() => {
          this.triggerRelease();
        }, time + noteDuration);
      },
      this.arpNotes,
      division
    );

    this.arpSequence.start(0);
    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }
  }

  /**
   * Stops the arpeggiator sequence
   */
  private stopArpeggiator(): void {
    if (this.arpSequence) {
      this.arpSequence.stop();
      this.arpSequence.dispose();
      this.arpSequence = null;
    }
    this.triggerRelease();
  }

  /**
   * Adds a note to the arpeggiator (called on note on)
   */
  arpAddNote(note: string): void {
    if (!this.params.arpeggiator.enabled) {
      this.triggerAttack(note);
      return;
    }
    if (!this.heldNotes.includes(note)) {
      this.heldNotes.push(note);
    }
    this.startArpeggiator();
  }

  /**
   * Removes a note from the arpeggiator (called on note off)
   */
  arpRemoveNote(note: string): void {
    if (!this.params.arpeggiator.enabled) {
      this.triggerRelease();
      return;
    }
    this.heldNotes = this.heldNotes.filter(n => n !== note);
    if (this.heldNotes.length === 0) {
      this.stopArpeggiator();
    } else {
      this.startArpeggiator(); // Rebuild with remaining notes
    }
  }

  /**
   * Sets the arpeggiator enabled state
   */
  setArpEnabled(enabled: boolean): void {
    this.params.arpeggiator.enabled = enabled;
    if (!enabled) {
      this.stopArpeggiator();
      this.heldNotes = [];
    }
  }

  /**
   * Sets the arpeggiator pattern
   */
  setArpPattern(pattern: ArpPattern): void {
    this.params.arpeggiator.pattern = pattern;
    if (this.params.arpeggiator.enabled && this.heldNotes.length > 0) {
      this.startArpeggiator();
    }
  }

  /**
   * Sets the arpeggiator division (tempo sync)
   */
  setArpDivision(division: ArpDivision): void {
    this.params.arpeggiator.division = division;
    if (this.params.arpeggiator.enabled && this.heldNotes.length > 0) {
      this.startArpeggiator();
    }
  }

  /**
   * Sets the arpeggiator octave range
   */
  setArpOctaves(octaves: 1 | 2 | 3 | 4): void {
    this.params.arpeggiator.octaves = octaves;
    if (this.params.arpeggiator.enabled && this.heldNotes.length > 0) {
      this.startArpeggiator();
    }
  }

  /**
   * Sets the arpeggiator gate (note length percentage)
   */
  setArpGate(gate: number): void {
    this.params.arpeggiator.gate = clamp(gate, 0.1, 1);
  }

  /**
   * Sets all arpeggiator parameters at once
   */
  setArpeggiator(params: Partial<ArpeggiatorParams>): void {
    if (params.enabled !== undefined) this.setArpEnabled(params.enabled);
    if (params.pattern !== undefined) this.setArpPattern(params.pattern);
    if (params.division !== undefined) this.setArpDivision(params.division);
    if (params.octaves !== undefined) this.setArpOctaves(params.octaves);
    if (params.gate !== undefined) this.setArpGate(params.gate);
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
   * @param velocity - Note velocity (0-1), affects amplitude and modulation index based on velocity settings
   */
  triggerAttack(note: string | number, velocity = 1): void {
    this.currentVelocity = velocity;

    // Apply velocity to amplitude
    const ampScale = 1 - this.params.velocity.ampAmount * (1 - velocity);

    // Apply velocity to modulation index
    const modIndexScale = 1 - this.params.velocity.modIndexAmount * (1 - velocity);
    const scaledModIndex = this.baseModulationIndex * modIndexScale;
    this.synth.modulationIndex.value = scaledModIndex;

    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    // Trigger with velocity-scaled amplitude
    this.synth.triggerAttack(frequency, Tone.now(), ampScale);
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
   * @param velocity - Note velocity (0-1), affects amplitude and modulation index based on velocity settings
   */
  triggerAttackRelease(note: string | number, duration: number | string = '8n', velocity = 1): void {
    this.currentVelocity = velocity;

    // Apply velocity to amplitude
    const ampScale = 1 - this.params.velocity.ampAmount * (1 - velocity);

    // Apply velocity to modulation index
    const modIndexScale = 1 - this.params.velocity.modIndexAmount * (1 - velocity);
    const scaledModIndex = this.baseModulationIndex * modIndexScale;
    this.synth.modulationIndex.value = scaledModIndex;

    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    this.synth.triggerAttackRelease(frequency, duration, Tone.now(), ampScale);
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
    if (params.noise) {
      this.setNoise(params.noise);
    }
    if (params.glide) {
      this.setGlide(params.glide);
    }
    if (params.pan !== undefined) {
      this.setPan(params.pan);
    }
    if (params.velocity) {
      this.setVelocity(params.velocity);
    }
    if (params.modMatrix) {
      this.setModMatrix(params.modMatrix);
    }
    if (params.arpeggiator) {
      this.setArpeggiator(params.arpeggiator);
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Disposes of the synth and releases resources
   */
  dispose(): void {
    // Stop arpeggiator first
    this.stopArpeggiator();
    this.heldNotes = [];

    this.lfo.stop();
    this.lfo.dispose();
    this.lfoGain.dispose();
    this.noise.stop();
    this.noise.dispose();
    this.noiseGain.dispose();
    this.noiseFilter.dispose();
    this.panner.dispose();
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
