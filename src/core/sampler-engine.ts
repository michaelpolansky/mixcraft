/**
 * MIXCRAFT Sampler Engine
 * Wraps Tone.js Player for sample playback with slicing, pitch shifting, and effects
 */

import * as Tone from 'tone';
import type {
  SamplerParams,
  SampleSlice,
  ADSREnvelope,
  AnalyserConfig,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
} from './types.ts';
import {
  DEFAULT_SAMPLER_PARAMS,
  SAMPLER_PARAM_RANGES,
  DEFAULT_ANALYSER_CONFIG,
} from './types.ts';
import { EffectsChain } from './effects-chain.ts';

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts semitones to playback rate
 * Each octave (12 semitones) doubles the rate
 */
export function semitonesToRate(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

/**
 * Generates a unique ID for slices
 */
function generateSliceId(): string {
  return `slice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Downsamples an AudioBuffer to a fixed number of points for visualization
 */
function generateWaveformData(buffer: AudioBuffer, targetPoints: number = 1000): Float32Array {
  const channelData = buffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / targetPoints);
  const waveformData = new Float32Array(targetPoints);

  for (let i = 0; i < targetPoints; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);

    // Find the max absolute value in this block for peak visualization
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) {
        max = abs;
      }
    }
    waveformData[i] = max;
  }

  return waveformData;
}

/**
 * SamplerEngine class - wraps Tone.Player for sample playback
 *
 * Supports:
 * - Sample loading and playback
 * - Start/end point control
 * - Pitch shifting via playback rate
 * - Loop and reverse modes
 * - Sample slicing for chopping
 * - Effects chain (distortion, delay, chorus, reverb)
 * - Analyser for visualization
 */
export class SamplerEngine {
  private player: Tone.Player;
  private volumeNode: Tone.Volume;
  private analyser: AnalyserNode;
  private params: SamplerParams;
  private isInitialized = false;
  private waveformData: Float32Array | null = null;
  private audioBuffer: AudioBuffer | null = null;

  // Effects chain
  private effectsChain: EffectsChain;

  constructor(initialParams: Partial<SamplerParams> = {}) {
    // Deep copy to avoid shared mutable state
    this.params = {
      ...DEFAULT_SAMPLER_PARAMS,
      ...initialParams,
      slices: [...(initialParams.slices ?? DEFAULT_SAMPLER_PARAMS.slices)],
      amplitudeEnvelope: { ...DEFAULT_SAMPLER_PARAMS.amplitudeEnvelope, ...initialParams.amplitudeEnvelope },
      effects: {
        distortion: { ...DEFAULT_SAMPLER_PARAMS.effects.distortion, ...initialParams.effects?.distortion },
        delay: { ...DEFAULT_SAMPLER_PARAMS.effects.delay, ...initialParams.effects?.delay },
        reverb: { ...DEFAULT_SAMPLER_PARAMS.effects.reverb, ...initialParams.effects?.reverb },
        chorus: { ...DEFAULT_SAMPLER_PARAMS.effects.chorus, ...initialParams.effects?.chorus },
      },
    };

    // Create the player
    this.player = new Tone.Player({
      loop: this.params.loop,
      reverse: this.params.reverse,
      playbackRate: semitonesToRate(this.params.pitch),
    });

    // Create volume node
    this.volumeNode = new Tone.Volume(this.params.volume);

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser node
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: player -> volume -> effectsChain -> analyser -> destination
    this.player.connect(this.volumeNode);
    this.volumeNode.connect(this.effectsChain.input);
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
   * Loads a sample from a URL and generates waveform data
   */
  async loadSample(url: string, name: string): Promise<void> {
    await this.player.load(url);

    // Store the buffer for waveform generation
    const buffer = this.player.buffer;
    if (buffer) {
      this.audioBuffer = buffer.get() as AudioBuffer;
      this.waveformData = generateWaveformData(this.audioBuffer);
      this.params.duration = buffer.duration;
    }

    this.params.sampleUrl = url;
    this.params.sampleName = name;
  }

  /**
   * Ensures the audio context is started (requires user gesture)
   */
  async ensureStarted(): Promise<void> {
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
   * Starts playback from startPoint to endPoint
   */
  start(time?: number): void {
    if (!this.player.loaded) return;

    const duration = this.params.duration;
    const startTime = duration * this.params.startPoint;
    const endTime = duration * this.params.endPoint;
    const playDuration = endTime - startTime;

    if (playDuration <= 0) return;

    this.player.start(time, startTime, playDuration);
  }

  /**
   * Stops playback
   */
  stop(): void {
    this.player.stop();
  }

  /**
   * Triggers playback of a specific slice
   */
  triggerSlice(index: number): void {
    if (index < 0 || index >= this.params.slices.length) return;

    const slice = this.params.slices[index];
    const duration = slice.end - slice.start;

    if (duration <= 0) return;

    // Apply slice-specific pitch
    const originalPitch = this.params.pitch;
    this.player.playbackRate = semitonesToRate(originalPitch + slice.pitch);

    this.player.start(undefined, slice.start, duration);
  }

  // ============================================
  // Pitch and Time Controls
  // ============================================

  /**
   * Sets the pitch shift in semitones
   */
  setPitch(semitones: number): void {
    const clamped = clamp(
      semitones,
      SAMPLER_PARAM_RANGES.pitch.min,
      SAMPLER_PARAM_RANGES.pitch.max
    );
    this.params.pitch = clamped;
    this.player.playbackRate = semitonesToRate(clamped);
  }

  /**
   * Sets the time stretch ratio
   *
   * @stub This method stores the value but does not apply it.
   * Tone.Player does not support true time stretch without pitch change.
   * For proper time stretch (independent of pitch), GrainPlayer would be needed.
   * This is a placeholder for future implementation.
   */
  setTimeStretch(ratio: number): void {
    const clamped = clamp(
      ratio,
      SAMPLER_PARAM_RANGES.timeStretch.min,
      SAMPLER_PARAM_RANGES.timeStretch.max
    );
    this.params.timeStretch = clamped;
    // STUB: Value stored but not applied - requires GrainPlayer for true time stretch
    console.warn('SamplerEngine.setTimeStretch: stub - GrainPlayer required for true time stretch');
  }

  // ============================================
  // Playback Region Controls
  // ============================================

  /**
   * Sets the start point (0-1 normalized)
   */
  setStartPoint(value: number): void {
    this.params.startPoint = clamp(value, 0, this.params.endPoint);
  }

  /**
   * Sets the end point (0-1 normalized)
   */
  setEndPoint(value: number): void {
    this.params.endPoint = clamp(value, this.params.startPoint, 1);
  }

  /**
   * Enables or disables loop mode
   */
  setLoop(enabled: boolean): void {
    this.params.loop = enabled;
    this.player.loop = enabled;
  }

  /**
   * Enables or disables reverse playback
   */
  setReverse(enabled: boolean): void {
    this.params.reverse = enabled;
    this.player.reverse = enabled;
  }

  // ============================================
  // Volume Control
  // ============================================

  /**
   * Sets the volume in dB
   */
  setVolume(db: number): void {
    const clamped = clamp(
      db,
      SAMPLER_PARAM_RANGES.volume.min,
      SAMPLER_PARAM_RANGES.volume.max
    );
    this.params.volume = clamped;
    this.volumeNode.volume.value = clamped;
  }

  /**
   * Set selected slice index
   */
  setSelectedSlice(index: number): void {
    this.params.selectedSlice = index;
  }

  // ============================================
  // Slice Management
  // ============================================

  /**
   * Adds a new slice
   */
  addSlice(start: number, end: number): SampleSlice {
    const slice: SampleSlice = {
      id: generateSliceId(),
      start: clamp(start, 0, this.params.duration),
      end: clamp(end, 0, this.params.duration),
      pitch: 0,
      velocity: 1,
    };
    this.params.slices.push(slice);
    return slice;
  }

  /**
   * Removes a slice by ID
   */
  removeSlice(id: string): void {
    this.params.slices = this.params.slices.filter(s => s.id !== id);
  }

  /**
   * Automatically divides the sample into equal slices
   */
  autoSlice(numSlices: number): SampleSlice[] {
    if (numSlices <= 0 || this.params.duration <= 0) return [];

    // Clear existing slices
    this.params.slices = [];

    const sliceDuration = this.params.duration / numSlices;
    const newSlices: SampleSlice[] = [];

    for (let i = 0; i < numSlices; i++) {
      const slice = this.addSlice(
        i * sliceDuration,
        (i + 1) * sliceDuration
      );
      newSlices.push(slice);
    }

    return newSlices;
  }

  /**
   * Gets all slices
   */
  getSlices(): SampleSlice[] {
    return [...this.params.slices];
  }

  /**
   * Updates a slice's properties
   */
  updateSlice(id: string, updates: Partial<Omit<SampleSlice, 'id'>>): void {
    const slice = this.params.slices.find(s => s.id === id);
    if (!slice) return;

    if (updates.start !== undefined) {
      slice.start = clamp(updates.start, 0, this.params.duration);
    }
    if (updates.end !== undefined) {
      slice.end = clamp(updates.end, 0, this.params.duration);
    }
    if (updates.pitch !== undefined) {
      slice.pitch = clamp(updates.pitch, -24, 24);
    }
    if (updates.velocity !== undefined) {
      slice.velocity = clamp(updates.velocity, 0, 1);
    }
  }

  // ============================================
  // Effects Controls
  // ============================================

  setDistortion(distortionParams: Partial<DistortionParams>): void {
    this.params.effects.distortion = { ...this.params.effects.distortion, ...distortionParams };
    this.effectsChain.setDistortion(distortionParams);
  }

  setDelay(delayParams: Partial<DelayParams>): void {
    this.params.effects.delay = { ...this.params.effects.delay, ...delayParams };
    this.effectsChain.setDelay(delayParams);
  }

  setReverb(reverbParams: Partial<ReverbParams>): void {
    this.params.effects.reverb = { ...this.params.effects.reverb, ...reverbParams };
    this.effectsChain.setReverb(reverbParams);
  }

  setChorus(chorusParams: Partial<ChorusParams>): void {
    this.params.effects.chorus = { ...this.params.effects.chorus, ...chorusParams };
    this.effectsChain.setChorus(chorusParams);
  }

  // ============================================
  // Amplitude Envelope
  // ============================================

  setAmplitudeEnvelope(envelope: Partial<ADSREnvelope>): void {
    this.params.amplitudeEnvelope = { ...this.params.amplitudeEnvelope, ...envelope };
    // Note: Tone.Player doesn't have built-in envelope
    // This would require additional envelope implementation for full support
  }

  // ============================================
  // Analysis and Visualization
  // ============================================

  /**
   * Gets the analyser node for visualization
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * Gets the waveform data for visualization
   */
  getWaveformData(): Float32Array {
    return this.waveformData ?? new Float32Array(0);
  }

  /**
   * Gets frequency data from the analyser
   */
  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Gets time domain data from the analyser
   */
  getTimeDomainData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // ============================================
  // State Access
  // ============================================

  /**
   * Gets the current sampler parameters (deep copy to prevent external mutation)
   */
  getParams(): SamplerParams {
    return {
      ...this.params,
      slices: this.params.slices.map(s => ({ ...s })),
      amplitudeEnvelope: { ...this.params.amplitudeEnvelope },
      effects: {
        distortion: { ...this.params.effects.distortion },
        delay: { ...this.params.effects.delay },
        reverb: { ...this.params.effects.reverb },
        chorus: { ...this.params.effects.chorus },
      },
    };
  }

  /**
   * Sets multiple parameters at once (bulk update)
   * Delegates to individual setters to ensure proper validation and state updates
   */
  setParams(params: Partial<SamplerParams>): void {
    if (params.pitch !== undefined) {
      this.setPitch(params.pitch);
    }
    if (params.timeStretch !== undefined) {
      this.setTimeStretch(params.timeStretch);
    }
    if (params.startPoint !== undefined) {
      this.setStartPoint(params.startPoint);
    }
    if (params.endPoint !== undefined) {
      this.setEndPoint(params.endPoint);
    }
    if (params.loop !== undefined) {
      this.setLoop(params.loop);
    }
    if (params.reverse !== undefined) {
      this.setReverse(params.reverse);
    }
    if (params.volume !== undefined) {
      this.setVolume(params.volume);
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
  }

  /**
   * Returns whether a sample is loaded
   */
  get loaded(): boolean {
    return this.player.loaded;
  }

  /**
   * Returns the sample duration
   */
  get duration(): number {
    return this.params.duration;
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Disposes of the sampler and releases resources
   */
  dispose(): void {
    this.player.stop();
    this.player.dispose();
    this.volumeNode.dispose();
    this.effectsChain.dispose();
    this.waveformData = null;
    this.audioBuffer = null;
  }
}

/**
 * Creates a new sampler engine instance
 */
export function createSamplerEngine(params?: Partial<SamplerParams>): SamplerEngine {
  return new SamplerEngine(params);
}
