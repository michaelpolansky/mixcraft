/**
 * MIXCRAFT Synth Sequencer Engine
 * Plays note sequences through any synth engine with optional drum backing
 */

import * as Tone from 'tone';
import type {
  SequenceNote,
  NoteSequence,
  DrumPatternStep,
  SynthEngineInterface,
} from './types.ts';

// Re-export types for convenience
export type { SequenceNote, NoteSequence, DrumPatternStep, SynthEngineInterface };

/**
 * Drum sample URLs
 */
const DRUM_SAMPLES: Record<string, string> = {
  'kick': '/samples/drums/kick.wav',
  'snare': '/samples/drums/snare.wav',
  'hihat-closed': '/samples/drums/hihat-closed.wav',
  'hihat-open': '/samples/drums/hihat-open.wav',
  'clap': '/samples/drums/clap.wav',
  'rim': '/samples/drums/rim.wav',
  '808-kick': '/samples/drums/808-kick.wav',
  'shaker': '/samples/drums/shaker.wav',
};

/**
 * SynthSequencer class - plays note sequences through synth engines with optional drums
 */
export class SynthSequencer {
  private synth: SynthEngineInterface | null = null;
  private drumPlayers: Map<string, Tone.Player> = new Map();
  private drumVolume: Tone.Volume;
  private noteSequence: Tone.Part | null = null;
  private drumPart: Tone.Part | null = null;
  private currentSequence: NoteSequence | null = null;
  private isStarted = false;
  private drumsEnabled = true;
  private noteCallback: ((note: string, index: number) => void) | null = null;
  private currentNoteIndex = 0;

  constructor() {
    // Create drum volume node at -6dB to balance with synth
    this.drumVolume = new Tone.Volume(-6);
    this.drumVolume.toDestination();
  }

  /**
   * Initialize audio and load drum samples (call after user gesture)
   */
  async start(): Promise<void> {
    if (this.isStarted) return;

    await Tone.start();
    await this.loadDrumSamples();
    this.isStarted = true;
  }

  /**
   * Load all drum samples
   */
  private async loadDrumSamples(): Promise<void> {
    const loadPromises = Object.entries(DRUM_SAMPLES).map(async ([name, url]) => {
      const player = new Tone.Player(url);
      player.connect(this.drumVolume);
      await player.load(url);
      this.drumPlayers.set(name, player);
    });

    await Promise.all(loadPromises);
  }

  /**
   * Set the synth engine to play notes through
   */
  setSynth(synth: SynthEngineInterface): void {
    this.synth = synth;
  }

  /**
   * Load a sequence
   */
  loadSequence(sequence: NoteSequence): void {
    // Stop current playback
    this.stop();

    this.currentSequence = sequence;

    // Set tempo
    Tone.Transport.bpm.value = sequence.tempo;

    // Set loop length
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = sequence.loopLength;

    // Create note sequence Part
    this.createNotePart(sequence.notes);

    // Create drum Part if pattern exists and drums are enabled
    if (sequence.drumPattern && sequence.drumPattern.length > 0) {
      this.createDrumPart(sequence.drumPattern);
    }
  }

  /**
   * Create the note Part
   */
  private createNotePart(notes: SequenceNote[]): void {
    if (this.noteSequence) {
      this.noteSequence.dispose();
    }

    // Create note data with indices for callback
    const noteData = notes.map((note, index) => ({
      time: note.time,
      note: note.note,
      duration: note.duration,
      velocity: note.velocity ?? 0.8,
      index,
    }));

    this.noteSequence = new Tone.Part((time, event) => {
      if (this.synth) {
        // Schedule the note
        this.synth.triggerAttackRelease(event.note, event.duration);
      }

      // Schedule the UI callback on the animation frame
      if (this.noteCallback) {
        Tone.Draw.schedule(() => {
          this.currentNoteIndex = event.index;
          this.noteCallback?.(event.note, event.index);
        }, time);
      }
    }, noteData);

    this.noteSequence.start(0);
  }

  /**
   * Create the drum Part
   */
  private createDrumPart(pattern: DrumPatternStep[]): void {
    if (this.drumPart) {
      this.drumPart.dispose();
    }

    this.drumPart = new Tone.Part((time, event) => {
      if (!this.drumsEnabled) return;

      const player = this.drumPlayers.get(event.sample);
      if (player && player.loaded) {
        // Apply velocity as volume
        const velocity = event.velocity ?? 0.8;
        const velocityDb = velocity > 0 ? 20 * Math.log10(velocity) : -Infinity;
        player.volume.value = velocityDb;
        player.start(time);
      }
    }, pattern.map(step => ({
      time: step.time,
      sample: step.sample,
      velocity: step.velocity,
    })));

    this.drumPart.start(0);
  }

  /**
   * Start playback
   */
  play(): void {
    if (!this.currentSequence) return;

    Tone.Transport.start();
  }

  /**
   * Stop playback
   */
  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.currentNoteIndex = 0;

    // Notify UI of reset
    if (this.noteCallback) {
      this.noteCallback('', -1);
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    Tone.Transport.pause();
  }

  /**
   * Toggle drums on/off
   */
  setDrumsEnabled(enabled: boolean): void {
    this.drumsEnabled = enabled;
  }

  /**
   * Get drums enabled state
   */
  getDrumsEnabled(): boolean {
    return this.drumsEnabled;
  }

  /**
   * Set tempo
   */
  setTempo(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
    if (this.currentSequence) {
      this.currentSequence.tempo = bpm;
    }
  }

  /**
   * Get current tempo
   */
  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  /**
   * Get current sequence
   */
  getCurrentSequence(): NoteSequence | null {
    return this.currentSequence;
  }

  /**
   * Get current note index
   */
  getCurrentNoteIndex(): number {
    return this.currentNoteIndex;
  }

  /**
   * Check if playing
   */
  get playing(): boolean {
    return Tone.Transport.state === 'started';
  }

  /**
   * Check if loaded
   */
  get loaded(): boolean {
    return this.isStarted;
  }

  /**
   * Register callback for note changes (for UI)
   */
  onNoteChange(callback: (note: string, index: number) => void): void {
    this.noteCallback = callback;
  }

  /**
   * Remove note change callback
   */
  offNoteChange(): void {
    this.noteCallback = null;
  }

  /**
   * Set drum volume in dB
   */
  setDrumVolume(db: number): void {
    this.drumVolume.volume.value = db;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.stop();

    if (this.noteSequence) {
      this.noteSequence.dispose();
      this.noteSequence = null;
    }

    if (this.drumPart) {
      this.drumPart.dispose();
      this.drumPart = null;
    }

    this.drumPlayers.forEach(player => player.dispose());
    this.drumPlayers.clear();

    this.drumVolume.dispose();

    this.noteCallback = null;
    this.synth = null;
    this.currentSequence = null;
  }
}

/**
 * Creates a new synth sequencer instance
 */
export function createSynthSequencer(): SynthSequencer {
  return new SynthSequencer();
}
