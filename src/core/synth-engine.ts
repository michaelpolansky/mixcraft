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
  PitchEnvelopeParams,
  ModEnvelopeParams,
  PWMEnvelopeParams,
  LFOParams,
  LFO2Params,
  LFOWaveform,
  LFOSyncDivision,
  NoiseParams,
  NoiseType,
  GlideParams,
  VelocityParams,
  AnalyserConfig,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
  SubOscillatorParams,
  Oscillator2Params,
  ModMatrixParams,
  ModRoute,
  ModSource,
  ModDestination,
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

  // Additional envelopes
  private pitchEnvelope: Tone.Envelope;
  private pitchEnvelopeScale: Tone.Multiply;
  private modEnvelope: Tone.Envelope;
  private modEnvelopeScale: Tone.Multiply;
  private baseLfoDepth: number;

  // Noise generator
  private noise: Tone.Noise;
  private noiseGain: Tone.Gain;
  private noiseFilter: Tone.Filter;

  // Sub oscillator (simple sine/square one octave below)
  private subOsc: Tone.Oscillator;
  private subOscGain: Tone.Gain;
  private subOscEnvelope: Tone.AmplitudeEnvelope;

  // Oscillator 1 gain (amplitude control)
  private osc1Gain: Tone.Gain;

  // Oscillator 2 (full second oscillator)
  private osc2: Tone.Oscillator;
  private osc2Gain: Tone.Gain;
  private osc2Envelope: Tone.AmplitudeEnvelope;
  private osc2Filter: Tone.Filter;

  // For tracking current frequency (used with glide)
  private currentFrequency: number = 440;

  // LFO2 - secondary LFO for modulation matrix
  private lfo2: Tone.LFO;
  private lfo2Gain: Tone.Gain;

  // Panner for stereo positioning
  private panner: Tone.Panner;

  // Output gain for amplitude modulation destination
  private outputGain: Tone.Gain;

  // Mod Matrix route nodes - tracks active modulation connections
  private modRouteNodes: Map<number, {
    multiply: Tone.Multiply;
    gain: Tone.Gain;
  }> = new Map();

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

    // Store base LFO depth for mod envelope calculations
    this.baseLfoDepth = this.params.lfo.depth;

    // Create Pitch Envelope
    // Converts semitones to cents (1 semitone = 100 cents) and modulates detune
    this.pitchEnvelope = new Tone.Envelope({
      attack: this.params.pitchEnvelope.attack,
      decay: this.params.pitchEnvelope.decay,
      sustain: this.params.pitchEnvelope.sustain,
      release: this.params.pitchEnvelope.release,
    });
    // Scale envelope output (0-1) to cents range
    const pitchCents = this.params.pitchEnvelope.amount * 100;
    this.pitchEnvelopeScale = new Tone.Multiply(pitchCents);
    this.pitchEnvelope.connect(this.pitchEnvelopeScale);
    this.pitchEnvelopeScale.connect(this.synth.detune);

    // Create Mod Envelope (modulates LFO depth)
    // This envelope scales the LFO gain dynamically during note playback
    this.modEnvelope = new Tone.Envelope({
      attack: this.params.modEnvelope.attack,
      decay: this.params.modEnvelope.decay,
      sustain: this.params.modEnvelope.sustain,
      release: this.params.modEnvelope.release,
    });
    // Scale envelope output to modulate the LFO gain
    this.modEnvelopeScale = new Tone.Multiply(this.params.modEnvelope.amount * this.params.filter.cutoff);
    this.modEnvelope.connect(this.modEnvelopeScale);
    this.modEnvelopeScale.connect(this.lfoGain.gain);

    // Create noise generator
    this.noise = new Tone.Noise(this.params.noise.type);
    this.noiseGain = new Tone.Gain(this.params.noise.level);
    // Noise goes through filter too
    this.noiseFilter = new Tone.Filter({
      type: toToneFilterType(this.params.filter.type),
      frequency: this.params.filter.cutoff,
      Q: this.params.filter.resonance,
    });
    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    // Noise starts immediately (level controls if it's heard)
    this.noise.start();

    // Create sub oscillator
    this.subOsc = new Tone.Oscillator({
      type: this.params.subOsc.type,
      frequency: 440, // Will be set on note trigger
    });
    this.subOscGain = new Tone.Gain(this.params.subOsc.enabled ? this.params.subOsc.level : 0);
    this.subOscEnvelope = new Tone.AmplitudeEnvelope({
      attack: this.params.amplitudeEnvelope.attack,
      decay: this.params.amplitudeEnvelope.decay,
      sustain: this.params.amplitudeEnvelope.sustain,
      release: this.params.amplitudeEnvelope.release,
    });
    // Sub osc -> envelope -> gain
    this.subOsc.connect(this.subOscEnvelope);
    this.subOscEnvelope.connect(this.subOscGain);
    this.subOsc.start();

    // Create oscillator 2
    this.osc2 = new Tone.Oscillator({
      type: this.params.oscillator2.type,
      frequency: 440, // Will be set on note trigger
      detune: this.params.oscillator2.detune,
    });
    // OSC2 has its own filter that tracks main filter settings
    this.osc2Filter = new Tone.Filter({
      type: toToneFilterType(this.params.filter.type),
      frequency: this.params.filter.cutoff,
      Q: this.params.filter.resonance,
    });
    this.osc2Gain = new Tone.Gain(this.params.oscillator2.enabled ? this.params.oscillator2.level : 0);
    this.osc2Envelope = new Tone.AmplitudeEnvelope({
      attack: this.params.amplitudeEnvelope.attack,
      decay: this.params.amplitudeEnvelope.decay,
      sustain: this.params.amplitudeEnvelope.sustain,
      release: this.params.amplitudeEnvelope.release,
    });
    // OSC2 -> filter -> envelope -> gain
    this.osc2.connect(this.osc2Filter);
    this.osc2Filter.connect(this.osc2Envelope);
    this.osc2Envelope.connect(this.osc2Gain);
    this.osc2.start();

    // Set up portamento/glide if enabled
    if (this.params.glide.enabled) {
      this.synth.portamento = this.params.glide.time;
    }

    // Create LFO2 - secondary LFO for modulation matrix
    // LFO2 is similar to LFO1 but will be routed through the mod matrix
    this.lfo2 = new Tone.LFO({
      frequency: this.params.lfo2.rate,
      type: this.params.lfo2.type,
      min: 0,
      max: 1,
    });
    this.lfo2Gain = new Tone.Gain(this.params.lfo2.enabled ? this.params.lfo2.depth : 0);
    this.lfo2.connect(this.lfo2Gain);
    // Start LFO2 (mod matrix will control where it routes)
    this.lfo2.start();

    // Create panner for stereo positioning
    this.panner = new Tone.Panner(this.params.pan);

    // Create output gain for amplitude modulation destination
    this.outputGain = new Tone.Gain(1);

    // Create OSC1 gain for amplitude control
    this.osc1Gain = new Tone.Gain(this.params.oscillator.level);

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser node for spectrum visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: synth → osc1Gain → effectsChain → panner → outputGain → analyser → destination
    // Also wire noise, sub osc, and osc2
    this.synth.connect(this.osc1Gain);
    this.osc1Gain.connect(this.effectsChain.input);
    this.noiseGain.connect(this.effectsChain.input);
    this.subOscGain.connect(this.effectsChain.input);
    this.osc2Gain.connect(this.effectsChain.input);
    this.effectsChain.connect(this.panner);
    this.panner.connect(this.outputGain);
    this.outputGain.connect(this.analyser);
    Tone.connect(this.analyser, Tone.getDestination());

    // Initialize mod matrix routes
    this.initModMatrix();
  }

  /**
   * Initializes mod matrix routes from params
   */
  private initModMatrix(): void {
    this.params.modMatrix.routes.forEach((route, index) => {
      if (route.enabled && route.amount !== 0) {
        this.updateModRoute(index, route);
      }
    });
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

  /**
   * Calculates the current LFO value based on time and waveform.
   * Returns a value between 0 and 1.
   */
  private getLfoValue(rate: number, waveform: LFOWaveform, time: number): number {
    const phase = (time * rate) % 1; // Phase 0 to 1

    switch (waveform) {
      case 'sine':
        return Math.sin(phase * 2 * Math.PI) * 0.5 + 0.5;
      case 'triangle':
        return phase < 0.5 ? phase * 2 : 2 - phase * 2;
      case 'sawtooth':
        return phase;
      case 'square':
        return phase < 0.5 ? 1 : 0;
      default:
        return 0.5;
    }
  }

  /**
   * Gets the current real-time modulated values for all modulation destinations.
   * Calculates actual modulation from LFOs and mod matrix routes.
   * Use this for real-time UI display of oscillating/modulated parameter values.
   */
  getModulatedValues(): Record<ModDestination, number> {
    // Calculate LFO values from time and frequency
    // LFO outputs 0 to 1, convert to bipolar (-0.5 to +0.5) for modulation
    const now = Tone.now();
    const lfo1Phase = this.getLfoValue(this.params.lfo.rate, this.params.lfo.waveform, now);
    const lfo1Value = lfo1Phase - 0.5;
    const lfo2Value = this.params.lfo2.enabled
      ? this.getLfoValue(this.params.lfo2.rate, this.params.lfo2.type, now) - 0.5
      : 0;

    // Base values from params
    const baseValues: Record<ModDestination, number> = {
      pitch: this.params.oscillator.detune,
      pan: this.params.pan,
      amplitude: 1, // Normalized amplitude
      filterCutoff: this.params.filter.cutoff,
      osc2Mix: this.params.oscillator2.enabled ? this.params.oscillator2.level : 0,
      lfo1Rate: this.params.lfo.rate,
      lfo2Rate: this.params.lfo2.rate,
    };

    // Destination scales (how much modulation affects each destination)
    const scales: Record<ModDestination, number> = {
      pitch: 1200,        // ±1 octave in cents
      pan: 1,             // Full range
      amplitude: 0.5,     // ±50%
      filterCutoff: 4000, // ±4kHz
      osc2Mix: 0.5,       // ±50%
      lfo1Rate: 10,       // ±10 Hz
      lfo2Rate: 10,       // ±10 Hz
    };

    // Calculate modulation from mod matrix routes
    const modulation: Record<ModDestination, number> = {
      pitch: 0,
      pan: 0,
      amplitude: 0,
      filterCutoff: 0,
      osc2Mix: 0,
      lfo1Rate: 0,
      lfo2Rate: 0,
    };

    // Sum modulation from all enabled routes
    for (const route of this.params.modMatrix.routes) {
      if (!route.enabled || route.amount === 0) continue;

      // Get source value (bipolar -0.5 to +0.5)
      let sourceValue = 0;
      switch (route.source) {
        case 'lfo1':
          sourceValue = lfo1Value;
          break;
        case 'lfo2':
          sourceValue = lfo2Value;
          break;
        // Envelopes would need current envelope value - skip for now
        case 'ampEnv':
        case 'filterEnv':
          continue;
      }

      // Calculate contribution: sourceValue * amount * scale
      const contribution = sourceValue * route.amount * scales[route.destination];
      modulation[route.destination] += contribution;
    }

    // Also add the direct LFO-to-filter modulation (the legacy connection)
    // LFO depth controls how much the filter cutoff is modulated
    const directLfoToFilter = lfo1Value * this.params.lfo.depth * this.params.filter.cutoff;
    modulation.filterCutoff += directLfoToFilter;

    // Return base + modulation for each destination
    return {
      pitch: baseValues.pitch + modulation.pitch,
      pan: Math.max(-1, Math.min(1, baseValues.pan + modulation.pan)),
      amplitude: Math.max(0, Math.min(1, baseValues.amplitude + modulation.amplitude)),
      filterCutoff: Math.max(20, Math.min(20000, baseValues.filterCutoff + modulation.filterCutoff)),
      osc2Mix: Math.max(0, Math.min(1, baseValues.osc2Mix + modulation.osc2Mix)),
      lfo1Rate: Math.max(0.1, Math.min(20, baseValues.lfo1Rate + modulation.lfo1Rate)),
      lfo2Rate: Math.max(0.1, Math.min(20, baseValues.lfo2Rate + modulation.lfo2Rate)),
    };
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

  setPulseWidth(width: number): void {
    this.params.oscillator.pulseWidth = Math.max(0.1, Math.min(0.9, width));
    // Pulse width only applies to square/pulse waves
    // Note: Standard Tone.js MonoSynth doesn't support PWM directly
    // This stores the value for UI display; PWM envelope modulation is handled separately
  }

  setOsc1Level(level: number): void {
    this.params.oscillator.level = level;
    this.osc1Gain.gain.value = level;
  }

  // ============================================
  // Noise Controls
  // ============================================

  setNoise(noiseParams: Partial<NoiseParams>): void {
    this.params.noise = { ...this.params.noise, ...noiseParams };

    if (noiseParams.type !== undefined) {
      this.noise.type = noiseParams.type;
    }
    if (noiseParams.level !== undefined) {
      this.noiseGain.gain.value = noiseParams.level;
    }
  }

  setNoiseType(type: NoiseType): void {
    this.setNoise({ type });
  }

  setNoiseLevel(level: number): void {
    this.setNoise({ level });
  }

  // ============================================
  // Glide/Portamento Controls
  // ============================================

  setGlide(glideParams: Partial<GlideParams>): void {
    this.params.glide = { ...this.params.glide, ...glideParams };

    if (glideParams.enabled !== undefined) {
      this.synth.portamento = glideParams.enabled ? this.params.glide.time : 0;
    }
    if (glideParams.time !== undefined && this.params.glide.enabled) {
      this.synth.portamento = glideParams.time;
    }
  }

  setGlideEnabled(enabled: boolean): void {
    this.setGlide({ enabled });
  }

  setGlideTime(time: number): void {
    this.setGlide({ time });
  }

  // ============================================
  // Sub Oscillator Controls
  // ============================================

  setSubOsc(subOscParams: Partial<SubOscillatorParams>): void {
    this.params.subOsc = { ...this.params.subOsc, ...subOscParams };

    if (subOscParams.enabled !== undefined) {
      this.subOscGain.gain.value = subOscParams.enabled ? this.params.subOsc.level : 0;
    }
    if (subOscParams.type !== undefined) {
      this.subOsc.type = subOscParams.type;
    }
    if (subOscParams.level !== undefined && this.params.subOsc.enabled) {
      this.subOscGain.gain.value = subOscParams.level;
    }
    // Octave is applied when triggering notes
  }

  setSubOscEnabled(enabled: boolean): void {
    this.setSubOsc({ enabled });
  }

  setSubOscType(type: 'sine' | 'square'): void {
    this.setSubOsc({ type });
  }

  setSubOscOctave(octave: -1 | -2): void {
    this.setSubOsc({ octave });
  }

  setSubOscLevel(level: number): void {
    this.setSubOsc({ level });
  }

  // ============================================
  // Oscillator 2 Controls
  // ============================================

  setOsc2(osc2Params: Partial<Oscillator2Params>): void {
    this.params.oscillator2 = { ...this.params.oscillator2, ...osc2Params };

    if (osc2Params.enabled !== undefined) {
      this.osc2Gain.gain.value = osc2Params.enabled ? this.params.oscillator2.level : 0;
    }
    if (osc2Params.type !== undefined) {
      this.osc2.type = osc2Params.type;
    }
    if (osc2Params.detune !== undefined) {
      this.osc2.detune.value = osc2Params.detune;
    }
    if (osc2Params.level !== undefined && this.params.oscillator2.enabled) {
      this.osc2Gain.gain.value = osc2Params.level;
    }
    // Octave and pulseWidth are applied when triggering notes
  }

  setOsc2Enabled(enabled: boolean): void {
    this.setOsc2({ enabled });
  }

  setOsc2Type(type: OscillatorType): void {
    this.setOsc2({ type });
  }

  setOsc2Octave(octave: number): void {
    this.setOsc2({ octave });
  }

  setOsc2Detune(cents: number): void {
    this.setOsc2({ detune: cents });
  }

  setOsc2PulseWidth(width: number): void {
    this.setOsc2({ pulseWidth: Math.max(0.1, Math.min(0.9, width)) });
  }

  setOsc2Level(level: number): void {
    this.setOsc2({ level });
  }

  // ============================================
  // Filter Controls
  // ============================================

  setFilterType(type: FilterType): void {
    this.params.filter.type = type;
    this.synth.filter.type = toToneFilterType(type);
    this.noiseFilter.type = toToneFilterType(type);
    this.osc2Filter.type = toToneFilterType(type);
  }

  setFilterCutoff(frequency: number): void {
    this.params.filter.cutoff = frequency;
    this.synth.filter.frequency.value = frequency;
    this.noiseFilter.frequency.value = frequency;
    this.osc2Filter.frequency.value = frequency;
    // Also update the filter envelope's base frequency
    this.synth.filterEnvelope.baseFrequency = frequency;
    // Update LFO gain (depth is relative to cutoff)
    this.lfoGain.gain.value = this.params.lfo.depth * frequency;
  }

  setFilterResonance(q: number): void {
    this.params.filter.resonance = q;
    this.synth.filter.Q.value = q;
    this.noiseFilter.Q.value = q;
    this.osc2Filter.Q.value = q;
  }

  setFilterKeyTracking(amount: number): void {
    this.params.filter.keyTracking = Math.max(0, Math.min(1, amount));
    // Key tracking is applied when triggering notes - see triggerAttack
  }

  // ============================================
  // Velocity Controls
  // ============================================

  setVelocityAmpAmount(amount: number): void {
    this.params.velocity.ampAmount = Math.max(0, Math.min(1, amount));
  }

  setVelocityFilterAmount(amount: number): void {
    this.params.velocity.filterAmount = Math.max(0, Math.min(1, amount));
  }

  // ============================================
  // Amplitude Envelope Controls
  // ============================================

  setAmplitudeEnvelope(envelope: Partial<ADSREnvelope>): void {
    this.params.amplitudeEnvelope = { ...this.params.amplitudeEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.synth.envelope.attack = envelope.attack;
      this.subOscEnvelope.attack = envelope.attack;
      this.osc2Envelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.synth.envelope.decay = envelope.decay;
      this.subOscEnvelope.decay = envelope.decay;
      this.osc2Envelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.synth.envelope.sustain = envelope.sustain;
      this.subOscEnvelope.sustain = envelope.sustain;
      this.osc2Envelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.synth.envelope.release = envelope.release;
      this.subOscEnvelope.release = envelope.release;
      this.osc2Envelope.release = envelope.release;
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

    if (lfoParams.rate !== undefined && !this.params.lfo.sync) {
      this.lfo.frequency.value = lfoParams.rate;
    }
    if (lfoParams.waveform !== undefined) {
      this.lfo.type = lfoParams.waveform;
    }
    if (lfoParams.depth !== undefined) {
      // Scale depth by cutoff frequency for audible modulation
      this.lfoGain.gain.value = lfoParams.depth * this.params.filter.cutoff;
    }
    if (lfoParams.sync !== undefined) {
      if (lfoParams.sync) {
        // Sync to tempo - use syncDivision
        this.lfo.frequency.value = this.params.lfo.syncDivision;
      } else {
        // Use free rate
        this.lfo.frequency.value = this.params.lfo.rate;
      }
    }
    if (lfoParams.syncDivision !== undefined && this.params.lfo.sync) {
      this.lfo.frequency.value = lfoParams.syncDivision;
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

  setLFOSync(sync: boolean): void {
    this.setLFO({ sync });
  }

  setLFOSyncDivision(syncDivision: LFOSyncDivision): void {
    this.setLFO({ syncDivision });
  }

  // ============================================
  // LFO2 Controls
  // ============================================

  setLFO2(lfo2Params: Partial<LFO2Params>): void {
    this.params.lfo2 = { ...this.params.lfo2, ...lfo2Params };

    if (lfo2Params.rate !== undefined) {
      this.lfo2.frequency.value = lfo2Params.rate;
    }
    if (lfo2Params.type !== undefined) {
      this.lfo2.type = lfo2Params.type;
    }
    if (lfo2Params.depth !== undefined) {
      this.lfo2Gain.gain.value = this.params.lfo2.enabled ? lfo2Params.depth : 0;
    }
    if (lfo2Params.enabled !== undefined) {
      this.lfo2Gain.gain.value = lfo2Params.enabled ? this.params.lfo2.depth : 0;
    }
  }

  setLFO2Rate(rate: number): void {
    this.setLFO2({ rate });
  }

  setLFO2Depth(depth: number): void {
    this.setLFO2({ depth });
  }

  setLFO2Type(type: LFOWaveform): void {
    this.setLFO2({ type });
  }

  setLFO2Enabled(enabled: boolean): void {
    this.setLFO2({ enabled });
  }

  // ============================================
  // Pan Control
  // ============================================

  setPan(pan: number): void {
    this.params.pan = Math.max(-1, Math.min(1, pan));
    this.panner.pan.value = this.params.pan;
  }

  // ============================================
  // Mod Matrix Controls
  // ============================================

  /**
   * Updates the entire mod matrix
   */
  setModMatrix(modMatrix: Partial<ModMatrixParams>): void {
    if (modMatrix.routes) {
      modMatrix.routes.forEach((route, index) => {
        this.setModRoute(index, route);
      });
    }
  }

  /**
   * Updates a single mod route by index
   */
  setModRoute(index: number, route: ModRoute): void {
    // Validate index
    if (index < 0 || index >= 4) return;

    // Update params
    this.params.modMatrix.routes[index] = { ...route };

    // Update the actual routing
    this.updateModRoute(index, route);
  }

  /**
   * Updates or creates a modulation route connection
   * Route: Source → Multiply(amount) → ScaledGain → Destination.parameter
   */
  private updateModRoute(index: number, route: ModRoute): void {
    // Disconnect existing route if any
    this.disconnectModRoute(index);

    // Don't create route if disabled or amount is 0
    if (!route.enabled || route.amount === 0) return;

    // Get source signal
    const source = this.getModSource(route.source);
    if (!source) return;

    // Get destination parameter
    const destParam = this.getDestinationParam(route.destination);
    if (!destParam) return;

    // Create multiply node for bipolar amount (-1 to +1)
    const multiply = new Tone.Multiply(route.amount);

    // Create scaled gain for destination range
    const scale = this.getDestinationScale(route.destination);
    const gain = new Tone.Gain(scale);

    // Connect: source → multiply → gain → destination
    source.connect(multiply);
    multiply.connect(gain);
    gain.connect(destParam);

    // Store nodes for cleanup
    this.modRouteNodes.set(index, { multiply, gain });
  }

  /**
   * Disconnects and disposes a mod route
   */
  private disconnectModRoute(index: number): void {
    const nodes = this.modRouteNodes.get(index);
    if (nodes) {
      nodes.multiply.dispose();
      nodes.gain.dispose();
      this.modRouteNodes.delete(index);
    }
  }

  /**
   * Gets the modulation source signal
   */
  private getModSource(source: ModSource): Tone.LFO | Tone.Envelope | null {
    switch (source) {
      case 'lfo1':
        return this.lfo;
      case 'lfo2':
        return this.lfo2;
      case 'ampEnv':
        // Use our modEnvelope as a proxy for amplitude envelope shape
        // The actual synth.envelope is internal to MonoSynth
        return this.modEnvelope;
      case 'filterEnv':
        // Use pitchEnvelope as a proxy for filter envelope shape
        // The actual synth.filterEnvelope is a FrequencyEnvelope
        return this.pitchEnvelope;
      default:
        return null;
    }
  }

  /**
   * Gets the destination parameter to modulate
   * Returns a Tone.js parameter that can receive modulation signals
   * Using Tone.InputNode as the base type since different params have different type parameters
   */
  private getDestinationParam(dest: ModDestination): Tone.InputNode | null {
    switch (dest) {
      case 'pitch':
        return this.synth.detune;
      case 'pan':
        return this.panner.pan;
      case 'amplitude':
        return this.outputGain.gain;
      case 'filterCutoff':
        return this.synth.filter.frequency;
      case 'osc2Mix':
        return this.osc2Gain.gain;
      case 'lfo1Rate':
        return this.lfo.frequency;
      case 'lfo2Rate':
        return this.lfo2.frequency;
      default:
        return null;
    }
  }

  /**
   * Gets the scaling factor for a destination
   * This determines how much the modulation affects the destination
   */
  private getDestinationScale(dest: ModDestination): number {
    switch (dest) {
      case 'pitch':
        return 1200;      // ±1 octave in cents (1200 cents = 1 octave)
      case 'pan':
        return 1;         // Full range (-1 to +1)
      case 'amplitude':
        return 0.5;       // ±50% of amplitude
      case 'filterCutoff':
        return 4000;      // ±4kHz
      case 'osc2Mix':
        return 0.5;       // ±50% of mix
      case 'lfo1Rate':
        return 10;        // ±10 Hz
      case 'lfo2Rate':
        return 10;        // ±10 Hz
      default:
        return 1;
    }
  }

  // ============================================
  // Pitch Envelope Controls
  // ============================================

  setPitchEnvelope(envelope: Partial<PitchEnvelopeParams>): void {
    this.params.pitchEnvelope = { ...this.params.pitchEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.pitchEnvelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.pitchEnvelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.pitchEnvelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.pitchEnvelope.release = envelope.release;
    }
    if (envelope.amount !== undefined) {
      // Convert semitones to cents
      this.pitchEnvelopeScale.value = envelope.amount * 100;
    }
  }

  setPitchEnvelopeAttack(time: number): void {
    this.setPitchEnvelope({ attack: time });
  }

  setPitchEnvelopeDecay(time: number): void {
    this.setPitchEnvelope({ decay: time });
  }

  setPitchEnvelopeSustain(level: number): void {
    this.setPitchEnvelope({ sustain: level });
  }

  setPitchEnvelopeRelease(time: number): void {
    this.setPitchEnvelope({ release: time });
  }

  setPitchEnvelopeAmount(semitones: number): void {
    this.setPitchEnvelope({ amount: semitones });
  }

  // ============================================
  // Mod Envelope Controls
  // ============================================

  setModEnvelope(envelope: Partial<ModEnvelopeParams>): void {
    this.params.modEnvelope = { ...this.params.modEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.modEnvelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.modEnvelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.modEnvelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.modEnvelope.release = envelope.release;
    }
    if (envelope.amount !== undefined) {
      // Scale by cutoff for audible modulation range
      this.modEnvelopeScale.value = envelope.amount * this.params.filter.cutoff;
    }
  }

  setModEnvelopeAttack(time: number): void {
    this.setModEnvelope({ attack: time });
  }

  setModEnvelopeDecay(time: number): void {
    this.setModEnvelope({ decay: time });
  }

  setModEnvelopeSustain(level: number): void {
    this.setModEnvelope({ sustain: level });
  }

  setModEnvelopeRelease(time: number): void {
    this.setModEnvelope({ release: time });
  }

  setModEnvelopeAmount(amount: number): void {
    this.setModEnvelope({ amount });
  }

  // ============================================
  // PWM Envelope Controls
  // Note: PWM requires a pulse oscillator type to be audible.
  // These controls store the values for future pulse oscillator support.
  // ============================================

  setPWMEnvelope(envelope: Partial<PWMEnvelopeParams>): void {
    this.params.pwmEnvelope = { ...this.params.pwmEnvelope, ...envelope };
    // PWM routing would connect here when pulse oscillator is implemented
  }

  setPWMEnvelopeAttack(time: number): void {
    this.setPWMEnvelope({ attack: time });
  }

  setPWMEnvelopeDecay(time: number): void {
    this.setPWMEnvelope({ decay: time });
  }

  setPWMEnvelopeSustain(level: number): void {
    this.setPWMEnvelope({ sustain: level });
  }

  setPWMEnvelopeRelease(time: number): void {
    this.setPWMEnvelope({ release: time });
  }

  setPWMEnvelopeAmount(amount: number): void {
    this.setPWMEnvelope({ amount });
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
   * Applies key tracking to filter - adjusts cutoff based on note frequency
   */
  private applyKeyTracking(frequency: number): void {
    if (this.params.filter.keyTracking === 0) return;

    // Reference frequency is middle C (C4 = 261.63 Hz)
    const referenceFreq = 261.63;
    // Calculate octave offset from reference
    const octaveOffset = Math.log2(frequency / referenceFreq);
    // Apply key tracking: each octave adds/subtracts cutoff based on tracking amount
    // At 100% tracking, cutoff doubles for each octave up
    const trackingMultiplier = Math.pow(2, octaveOffset * this.params.filter.keyTracking);
    const newCutoff = Math.min(20000, Math.max(20, this.params.filter.cutoff * trackingMultiplier));

    this.synth.filter.frequency.value = newCutoff;
    this.noiseFilter.frequency.value = newCutoff;
  }

  /**
   * Applies velocity sensitivity to amplitude and filter
   */
  private applyVelocity(velocity: number): void {
    // Velocity affects amplitude: at 0 sensitivity, always full volume
    // At 100% sensitivity, velocity directly controls volume
    const ampScale = 1 - this.params.velocity.ampAmount + (this.params.velocity.ampAmount * velocity);
    // Apply by adjusting the synth volume temporarily
    // Store original and apply scaled version
    const velocityDb = 20 * Math.log10(ampScale);
    this.synth.volume.value = this.params.volume + velocityDb;

    // Velocity affects filter envelope amount
    const filterScale = 1 - this.params.velocity.filterAmount + (this.params.velocity.filterAmount * velocity);
    this.synth.filterEnvelope.octaves = this.params.filterEnvelope.amount * filterScale;
  }

  /**
   * Triggers a note with the current envelope settings
   * @param note - Note name (e.g., 'C4', 'A3') or frequency in Hz
   * @param velocity - Note velocity (0-1, default 1)
   */
  triggerAttack(note: string | number, velocity: number = 1): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const adjustedFreq = applyOctaveOffset(frequency, this.params.oscillator.octave);

    // Apply key tracking before triggering
    this.applyKeyTracking(adjustedFreq);

    // Apply velocity sensitivity
    this.applyVelocity(velocity);

    this.synth.triggerAttack(adjustedFreq);

    // Set sub oscillator frequency (one or two octaves below)
    const subOscFreq = applyOctaveOffset(adjustedFreq, this.params.subOsc.octave);
    this.subOsc.frequency.value = subOscFreq;
    if (this.params.subOsc.enabled) {
      this.subOscEnvelope.triggerAttack();
    }

    // Set oscillator 2 frequency (with its own octave offset)
    const osc2Freq = applyOctaveOffset(frequency, this.params.oscillator2.octave);
    this.osc2.frequency.value = osc2Freq;
    if (this.params.oscillator2.enabled) {
      this.osc2Envelope.triggerAttack();
    }

    // Trigger additional envelopes
    this.pitchEnvelope.triggerAttack();
    this.modEnvelope.triggerAttack();
  }

  /**
   * Releases the current note
   */
  triggerRelease(): void {
    this.synth.triggerRelease();

    // Release sub oscillator and oscillator 2 envelopes
    this.subOscEnvelope.triggerRelease();
    this.osc2Envelope.triggerRelease();

    // Release additional envelopes
    this.pitchEnvelope.triggerRelease();
    this.modEnvelope.triggerRelease();

    // Reset filter to base cutoff after release
    this.synth.filter.frequency.value = this.params.filter.cutoff;
    this.noiseFilter.frequency.value = this.params.filter.cutoff;

    // Reset volume to base level
    this.synth.volume.value = this.params.volume;

    // Reset filter envelope amount
    this.synth.filterEnvelope.octaves = this.params.filterEnvelope.amount;
  }

  /**
   * Triggers a note for a specific duration
   * @param note - Note name or frequency
   * @param duration - Duration in seconds or Tone.js time notation
   * @param velocity - Note velocity (0-1, default 1)
   */
  triggerAttackRelease(note: string | number, duration: number | string = '8n', velocity: number = 1): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const adjustedFreq = applyOctaveOffset(frequency, this.params.oscillator.octave);

    // Apply key tracking
    this.applyKeyTracking(adjustedFreq);

    // Apply velocity sensitivity
    this.applyVelocity(velocity);

    this.synth.triggerAttackRelease(adjustedFreq, duration);

    // Trigger sub oscillator with correct frequency
    const subOscFreq = applyOctaveOffset(adjustedFreq, this.params.subOsc.octave);
    this.subOsc.frequency.value = subOscFreq;
    if (this.params.subOsc.enabled) {
      this.subOscEnvelope.triggerAttackRelease(duration);
    }

    // Trigger oscillator 2 with correct frequency
    const osc2Freq = applyOctaveOffset(frequency, this.params.oscillator2.octave);
    this.osc2.frequency.value = osc2Freq;
    if (this.params.oscillator2.enabled) {
      this.osc2Envelope.triggerAttackRelease(duration);
    }

    // Trigger additional envelopes with matching duration
    this.pitchEnvelope.triggerAttackRelease(duration);
    this.modEnvelope.triggerAttackRelease(duration);
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

    if (params.noise) {
      this.setNoise(params.noise);
    }

    if (params.glide) {
      this.setGlide(params.glide);
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

    if (params.pitchEnvelope) {
      this.setPitchEnvelope(params.pitchEnvelope);
    }

    if (params.modEnvelope) {
      this.setModEnvelope(params.modEnvelope);
    }

    if (params.pwmEnvelope) {
      this.setPWMEnvelope(params.pwmEnvelope);
    }

    if (params.subOsc) {
      this.setSubOsc(params.subOsc);
    }

    if (params.oscillator2) {
      this.setOsc2(params.oscillator2);
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

    if (params.lfo2) {
      this.setLFO2(params.lfo2);
    }

    if (params.pan !== undefined) {
      this.setPan(params.pan);
    }

    if (params.modMatrix) {
      this.setModMatrix(params.modMatrix);
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
    // Clean up LFO2
    this.lfo2.stop();
    this.lfo2.dispose();
    this.lfo2Gain.dispose();
    this.pitchEnvelope.dispose();
    this.pitchEnvelopeScale.dispose();
    this.modEnvelope.dispose();
    this.modEnvelopeScale.dispose();
    this.noise.stop();
    this.noise.dispose();
    this.noiseGain.dispose();
    this.noiseFilter.dispose();
    // Clean up sub oscillator
    this.subOsc.stop();
    this.subOsc.dispose();
    this.subOscEnvelope.dispose();
    this.subOscGain.dispose();
    // Clean up oscillator 2
    this.osc2.stop();
    this.osc2.dispose();
    this.osc2Envelope.dispose();
    this.osc2Filter.dispose();
    this.osc2Gain.dispose();
    // Clean up panner and output gain
    this.panner.dispose();
    this.outputGain.dispose();
    this.osc1Gain.dispose();
    // Clean up mod matrix routes
    this.modRouteNodes.forEach((nodes, index) => {
      this.disconnectModRoute(index);
    });
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
