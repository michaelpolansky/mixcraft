/**
 * Consolidated module metadata for MenuView.
 * Does NOT import any challenge data — only lightweight module definitions.
 */

export interface ModuleDef {
  id: string;
  title: string;
  description: string;
  challengeCount: number;
}

// Sound Design modules (SD1-SD17)
export const sdModules: ModuleDef[] = [
  { id: 'SD1', title: 'Oscillator Fundamentals', description: 'Learn the basic waveforms and how they shape the character of a sound.', challengeCount: 4 },
  { id: 'SD2', title: 'Filter Basics', description: 'Shape your sound by removing frequencies. Learn lowpass, highpass, and bandpass filters.', challengeCount: 4 },
  { id: 'SD3', title: 'Envelopes', description: 'Control how sounds evolve over time with Attack, Decay, Sustain, and Release.', challengeCount: 4 },
  { id: 'SD4', title: 'Modulation', description: 'Add movement with LFOs. Create wobbles, warbles, and rhythmic effects.', challengeCount: 4 },
  { id: 'SD5', title: 'Effects', description: 'Shape your sound with distortion, delay, reverb, and chorus.', challengeCount: 4 },
  { id: 'SD6', title: 'Synthesis Techniques', description: 'Master challenges combining oscillators, filters, envelopes, LFO, and effects.', challengeCount: 6 },
  { id: 'SD7', title: 'Genre Sound Design', description: 'Recreate iconic synth sounds from 80s brass to trance supersaws.', challengeCount: 6 },
  { id: 'SD8', title: 'FM Synthesis', description: 'Master frequency modulation to create bells, electric pianos, and metallic sounds.', challengeCount: 12 },
  { id: 'SD9', title: 'Additive Synthesis', description: 'Build sounds from individual harmonics using Fourier synthesis.', challengeCount: 12 },
  { id: 'SD10', title: 'Arpeggiator', description: 'Create rhythmic patterns with the arpeggiator. Control tempo, octaves, and gate.', challengeCount: 6 },
  { id: 'SD11', title: 'Unison & Supersaw', description: 'Stack multiple voices for massive sounds. Master the classic supersaw.', challengeCount: 6 },
  { id: 'SD12', title: 'Oscillator 2', description: 'Layer two oscillators for complex timbres. Explore octaves, detuning, and intervals.', challengeCount: 6 },
  { id: 'SD13', title: 'Sub Oscillator', description: 'Add low-end weight with the sub oscillator. From subtle foundation to 808-style bass.', challengeCount: 6 },
  { id: 'SD14', title: 'Noise Shaping', description: 'Use noise for texture, transients, and atmosphere. White, pink, and brown noise techniques.', challengeCount: 6 },
  { id: 'SD15', title: 'Glide & Portamento', description: 'Add expression with pitch glide between notes. From subtle slides to dramatic sweeps.', challengeCount: 6 },
  { id: 'SD16', title: 'Velocity Sensitivity', description: 'Make your synth respond to how hard you play. Dynamic, expressive sound control.', challengeCount: 6 },
  { id: 'SD17', title: 'Combined Techniques', description: 'Master-level challenges combining everything. Lead, bass, pad, pluck, and the ultimate test.', challengeCount: 6 },
];

// Mixing modules (F1-F8, I1-I6, A1-A5, M1-M4)
export const mixingFundamentalsModules: ModuleDef[] = [
  { id: 'F1', title: 'Frequency Basics', description: 'Learn to hear and adjust low, mid, and high frequencies with a 3-band EQ.', challengeCount: 4 },
  { id: 'F2', title: 'EQ Shaping', description: 'Shape the overall character of sounds by combining EQ moves.', challengeCount: 4 },
  { id: 'F3', title: 'EQ Repair', description: 'Fix common frequency problems: muddy bass, harsh highs, boxy mids.', challengeCount: 4 },
  { id: 'F4', title: 'Compression Basics', description: 'Control dynamics with threshold and amount. Learn to hear compression.', challengeCount: 4 },
  { id: 'F5', title: 'Advanced Compression', description: 'Master attack and release timing for transparent or pumping compression.', challengeCount: 4 },
  { id: 'F6', title: 'Combined Processing', description: 'Use EQ and compression together to shape sounds for different contexts.', challengeCount: 4 },
  { id: 'F7', title: 'Problem Solving', description: 'Diagnose and fix common audio problems: boom, harshness, weak attack.', challengeCount: 4 },
  { id: 'F8', title: 'Mix Balance', description: 'Advanced scenarios: filling the spectrum, sitting in a mix, polishing.', challengeCount: 4 },
];

export const mixingIntermediateModules: ModuleDef[] = [
  { id: 'I1', title: 'Kick & Bass', description: 'Master the relationship between kick and bass with frequency carving and separation.', challengeCount: 6 },
  { id: 'I2', title: 'Vocal Presence', description: 'Make vocals cut through the mix with clarity, warmth, and air.', challengeCount: 6 },
  { id: 'I3', title: 'Drum Punch', description: 'Make drums hit hard with punch, crack, and impact.', challengeCount: 6 },
  { id: 'I4', title: 'Stereo Width', description: 'Create width and depth by mastering stereo imaging and panning.', challengeCount: 6 },
  { id: 'I5', title: 'Depth & Space', description: 'Use reverb to create front-to-back depth and a three-dimensional soundstage.', challengeCount: 6 },
  { id: 'I6', title: 'Level Balance', description: 'Master volume relationships to create professional-sounding mixes.', challengeCount: 6 },
  { id: 'I7', title: 'Track Dynamics', description: 'Control dynamics on individual tracks with per-track compression.', challengeCount: 6 },
];

export const mixingAdvancedModules: ModuleDef[] = [
  { id: 'A1', title: 'Full Drum Mix', description: 'Master the complete drum mix using all your tools: EQ, compression, panning, and reverb.', challengeCount: 8 },
  { id: 'A2', title: 'Full Vocal Chain', description: 'Build professional vocal processing: clarity, warmth, air, dynamics, and space.', challengeCount: 8 },
  { id: 'A3', title: 'Instrument Balance', description: 'Balance multiple instruments in a mix: drums, bass, guitars, keys, and full bands.', challengeCount: 8 },
  { id: 'A4', title: 'Mix Bus Processing', description: 'Process the entire mix with bus compression and EQ for polish and cohesion.', challengeCount: 8 },
  { id: 'A5', title: 'Genre-Specific Mixing', description: 'Apply genre-appropriate mixing techniques: rock, pop, hip-hop, EDM, R&B, and more.', challengeCount: 8 },
];

export const mixingMasteryModules: ModuleDef[] = [
  { id: 'M1', title: 'Complete Song Mixing', description: 'Mix a complete song from scratch, applying all techniques in a professional workflow.', challengeCount: 10 },
  { id: 'M2', title: 'Mastering Basics', description: 'Prepare mixes for release with tonal balance, compression, and final polish.', challengeCount: 6 },
  { id: 'M3', title: 'Reference Matching', description: 'Match the sound of professional references: frequency balance, dynamics, width, and depth.', challengeCount: 6 },
  { id: 'M4', title: 'Troubleshooting', description: 'Diagnose and fix common mix problems: mud, harshness, thinness, clutter, and imbalance.', challengeCount: 6 },
];

// Production modules (P1-P5)
export const productionModules: ModuleDef[] = [
  { id: 'P1', title: 'Frequency Stacking', description: 'Learn to balance elements in their own frequency ranges using volume and mute.', challengeCount: 4 },
  { id: 'P2', title: 'Layering', description: 'Combine multiple layers to create rich, cohesive sounds.', challengeCount: 4 },
  { id: 'P3', title: 'Arrangement Energy', description: 'Control energy and dynamics with muting and panning.', challengeCount: 4 },
  { id: 'P4', title: 'Rhythm and Groove', description: 'Build solid grooves with proper stereo placement.', challengeCount: 4 },
  { id: 'P5', title: 'Space and Depth', description: 'Create 3D soundstages using EQ for depth and pan for width.', challengeCount: 4 },
];

// Sampling modules (SM1-SM6)
export const samplingModules: ModuleDef[] = [
  { id: 'SM1', title: 'Sample Basics', description: 'Learn to load, play, and manipulate samples. The fundamentals of sampling.', challengeCount: 4 },
  { id: 'SM2', title: 'Building Instruments', description: 'Create playable instruments from samples. Drum kits, key mapping, and velocity layers.', challengeCount: 4 },
  { id: 'SM3', title: 'Time & Pitch', description: 'Master time stretching and pitch shifting. Match samples to any tempo or key.', challengeCount: 4 },
  { id: 'SM4', title: 'Chopping', description: 'Slice samples into playable parts. Chop breaks, vocals, and create new patterns.', challengeCount: 4 },
  { id: 'SM5', title: 'Flipping', description: 'Transform samples into something new. Rearrange, reverse, and reimagine.', challengeCount: 4 },
  { id: 'SM6', title: 'Polish & Clean', description: 'Clean up samples for professional results. Trim, fade, normalize, and loop.', challengeCount: 4 },
];

// Drum Sequencing modules (DS1-DS6)
export const drumSequencingModules: ModuleDef[] = [
  { id: 'DS1', title: 'Grid Basics', description: 'Learn the fundamentals of drum programming. Kick, snare, and hi-hat placement.', challengeCount: 4 },
  { id: 'DS2', title: 'Hi-hats & Percussion', description: 'Master hi-hat patterns from eighth notes to complex open/closed combinations.', challengeCount: 4 },
  { id: 'DS3', title: 'Groove & Swing', description: 'Add feel to your beats with swing and groove. Learn what makes drums "feel" good.', challengeCount: 4 },
  { id: 'DS4', title: 'Velocity & Dynamics', description: 'Bring your patterns to life with velocity variation. Accents, ghost notes, and dynamics.', challengeCount: 4 },
  { id: 'DS5', title: 'Genre Patterns', description: 'Program authentic patterns from hip-hop to house, trap to funk breakbeats.', challengeCount: 4 },
  { id: 'DS6', title: 'Loop Construction', description: 'Build complete loops with fills, variations, and transitions.', challengeCount: 4 },
];
