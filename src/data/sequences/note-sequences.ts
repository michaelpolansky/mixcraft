/**
 * Built-in note sequences for the synth sequencer
 * Inspired by Ableton Learning Synths patterns
 */

import type { NoteSequence, DrumPatternStep } from '../../core/types.ts';

/**
 * Basic drum pattern for most sequences
 * Kick on 1 and 3, snare on 2 and 4, hi-hat on all eighth notes
 */
const BASIC_DRUM_PATTERN: DrumPatternStep[] = [
  // Kick on 1 and 3
  { time: '0:0:0', sample: 'kick', velocity: 1 },
  { time: '0:2:0', sample: 'kick', velocity: 0.9 },
  // Snare on 2 and 4
  { time: '0:1:0', sample: 'snare', velocity: 0.9 },
  { time: '0:3:0', sample: 'snare', velocity: 0.9 },
  // Hi-hat on eighth notes
  { time: '0:0:0', sample: 'hihat-closed', velocity: 0.6 },
  { time: '0:0:2', sample: 'hihat-closed', velocity: 0.4 },
  { time: '0:1:0', sample: 'hihat-closed', velocity: 0.5 },
  { time: '0:1:2', sample: 'hihat-closed', velocity: 0.4 },
  { time: '0:2:0', sample: 'hihat-closed', velocity: 0.5 },
  { time: '0:2:2', sample: 'hihat-closed', velocity: 0.4 },
  { time: '0:3:0', sample: 'hihat-closed', velocity: 0.5 },
  { time: '0:3:2', sample: 'hihat-closed', velocity: 0.4 },
];

/**
 * Four on the floor drum pattern
 * Kick on every beat, open hi-hat on upbeats
 */
const FOUR_ON_FLOOR_DRUMS: DrumPatternStep[] = [
  // Kick on every beat
  { time: '0:0:0', sample: 'kick', velocity: 1 },
  { time: '0:1:0', sample: 'kick', velocity: 0.95 },
  { time: '0:2:0', sample: 'kick', velocity: 0.95 },
  { time: '0:3:0', sample: 'kick', velocity: 0.95 },
  // Clap on 2 and 4
  { time: '0:1:0', sample: 'clap', velocity: 0.8 },
  { time: '0:3:0', sample: 'clap', velocity: 0.8 },
  // Open hi-hat on upbeats
  { time: '0:0:2', sample: 'hihat-open', velocity: 0.5 },
  { time: '0:1:2', sample: 'hihat-open', velocity: 0.5 },
  { time: '0:2:2', sample: 'hihat-open', velocity: 0.5 },
  { time: '0:3:2', sample: 'hihat-open', velocity: 0.5 },
];

/**
 * Slow groove drum pattern
 */
const SLOW_DRUMS: DrumPatternStep[] = [
  { time: '0:0:0', sample: '808-kick', velocity: 1 },
  { time: '0:2:0', sample: '808-kick', velocity: 0.8 },
  { time: '0:1:0', sample: 'snare', velocity: 0.85 },
  { time: '0:3:0', sample: 'snare', velocity: 0.85 },
  { time: '0:0:2', sample: 'hihat-closed', velocity: 0.35 },
  { time: '0:1:2', sample: 'hihat-closed', velocity: 0.35 },
  { time: '0:2:2', sample: 'hihat-closed', velocity: 0.35 },
  { time: '0:3:2', sample: 'hihat-closed', velocity: 0.35 },
  { time: '0:3:3', sample: 'rim', velocity: 0.5 },
];

/**
 * 1. No Downbeat - syncopated rhythm avoiding beat 1
 */
const NO_DOWNBEAT: NoteSequence = {
  id: 'no-downbeat',
  name: 'No Downbeat',
  tempo: 110,
  loopLength: '1m',
  withDrums: true,
  drumPattern: BASIC_DRUM_PATTERN,
  notes: [
    { time: '0:0:2', note: 'E4', duration: '8n' },
    { time: '0:1:0', note: 'G4', duration: '8n' },
    { time: '0:1:2', note: 'A4', duration: '8n' },
    { time: '0:2:2', note: 'B4', duration: '8n' },
    { time: '0:3:0', note: 'G4', duration: '8n' },
    { time: '0:3:2', note: 'E4', duration: '8n' },
  ],
};

/**
 * 2. Legato Lead - long connected notes
 */
const LEGATO_LEAD: NoteSequence = {
  id: 'legato-lead',
  name: 'Legato Lead',
  tempo: 100,
  loopLength: '2m',
  withDrums: true,
  drumPattern: [
    ...BASIC_DRUM_PATTERN,
    // Second measure
    { time: '1:0:0', sample: 'kick', velocity: 1 },
    { time: '1:2:0', sample: 'kick', velocity: 0.9 },
    { time: '1:1:0', sample: 'snare', velocity: 0.9 },
    { time: '1:3:0', sample: 'snare', velocity: 0.9 },
    { time: '1:0:0', sample: 'hihat-closed', velocity: 0.6 },
    { time: '1:0:2', sample: 'hihat-closed', velocity: 0.4 },
    { time: '1:1:0', sample: 'hihat-closed', velocity: 0.5 },
    { time: '1:1:2', sample: 'hihat-closed', velocity: 0.4 },
    { time: '1:2:0', sample: 'hihat-closed', velocity: 0.5 },
    { time: '1:2:2', sample: 'hihat-closed', velocity: 0.4 },
    { time: '1:3:0', sample: 'hihat-closed', velocity: 0.5 },
    { time: '1:3:2', sample: 'hihat-closed', velocity: 0.4 },
  ],
  notes: [
    { time: '0:0:0', note: 'C4', duration: '2n', velocity: 0.9 },
    { time: '0:2:0', note: 'E4', duration: '2n', velocity: 0.85 },
    { time: '1:0:0', note: 'G4', duration: '2n', velocity: 0.9 },
    { time: '1:2:0', note: 'E4', duration: '2n', velocity: 0.85 },
  ],
};

/**
 * 3. Midtempo - moderate pace groove
 */
const MIDTEMPO: NoteSequence = {
  id: 'midtempo',
  name: 'Midtempo',
  tempo: 105,
  loopLength: '1m',
  withDrums: true,
  drumPattern: BASIC_DRUM_PATTERN,
  notes: [
    { time: '0:0:0', note: 'D4', duration: '8n', velocity: 0.9 },
    { time: '0:0:2', note: 'F4', duration: '8n', velocity: 0.7 },
    { time: '0:1:0', note: 'A4', duration: '4n', velocity: 0.85 },
    { time: '0:2:0', note: 'G4', duration: '8n', velocity: 0.8 },
    { time: '0:2:2', note: 'F4', duration: '8n', velocity: 0.7 },
    { time: '0:3:0', note: 'D4', duration: '4n', velocity: 0.85 },
  ],
};

/**
 * 4. Simple Bassline - foundational bass pattern
 */
const SIMPLE_BASSLINE: NoteSequence = {
  id: 'simple-bassline',
  name: 'Simple Bassline',
  tempo: 115,
  loopLength: '1m',
  withDrums: true,
  drumPattern: BASIC_DRUM_PATTERN,
  notes: [
    { time: '0:0:0', note: 'E2', duration: '8n', velocity: 1 },
    { time: '0:0:2', note: 'E2', duration: '16n', velocity: 0.6 },
    { time: '0:1:0', note: 'E3', duration: '8n', velocity: 0.8 },
    { time: '0:2:0', note: 'D2', duration: '8n', velocity: 0.95 },
    { time: '0:2:2', note: 'D2', duration: '16n', velocity: 0.6 },
    { time: '0:3:0', note: 'G2', duration: '8n', velocity: 0.9 },
    { time: '0:3:2', note: 'A2', duration: '8n', velocity: 0.85 },
  ],
};

/**
 * 5. Slow and Insistent - hypnotic slow pulse
 */
const SLOW_AND_INSISTENT: NoteSequence = {
  id: 'slow-insistent',
  name: 'Slow and Insistent',
  tempo: 75,
  loopLength: '2m',
  withDrums: false,
  notes: [
    { time: '0:0:0', note: 'A3', duration: '2n', velocity: 0.9 },
    { time: '0:2:0', note: 'A3', duration: '4n', velocity: 0.7 },
    { time: '0:3:0', note: 'A3', duration: '4n', velocity: 0.6 },
    { time: '1:0:0', note: 'G3', duration: '2n', velocity: 0.85 },
    { time: '1:2:0', note: 'G3', duration: '4n', velocity: 0.7 },
    { time: '1:3:0', note: 'G3', duration: '4n', velocity: 0.6 },
  ],
};

/**
 * 6. Eleven Fast Notes - rapid-fire sequence
 */
const ELEVEN_FAST_NOTES: NoteSequence = {
  id: 'eleven-fast',
  name: 'Eleven Fast Notes',
  tempo: 130,
  loopLength: '1m',
  withDrums: false,
  notes: [
    { time: '0:0:0', note: 'C4', duration: '16n', velocity: 0.9 },
    { time: '0:0:1', note: 'D4', duration: '16n', velocity: 0.8 },
    { time: '0:0:2', note: 'E4', duration: '16n', velocity: 0.85 },
    { time: '0:0:3', note: 'F4', duration: '16n', velocity: 0.8 },
    { time: '0:1:0', note: 'G4', duration: '16n', velocity: 0.9 },
    { time: '0:1:1', note: 'A4', duration: '16n', velocity: 0.8 },
    { time: '0:1:2', note: 'B4', duration: '16n', velocity: 0.85 },
    { time: '0:2:0', note: 'C5', duration: '16n', velocity: 0.95 },
    { time: '0:2:1', note: 'B4', duration: '16n', velocity: 0.8 },
    { time: '0:2:2', note: 'A4', duration: '16n', velocity: 0.75 },
    { time: '0:2:3', note: 'G4', duration: '2n', velocity: 0.9 },
  ],
};

/**
 * 7. Not Quite Triplets - unusual rhythmic grouping
 */
const NOT_QUITE_TRIPLETS: NoteSequence = {
  id: 'not-quite-triplets',
  name: 'Not Quite Triplets',
  tempo: 95,
  loopLength: '1m',
  withDrums: false,
  notes: [
    { time: '0:0:0', note: 'E4', duration: '8n', velocity: 0.9 },
    { time: '0:0:3', note: 'G4', duration: '8n', velocity: 0.75 },
    { time: '0:1:2', note: 'B4', duration: '8n', velocity: 0.85 },
    { time: '0:2:1', note: 'E5', duration: '8n', velocity: 0.9 },
    { time: '0:3:0', note: 'D5', duration: '8n', velocity: 0.8 },
    { time: '0:3:3', note: 'B4', duration: '8n', velocity: 0.75 },
  ],
};

/**
 * 8. Four on the Floor - classic dance beat
 */
const FOUR_ON_THE_FLOOR: NoteSequence = {
  id: 'four-on-floor',
  name: 'Four on the Floor',
  tempo: 125,
  loopLength: '1m',
  withDrums: true,
  drumPattern: FOUR_ON_FLOOR_DRUMS,
  notes: [
    { time: '0:0:0', note: 'C4', duration: '8n', velocity: 0.9 },
    { time: '0:0:3', note: 'E4', duration: '8n', velocity: 0.7 },
    { time: '0:1:2', note: 'G4', duration: '8n', velocity: 0.8 },
    { time: '0:2:0', note: 'C5', duration: '4n', velocity: 0.85 },
    { time: '0:3:0', note: 'B4', duration: '8n', velocity: 0.75 },
    { time: '0:3:2', note: 'G4', duration: '8n', velocity: 0.7 },
  ],
};

/**
 * 9. Arpeggiated - classic arpeggio pattern
 */
const ARPEGGIATED: NoteSequence = {
  id: 'arpeggiated',
  name: 'Arpeggiated',
  tempo: 120,
  loopLength: '2m',
  withDrums: true,
  drumPattern: [
    ...SLOW_DRUMS,
    // Second measure
    { time: '1:0:0', sample: '808-kick', velocity: 1 },
    { time: '1:2:0', sample: '808-kick', velocity: 0.8 },
    { time: '1:1:0', sample: 'snare', velocity: 0.85 },
    { time: '1:3:0', sample: 'snare', velocity: 0.85 },
    { time: '1:0:2', sample: 'hihat-closed', velocity: 0.35 },
    { time: '1:1:2', sample: 'hihat-closed', velocity: 0.35 },
    { time: '1:2:2', sample: 'hihat-closed', velocity: 0.35 },
    { time: '1:3:2', sample: 'hihat-closed', velocity: 0.35 },
  ],
  notes: [
    // Am chord arpeggio
    { time: '0:0:0', note: 'A3', duration: '16n', velocity: 0.9 },
    { time: '0:0:1', note: 'C4', duration: '16n', velocity: 0.7 },
    { time: '0:0:2', note: 'E4', duration: '16n', velocity: 0.8 },
    { time: '0:0:3', note: 'A4', duration: '16n', velocity: 0.85 },
    { time: '0:1:0', note: 'E4', duration: '16n', velocity: 0.7 },
    { time: '0:1:1', note: 'C4', duration: '16n', velocity: 0.6 },
    { time: '0:1:2', note: 'A3', duration: '16n', velocity: 0.75 },
    { time: '0:1:3', note: 'E3', duration: '16n', velocity: 0.8 },
    // F chord arpeggio
    { time: '0:2:0', note: 'F3', duration: '16n', velocity: 0.9 },
    { time: '0:2:1', note: 'A3', duration: '16n', velocity: 0.7 },
    { time: '0:2:2', note: 'C4', duration: '16n', velocity: 0.8 },
    { time: '0:2:3', note: 'F4', duration: '16n', velocity: 0.85 },
    { time: '0:3:0', note: 'C4', duration: '16n', velocity: 0.7 },
    { time: '0:3:1', note: 'A3', duration: '16n', velocity: 0.6 },
    { time: '0:3:2', note: 'F3', duration: '16n', velocity: 0.75 },
    { time: '0:3:3', note: 'C3', duration: '16n', velocity: 0.8 },
    // G chord arpeggio
    { time: '1:0:0', note: 'G3', duration: '16n', velocity: 0.9 },
    { time: '1:0:1', note: 'B3', duration: '16n', velocity: 0.7 },
    { time: '1:0:2', note: 'D4', duration: '16n', velocity: 0.8 },
    { time: '1:0:3', note: 'G4', duration: '16n', velocity: 0.85 },
    { time: '1:1:0', note: 'D4', duration: '16n', velocity: 0.7 },
    { time: '1:1:1', note: 'B3', duration: '16n', velocity: 0.6 },
    { time: '1:1:2', note: 'G3', duration: '16n', velocity: 0.75 },
    { time: '1:1:3', note: 'D3', duration: '16n', velocity: 0.8 },
    // Em chord arpeggio
    { time: '1:2:0', note: 'E3', duration: '16n', velocity: 0.9 },
    { time: '1:2:1', note: 'G3', duration: '16n', velocity: 0.7 },
    { time: '1:2:2', note: 'B3', duration: '16n', velocity: 0.8 },
    { time: '1:2:3', note: 'E4', duration: '16n', velocity: 0.85 },
    { time: '1:3:0', note: 'B3', duration: '16n', velocity: 0.7 },
    { time: '1:3:1', note: 'G3', duration: '16n', velocity: 0.6 },
    { time: '1:3:2', note: 'E3', duration: '16n', velocity: 0.75 },
    { time: '1:3:3', note: 'B2', duration: '16n', velocity: 0.8 },
  ],
};

/**
 * All available sequences
 */
export const NOTE_SEQUENCES: NoteSequence[] = [
  NO_DOWNBEAT,
  LEGATO_LEAD,
  MIDTEMPO,
  SIMPLE_BASSLINE,
  SLOW_AND_INSISTENT,
  ELEVEN_FAST_NOTES,
  NOT_QUITE_TRIPLETS,
  FOUR_ON_THE_FLOOR,
  ARPEGGIATED,
];

/**
 * Get a sequence by ID
 */
export function getSequenceById(id: string): NoteSequence | undefined {
  return NOTE_SEQUENCES.find(seq => seq.id === id);
}

/**
 * Get sequences that have drum backing
 */
export function getSequencesWithDrums(): NoteSequence[] {
  return NOTE_SEQUENCES.filter(seq => seq.withDrums);
}

/**
 * Get sequences without drum backing
 */
export function getSequencesWithoutDrums(): NoteSequence[] {
  return NOTE_SEQUENCES.filter(seq => !seq.withDrums);
}
