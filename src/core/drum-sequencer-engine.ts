/**
 * MIXCRAFT Drum Sequencer Engine
 * Wraps Tone.js Transport and Players for step sequencer playback
 */

import * as Tone from 'tone';
import type { DrumPattern, DrumTrack, DrumStep, DrumSequencerParams } from './types.ts';
import { DEFAULT_DRUM_SEQUENCER_PARAMS, DRUM_SEQUENCER_RANGES } from './types.ts';

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clones a DrumPattern
 */
function clonePattern(pattern: DrumPattern): DrumPattern {
  return {
    name: pattern.name,
    tempo: pattern.tempo,
    swing: pattern.swing,
    stepCount: pattern.stepCount,
    tracks: pattern.tracks.map(track => ({
      id: track.id,
      name: track.name,
      sampleUrl: track.sampleUrl,
      steps: track.steps.map(step => ({ ...step })),
    })),
  };
}

/**
 * DrumSequencerEngine class - wraps Tone.js Transport and Players for step sequencer
 *
 * Supports:
 * - Pattern playback with configurable tempo and swing
 * - Per-step velocity control
 * - Multi-track drum patterns
 * - Step toggle and track clearing
 * - UI callback for playhead sync
 */
export class DrumSequencerEngine {
  private players: Map<string, Tone.Player> = new Map();
  private volumeNodes: Map<string, Tone.Volume> = new Map();
  private masterVolume: Tone.Volume;
  private sequence: Tone.Sequence | null = null;
  private params: DrumSequencerParams;
  private stepCallback: ((step: number) => void) | null = null;
  private isLoaded = false;
  private isStarted = false;

  constructor(initialParams?: Partial<DrumSequencerParams>) {
    // Deep copy default params and merge with initial
    this.params = {
      pattern: clonePattern(initialParams?.pattern ?? DEFAULT_DRUM_SEQUENCER_PARAMS.pattern),
      currentStep: initialParams?.currentStep ?? DEFAULT_DRUM_SEQUENCER_PARAMS.currentStep,
      isPlaying: initialParams?.isPlaying ?? DEFAULT_DRUM_SEQUENCER_PARAMS.isPlaying,
      selectedTrack: initialParams?.selectedTrack ?? DEFAULT_DRUM_SEQUENCER_PARAMS.selectedTrack,
      volume: initialParams?.volume ?? DEFAULT_DRUM_SEQUENCER_PARAMS.volume,
    };

    // Create master volume node
    this.masterVolume = new Tone.Volume(this.params.volume);
    this.masterVolume.toDestination();
  }

  /**
   * Initialize audio (call after user gesture)
   */
  async start(): Promise<void> {
    if (this.isStarted) return;

    await Tone.start();
    this.isStarted = true;

    await this.loadSamples();
    this.createSequence();

    // Set initial tempo and swing
    Tone.Transport.bpm.value = this.params.pattern.tempo;
    Tone.Transport.swing = this.params.pattern.swing;
    Tone.Transport.swingSubdivision = '16n';
  }

  /**
   * Load drum samples
   */
  private async loadSamples(): Promise<void> {
    // Dispose existing players
    this.players.forEach(player => player.dispose());
    this.volumeNodes.forEach(vol => vol.dispose());
    this.players.clear();
    this.volumeNodes.clear();

    // Load each track's sample into Tone.Player
    const loadPromises = this.params.pattern.tracks.map(async (track) => {
      const player = new Tone.Player(track.sampleUrl);
      const volumeNode = new Tone.Volume(0);

      player.connect(volumeNode);
      volumeNode.connect(this.masterVolume);

      await player.load(track.sampleUrl);

      this.players.set(track.id, player);
      this.volumeNodes.set(track.id, volumeNode);
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
  }

  /**
   * Create the step sequence
   */
  private createSequence(): void {
    // Dispose existing sequence
    if (this.sequence) {
      this.sequence.dispose();
    }

    // Create array of step indices
    const stepIndices = Array.from(
      { length: this.params.pattern.stepCount },
      (_, i) => i
    );

    // Create sequence with 16n subdivision
    this.sequence = new Tone.Sequence(
      (time, step) => {
        // Update current step
        this.params.currentStep = step;

        // Trigger step callback for UI sync
        if (this.stepCallback) {
          // Use Tone.Draw to schedule callback on animation frame
          Tone.Draw.schedule(() => {
            this.stepCallback?.(step);
          }, time);
        }

        // Check each track and trigger samples for active steps
        this.params.pattern.tracks.forEach((track) => {
          const stepData = track.steps[step];
          if (stepData && stepData.active) {
            const player = this.players.get(track.id);
            if (player && player.loaded) {
              // Apply velocity as volume offset (velocity 1 = 0dB, velocity 0 = -inf)
              const velocityDb = stepData.velocity > 0
                ? 20 * Math.log10(stepData.velocity)
                : -Infinity;
              const volumeNode = this.volumeNodes.get(track.id);
              if (volumeNode) {
                volumeNode.volume.value = velocityDb;
              }
              player.start(time);
            }
          }
        });
      },
      stepIndices,
      '16n'
    );

    // Start the sequence (but not the transport)
    this.sequence.start(0);
  }

  /**
   * Play the pattern
   */
  play(): void {
    if (!this.isLoaded) return;

    Tone.Transport.start();
    this.params.isPlaying = true;
  }

  /**
   * Stop the pattern
   */
  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.params.currentStep = 0;
    this.params.isPlaying = false;

    // Notify callback of reset
    if (this.stepCallback) {
      this.stepCallback(0);
    }
  }

  /**
   * Pause the pattern (stop without resetting position)
   */
  pause(): void {
    Tone.Transport.pause();
    this.params.isPlaying = false;
  }

  /**
   * Set tempo in BPM
   */
  setTempo(bpm: number): void {
    const clamped = clamp(bpm, DRUM_SEQUENCER_RANGES.tempo.min, DRUM_SEQUENCER_RANGES.tempo.max);
    this.params.pattern.tempo = clamped;
    Tone.Transport.bpm.value = clamped;
  }

  /**
   * Set swing amount (0-1)
   */
  setSwing(amount: number): void {
    const clamped = clamp(amount, DRUM_SEQUENCER_RANGES.swing.min, DRUM_SEQUENCER_RANGES.swing.max);
    this.params.pattern.swing = clamped;
    Tone.Transport.swing = clamped;
    Tone.Transport.swingSubdivision = '16n';
  }

  /**
   * Toggle step on/off
   */
  toggleStep(trackIndex: number, stepIndex: number): void {
    const track = this.params.pattern.tracks[trackIndex];
    if (track && track.steps[stepIndex]) {
      track.steps[stepIndex].active = !track.steps[stepIndex].active;
    }
  }

  /**
   * Set step active state
   */
  setStepActive(trackIndex: number, stepIndex: number, active: boolean): void {
    const track = this.params.pattern.tracks[trackIndex];
    if (track && track.steps[stepIndex]) {
      track.steps[stepIndex].active = active;
    }
  }

  /**
   * Set step velocity
   */
  setStepVelocity(trackIndex: number, stepIndex: number, velocity: number): void {
    const track = this.params.pattern.tracks[trackIndex];
    if (track && track.steps[stepIndex]) {
      track.steps[stepIndex].velocity = clamp(velocity, 0, 1);
    }
  }

  /**
   * Clear all steps in a track
   */
  clearTrack(trackIndex: number): void {
    const track = this.params.pattern.tracks[trackIndex];
    if (track) {
      track.steps.forEach(step => {
        step.active = false;
      });
    }
  }

  /**
   * Clear all tracks
   */
  clearAll(): void {
    this.params.pattern.tracks.forEach(track => {
      track.steps.forEach(step => {
        step.active = false;
      });
    });
  }

  /**
   * Load a new pattern
   */
  async setPattern(pattern: DrumPattern): Promise<void> {
    const wasPlaying = this.params.isPlaying;

    // Stop playback
    if (wasPlaying) {
      this.stop();
    }

    // Deep copy pattern
    this.params.pattern = clonePattern(pattern);

    // Update tempo and swing
    this.setTempo(pattern.tempo);
    this.setSwing(pattern.swing);

    // Reload samples if engine is started
    if (this.isStarted) {
      await this.loadSamples();
      this.createSequence();
    }

    // Resume playback if it was playing
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Get current pattern (deep copy)
   */
  getPattern(): DrumPattern {
    return clonePattern(this.params.pattern);
  }

  /**
   * Get full params (deep copy)
   */
  getParams(): DrumSequencerParams {
    return {
      pattern: this.getPattern(),
      currentStep: this.params.currentStep,
      isPlaying: this.params.isPlaying,
      selectedTrack: this.params.selectedTrack,
      volume: this.params.volume,
    };
  }

  /**
   * Get current step
   */
  getCurrentStep(): number {
    return this.params.currentStep;
  }

  /**
   * Register callback for step changes (for UI playhead)
   */
  onStepChange(callback: (step: number) => void): void {
    this.stepCallback = callback;
  }

  /**
   * Remove step change callback
   */
  offStepChange(): void {
    this.stepCallback = null;
  }

  /**
   * Set selected track
   */
  setSelectedTrack(trackIndex: number): void {
    if (trackIndex >= 0 && trackIndex < this.params.pattern.tracks.length) {
      this.params.selectedTrack = trackIndex;
    }
  }

  /**
   * Get selected track index
   */
  getSelectedTrack(): number {
    return this.params.selectedTrack;
  }

  /**
   * Set master volume in dB
   */
  setVolume(db: number): void {
    const clamped = clamp(db, DRUM_SEQUENCER_RANGES.volume.min, DRUM_SEQUENCER_RANGES.volume.max);
    this.params.volume = clamped;
    this.masterVolume.volume.value = clamped;
  }

  /**
   * Check if loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Check if playing
   */
  get playing(): boolean {
    return this.params.isPlaying;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    // Stop playback
    this.stop();

    // Dispose sequence
    if (this.sequence) {
      this.sequence.dispose();
      this.sequence = null;
    }

    // Dispose all players and volume nodes
    this.players.forEach(player => player.dispose());
    this.volumeNodes.forEach(vol => vol.dispose());
    this.players.clear();
    this.volumeNodes.clear();

    // Dispose master volume
    this.masterVolume.dispose();

    // Clear callback
    this.stepCallback = null;
    this.isLoaded = false;
  }
}

/**
 * Creates a new drum sequencer engine instance
 */
export function createDrumSequencerEngine(params?: Partial<DrumSequencerParams>): DrumSequencerEngine {
  return new DrumSequencerEngine(params);
}
