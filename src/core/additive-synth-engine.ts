/**
 * MIXCRAFT Additive Synth Engine
 * Builds sounds by summing 16 sine wave partials (harmonics)
 */

import * as Tone from 'tone';
import type {
  AdditiveSynthParams,
  AdditivePreset,
  ADSREnvelope,
  AnalyserConfig,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
  AdditiveLFOParams,
  AdditiveLFODestination,
  LFOWaveform,
  NoiseType,
  NoiseParams,
  GlideParams,
  AdditiveVelocityParams,
  ArpPattern,
  ArpDivision,
  ArpeggiatorParams,
} from './types.ts';
import {
  DEFAULT_ADDITIVE_SYNTH_PARAMS,
  DEFAULT_ANALYSER_CONFIG,
  ADDITIVE_PRESETS,
} from './types.ts';
import { EffectsChain } from './effects-chain.ts';

/** Number of harmonic partials */
const NUM_HARMONICS = 16;

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * AdditiveSynthEngine class - builds sounds from 16 sine wave harmonics
 *
 * Additive synthesis creates timbres by summing multiple sine waves at
 * harmonic frequencies (multiples of the fundamental). Each harmonic has
 * its own amplitude control, allowing for precise timbre shaping.
 *
 * Signal flow:
 * Osc1 -> Gain1 ─┐
 * Osc2 -> Gain2 ─┤
 * ...            ├─> SumGain -> Envelope ─┐
 * Osc16-> Gain16┘                         │
 *                                         ├─> EffectsChain -> MasterGain -> Panner -> Analyser -> Destination
 * Noise -> NoiseFilter -> NoiseGain ──────┘
 */
export class AdditiveSynthEngine {
  private oscillators: Tone.Oscillator[];
  private harmonicGains: Tone.Gain[];
  private sumGain: Tone.Gain;
  private envelope: Tone.AmplitudeEnvelope;
  private analyser: AnalyserNode;
  private params: AdditiveSynthParams;
  private isInitialized = false;
  private currentFrequency = 440; // Default to A4

  // LFO for modulation
  private lfo: Tone.LFO;
  private lfoGain: Tone.Gain;

  // Noise generator
  private noise: Tone.Noise;
  private noiseGain: Tone.Gain;
  private noiseFilter: Tone.Filter;

  // Panner for stereo positioning
  private panner: Tone.Panner;

  // Velocity tracking
  private currentVelocity = 1;
  private baseHarmonics: number[];

  // Velocity gain for amplitude velocity response
  private velocityGain: Tone.Gain;

  // Effects chain
  private effectsChain: EffectsChain;

  // Master volume control (after effects)
  private masterGain: Tone.Gain;

  // Arpeggiator state
  private arpSequence: Tone.Sequence<string> | null = null;
  private heldNotes: string[] = [];
  private arpNotes: string[] = [];

  constructor(initialParams: Partial<AdditiveSynthParams> = {}) {
    // Merge defaults with initial params
    this.params = {
      ...DEFAULT_ADDITIVE_SYNTH_PARAMS,
      ...initialParams,
      harmonics: initialParams.harmonics
        ? [...initialParams.harmonics]
        : [...DEFAULT_ADDITIVE_SYNTH_PARAMS.harmonics],
      amplitudeEnvelope: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.amplitudeEnvelope,
        ...initialParams.amplitudeEnvelope,
      },
      effects: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.effects,
        distortion: {
          ...DEFAULT_ADDITIVE_SYNTH_PARAMS.effects.distortion,
          ...initialParams.effects?.distortion,
        },
        delay: {
          ...DEFAULT_ADDITIVE_SYNTH_PARAMS.effects.delay,
          ...initialParams.effects?.delay,
        },
        reverb: {
          ...DEFAULT_ADDITIVE_SYNTH_PARAMS.effects.reverb,
          ...initialParams.effects?.reverb,
        },
        chorus: {
          ...DEFAULT_ADDITIVE_SYNTH_PARAMS.effects.chorus,
          ...initialParams.effects?.chorus,
        },
      },
      lfo: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.lfo,
        ...initialParams.lfo,
      },
      noise: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.noise,
        ...initialParams.noise,
      },
      glide: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.glide,
        ...initialParams.glide,
      },
      velocity: {
        ...DEFAULT_ADDITIVE_SYNTH_PARAMS.velocity,
        ...initialParams.velocity,
      },
      pan: initialParams.pan ?? DEFAULT_ADDITIVE_SYNTH_PARAMS.pan,
    };

    // Ensure harmonics array has exactly 16 elements
    while (this.params.harmonics.length < NUM_HARMONICS) {
      this.params.harmonics.push(0);
    }
    this.params.harmonics = this.params.harmonics.slice(0, NUM_HARMONICS);

    // Clamp all harmonic amplitudes to 0-1
    this.params.harmonics = this.params.harmonics.map((amp) => clamp(amp, 0, 1));

    // Store base harmonics for velocity-based brightness scaling
    this.baseHarmonics = [...this.params.harmonics];

    // Create oscillators and individual gains
    this.oscillators = [];
    this.harmonicGains = [];

    for (let i = 0; i < NUM_HARMONICS; i++) {
      // Create sine oscillator for this harmonic
      const osc = new Tone.Oscillator({
        type: 'sine',
        frequency: this.currentFrequency * (i + 1), // Harmonic frequency
      });

      // Create gain for this harmonic's amplitude
      const gain = new Tone.Gain(this.params.harmonics[i]);

      // Connect osc -> gain
      osc.connect(gain);

      this.oscillators.push(osc);
      this.harmonicGains.push(gain);
    }

    // Create sum gain to combine all harmonics
    // Use a lower gain to prevent clipping when many harmonics are active
    this.sumGain = new Tone.Gain(0.5);

    // Connect all harmonic gains to the sum
    for (const gain of this.harmonicGains) {
      gain.connect(this.sumGain);
    }

    // Create LFO for modulation
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

    // Create noise generator
    this.noiseFilter = new Tone.Filter({
      frequency: 5000,
      type: 'lowpass',
    });
    this.noiseGain = new Tone.Gain(this.params.noise.level);
    this.noise = new Tone.Noise(this.params.noise.type);
    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);

    // Create amplitude envelope
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: this.params.amplitudeEnvelope.attack,
      decay: this.params.amplitudeEnvelope.decay,
      sustain: this.params.amplitudeEnvelope.sustain,
      release: this.params.amplitudeEnvelope.release,
    });

    // Connect sum -> envelope
    this.sumGain.connect(this.envelope);

    // Create velocity gain for amplitude velocity response
    this.velocityGain = new Tone.Gain(1);

    // Connect envelope -> velocityGain
    this.envelope.connect(this.velocityGain);

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Connect velocityGain -> effects chain
    this.velocityGain.connect(this.effectsChain.input);

    // Connect noise to effects chain input
    this.noiseGain.connect(this.effectsChain.input);

    // Create master gain for volume control
    this.masterGain = new Tone.Gain(Tone.dbToGain(this.params.volume));
    this.effectsChain.connect(this.masterGain);

    // Create panner for stereo positioning
    this.panner = new Tone.Panner(this.params.pan);
    this.masterGain.connect(this.panner);

    // Create analyser node for spectrum visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: panner -> analyser -> destination
    Tone.connect(this.panner, this.analyser);
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
   * Connects the LFO to its destination
   */
  private connectLFOToDestination(destination: AdditiveLFODestination): void {
    // Disconnect from all previous destinations
    this.lfoGain.disconnect();

    switch (destination) {
      case 'brightness':
        // Modulate harmonics 5-16 (indices 4-15) - high harmonics control brightness
        for (let i = 4; i < NUM_HARMONICS; i++) {
          const gain = this.harmonicGains[i];
          if (gain) {
            this.lfoGain.connect(gain.gain);
          }
        }
        break;
      case 'pitch':
        // Modulate frequency of all oscillators
        for (const osc of this.oscillators) {
          this.lfoGain.connect(osc.frequency);
        }
        break;
    }
  }

  /**
   * Ensures the audio context is started and starts all oscillators
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await Tone.start();
      // Start all oscillators (they produce sound only when envelope is triggered)
      for (const osc of this.oscillators) {
        osc.start();
      }
      // Start LFO
      this.lfo.start();
      // Start noise generator
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
  getParams(): AdditiveSynthParams {
    return {
      ...this.params,
      harmonics: [...this.params.harmonics],
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
  // Harmonic Controls
  // ============================================

  /**
   * Sets the amplitude of a single harmonic partial
   * @param index - Harmonic index (0-15, where 0 is the fundamental)
   * @param amplitude - Amplitude level (0 to 1)
   */
  setHarmonic(index: number, amplitude: number): void {
    if (index < 0 || index >= NUM_HARMONICS) {
      return;
    }
    const clamped = clamp(amplitude, 0, 1);
    this.params.harmonics[index] = clamped;
    this.baseHarmonics[index] = clamped;
    const gain = this.harmonicGains[index];
    if (gain) {
      gain.gain.value = clamped;
    }
  }

  /**
   * Sets all 16 harmonic amplitudes at once
   * @param amplitudes - Array of 16 amplitude values (0 to 1)
   */
  setHarmonics(amplitudes: number[]): void {
    for (let i = 0; i < NUM_HARMONICS; i++) {
      const amp = amplitudes[i] ?? 0;
      this.setHarmonic(i, amp);
    }
    // Update base harmonics for velocity scaling
    this.baseHarmonics = [...this.params.harmonics];
  }

  /**
   * Applies a preset harmonic configuration
   * @param preset - Preset name ('saw', 'square', 'triangle', 'organ')
   */
  applyPreset(preset: AdditivePreset): void {
    const harmonics = ADDITIVE_PRESETS[preset];
    if (harmonics) {
      this.setHarmonics([...harmonics]);
    }
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
      this.envelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.envelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.envelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.envelope.release = envelope.release;
    }
  }

  /**
   * Sets the attack time
   */
  setAmplitudeAttack(value: number): void {
    this.setAmplitudeEnvelope({ attack: value });
  }

  /**
   * Sets the decay time
   */
  setAmplitudeDecay(value: number): void {
    this.setAmplitudeEnvelope({ decay: value });
  }

  /**
   * Sets the sustain level
   */
  setAmplitudeSustain(value: number): void {
    this.setAmplitudeEnvelope({ sustain: clamp(value, 0, 1) });
  }

  /**
   * Sets the release time
   */
  setAmplitudeRelease(value: number): void {
    this.setAmplitudeEnvelope({ release: value });
  }

  // ============================================
  // Volume Control
  // ============================================

  /**
   * Sets the master volume in dB
   */
  setVolume(db: number): void {
    this.params.volume = db;
    this.masterGain.gain.value = Tone.dbToGain(db);
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
   * Sets the LFO depth/amount
   */
  setLFODepth(depth: number): void {
    this.params.lfo.depth = depth;
    this.lfoGain.gain.value = depth;
  }

  /**
   * Sets the LFO waveform
   */
  setLFOWaveform(waveform: LFOWaveform): void {
    this.params.lfo.waveform = waveform;
    this.lfo.type = waveform as Tone.ToneOscillatorType;
  }

  /**
   * Sets the LFO destination
   */
  setLFODestination(destination: AdditiveLFODestination): void {
    this.params.lfo.destination = destination;
    this.connectLFOToDestination(destination);
  }

  /**
   * Sets multiple LFO parameters at once
   */
  setLFO(params: Partial<AdditiveLFOParams>): void {
    if (params.rate !== undefined) this.setLFORate(params.rate);
    if (params.depth !== undefined) this.setLFODepth(params.depth);
    if (params.waveform !== undefined) this.setLFOWaveform(params.waveform);
    if (params.destination !== undefined) this.setLFODestination(params.destination);
  }

  // ============================================
  // Noise Controls
  // ============================================

  /**
   * Sets the noise type
   */
  setNoiseType(type: NoiseType): void {
    this.params.noise.type = type;
    this.noise.type = type;
  }

  /**
   * Sets the noise level
   */
  setNoiseLevel(level: number): void {
    this.params.noise.level = level;
    this.noiseGain.gain.value = level;
  }

  /**
   * Sets noise parameters
   */
  setNoise(params: Partial<NoiseParams>): void {
    if (params.type !== undefined) this.setNoiseType(params.type);
    if (params.level !== undefined) this.setNoiseLevel(params.level);
  }

  // ============================================
  // Glide Controls
  // ============================================

  /**
   * Sets whether glide is enabled
   */
  setGlideEnabled(enabled: boolean): void {
    this.params.glide.enabled = enabled;
  }

  /**
   * Sets the glide time
   */
  setGlideTime(time: number): void {
    this.params.glide.time = time;
  }

  /**
   * Sets glide parameters
   */
  setGlide(params: Partial<GlideParams>): void {
    if (params.enabled !== undefined) this.setGlideEnabled(params.enabled);
    if (params.time !== undefined) this.setGlideTime(params.time);
  }

  // ============================================
  // Pan Control
  // ============================================

  /**
   * Sets the pan position (-1 = left, 0 = center, 1 = right)
   */
  setPan(pan: number): void {
    this.params.pan = pan;
    this.panner.pan.value = pan;
  }

  // ============================================
  // Velocity Controls
  // ============================================

  /**
   * Sets velocity sensitivity for amplitude
   */
  setVelocityAmpAmount(amount: number): void {
    this.params.velocity.ampAmount = clamp(amount, 0, 1);
  }

  /**
   * Sets velocity sensitivity for brightness (harmonics 5-16)
   */
  setVelocityBrightnessAmount(amount: number): void {
    this.params.velocity.brightnessAmount = clamp(amount, 0, 1);
  }

  /**
   * Sets velocity parameters
   */
  setVelocity(params: Partial<AdditiveVelocityParams>): void {
    if (params.ampAmount !== undefined) this.setVelocityAmpAmount(params.ampAmount);
    if (params.brightnessAmount !== undefined) this.setVelocityBrightnessAmount(params.brightnessAmount);
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

        // Trigger the note
        this.triggerAttack(note);
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
   * Applies velocity to brightness (harmonics 5-16) and amplitude
   */
  private applyVelocity(velocity: number): void {
    this.currentVelocity = velocity;

    // Apply velocity to brightness (harmonics 5-16, indices 4-15)
    const brightnessScale = 1 - this.params.velocity.brightnessAmount * (1 - velocity);
    for (let i = 4; i < NUM_HARMONICS; i++) {
      const baseLevel = this.baseHarmonics[i] ?? 0;
      const gain = this.harmonicGains[i];
      if (gain) {
        gain.gain.value = baseLevel * brightnessScale;
      }
    }

    // Apply velocity to amplitude via velocity gain
    const ampScale = 1 - this.params.velocity.ampAmount * (1 - velocity);
    this.velocityGain.gain.value = ampScale;
  }

  /**
   * Triggers a note - sets oscillator frequencies and triggers envelope
   * @param note - Note name (e.g., 'C4', 'A3') or frequency in Hz
   * @param velocity - Velocity value (0 to 1, default 1)
   */
  triggerAttack(note: string | number, velocity = 1): void {
    // Apply velocity effects
    this.applyVelocity(velocity);

    // Convert note to frequency
    const baseFreq = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const glideTime = this.params.glide.enabled ? this.params.glide.time : 0;

    // Set each oscillator to its harmonic frequency with optional glide
    for (let i = 0; i < NUM_HARMONICS; i++) {
      const osc = this.oscillators[i];
      if (osc) {
        const targetFreq = baseFreq * (i + 1);
        if (glideTime > 0) {
          osc.frequency.rampTo(targetFreq, glideTime);
        } else {
          osc.frequency.value = targetFreq;
        }
      }
    }

    this.currentFrequency = baseFreq;

    // Trigger the amplitude envelope
    this.envelope.triggerAttack();
  }

  /**
   * Releases the current note
   */
  triggerRelease(): void {
    this.envelope.triggerRelease();
  }

  /**
   * Triggers a note for a specific duration
   * @param note - Note name or frequency
   * @param duration - Duration in seconds or Tone.js time notation
   * @param velocity - Velocity value (0 to 1, default 1)
   */
  triggerAttackRelease(note: string | number, duration: number | string = '8n', velocity = 1): void {
    // Apply velocity effects
    this.applyVelocity(velocity);

    // Convert note to frequency
    const baseFreq = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();

    const glideTime = this.params.glide.enabled ? this.params.glide.time : 0;

    // Set each oscillator to its harmonic frequency with optional glide
    for (let i = 0; i < NUM_HARMONICS; i++) {
      const osc = this.oscillators[i];
      if (osc) {
        const targetFreq = baseFreq * (i + 1);
        if (glideTime > 0) {
          osc.frequency.rampTo(targetFreq, glideTime);
        } else {
          osc.frequency.value = targetFreq;
        }
      }
    }

    this.currentFrequency = baseFreq;

    // Trigger the amplitude envelope with release after duration
    this.envelope.triggerAttackRelease(duration);
  }

  // ============================================
  // Bulk Updates
  // ============================================

  /**
   * Updates multiple synth parameters at once
   */
  setParams(params: Partial<AdditiveSynthParams>): void {
    if (params.harmonics !== undefined) {
      this.setHarmonics(params.harmonics);
    }
    if (params.amplitudeEnvelope) {
      this.setAmplitudeEnvelope(params.amplitudeEnvelope);
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
    // Stop arpeggiator
    this.stopArpeggiator();
    this.heldNotes = [];
    // Stop and dispose all oscillators
    for (const osc of this.oscillators) {
      osc.stop();
      osc.dispose();
    }
    // Dispose all harmonic gains
    for (const gain of this.harmonicGains) {
      gain.dispose();
    }
    // Dispose sum gain
    this.sumGain.dispose();
    // Stop and dispose LFO
    this.lfo.stop();
    this.lfo.dispose();
    this.lfoGain.dispose();
    // Stop and dispose noise
    this.noise.stop();
    this.noise.dispose();
    this.noiseGain.dispose();
    this.noiseFilter.dispose();
    // Dispose panner
    this.panner.dispose();
    // Dispose envelope
    this.envelope.dispose();
    // Dispose velocity gain
    this.velocityGain.dispose();
    // Dispose effects chain
    this.effectsChain.dispose();
    // Dispose master gain
    this.masterGain.dispose();
  }
}

/**
 * Creates a new additive synth engine instance
 */
export function createAdditiveSynthEngine(params?: Partial<AdditiveSynthParams>): AdditiveSynthEngine {
  return new AdditiveSynthEngine(params);
}
