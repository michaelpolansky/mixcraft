/**
 * Mixing Challenge Registry
 * Central index for mixing fundamentals challenges
 */

import type { MixingChallenge } from '../../../core/types.ts';

// F1 - Frequency Basics
import { challenge as f1_01 } from './f1/f1-01-low-boost.ts';
import { challenge as f1_02 } from './f1/f1-02-high-cut.ts';
import { challenge as f1_03 } from './f1/f1-03-mid-scoop.ts';
import { challenge as f1_04 } from './f1/f1-04-presence-boost.ts';

// F2 - EQ Shaping
import { challenge as f2_01 } from './f2/f2-01-warm-it-up.ts';
import { challenge as f2_02 } from './f2/f2-02-add-brightness.ts';
import { challenge as f2_03 } from './f2/f2-03-smiley-curve.ts';
import { challenge as f2_04 } from './f2/f2-04-telephone-effect.ts';

// F3 - EQ Repair
import { challenge as f3_01 } from './f3/f3-01-muddy-bass.ts';
import { challenge as f3_02 } from './f3/f3-02-harsh-highs.ts';
import { challenge as f3_03 } from './f3/f3-03-boxy-mids.ts';
import { challenge as f3_04 } from './f3/f3-04-thin-tone.ts';

// F4 - Compression Basics
import { challenge as f4_01 } from './f4/f4-01-gentle-squeeze.ts';
import { challenge as f4_02 } from './f4/f4-02-tame-the-peaks.ts';
import { challenge as f4_03 } from './f4/f4-03-heavy-squeeze.ts';
import { challenge as f4_04 } from './f4/f4-04-parallel-punch.ts';

// F5 - Advanced Compression
import { challenge as f5_01 } from './f5/f5-01-snappy-attack.ts';
import { challenge as f5_02 } from './f5/f5-02-let-it-breathe.ts';
import { challenge as f5_03 } from './f5/f5-03-pump-and-release.ts';
import { challenge as f5_04 } from './f5/f5-04-smooth-sustain.ts';

// F6 - Combined Processing
import { challenge as f6_01 } from './f6/f6-01-punchy-bass.ts';
import { challenge as f6_02 } from './f6/f6-02-bright-drums.ts';
import { challenge as f6_03 } from './f6/f6-03-warm-pad.ts';
import { challenge as f6_04 } from './f6/f6-04-radio-ready.ts';

// F7 - Problem Solving
import { challenge as f7_01 } from './f7/f7-01-fix-the-boom.ts';
import { challenge as f7_02 } from './f7/f7-02-tame-the-harsh.ts';
import { challenge as f7_03 } from './f7/f7-03-unbury-the-attack.ts';
import { challenge as f7_04 } from './f7/f7-04-control-the-dynamics.ts';

// F8 - Mix Balance
import { challenge as f8_01 } from './f8/f8-01-fill-the-spectrum.ts';
import { challenge as f8_02 } from './f8/f8-02-make-it-sit.ts';
import { challenge as f8_03 } from './f8/f8-03-punch-through.ts';
import { challenge as f8_04 } from './f8/f8-04-polish-and-glue.ts';

// I1 - Kick and Bass Relationship
import { challenge as i1_01 } from './i1/i1-01-carve-the-low-end.ts';
import { challenge as i1_02 } from './i1/i1-02-bass-clarity.ts';
import { challenge as i1_03 } from './i1/i1-03-punch-and-weight.ts';
import { challenge as i1_04 } from './i1/i1-04-sub-stack.ts';
import { challenge as i1_05 } from './i1/i1-05-click-and-growl.ts';
import { challenge as i1_06 } from './i1/i1-06-lock-it-in.ts';

// I2 - Vocal Presence and Clarity
import { challenge as i2_01 } from './i2/i2-01-cut-through.ts';
import { challenge as i2_02 } from './i2/i2-02-warm-vocals.ts';
import { challenge as i2_03 } from './i2/i2-03-de-mud.ts';
import { challenge as i2_04 } from './i2/i2-04-air-and-sparkle.ts';
import { challenge as i2_05 } from './i2/i2-05-vocal-pocket.ts';
import { challenge as i2_06 } from './i2/i2-06-lead-vocal-mix.ts';

// I3 - Drum Punch and Impact
import { challenge as i3_01 } from './i3/i3-01-kick-punch.ts';
import { challenge as i3_02 } from './i3/i3-02-snare-crack.ts';
import { challenge as i3_03 } from './i3/i3-03-snare-body.ts';
import { challenge as i3_04 } from './i3/i3-04-hihat-sizzle.ts';
import { challenge as i3_05 } from './i3/i3-05-drum-balance.ts';
import { challenge as i3_06 } from './i3/i3-06-punchy-kit.ts';

// I4 - Stereo Width and Imaging
import { challenge as i4_01 } from './i4/i4-01-center-the-foundation.ts';
import { challenge as i4_02 } from './i4/i4-02-wide-guitars.ts';
import { challenge as i4_03 } from './i4/i4-03-vocal-center-stage.ts';
import { challenge as i4_04 } from './i4/i4-04-drum-kit-imaging.ts';
import { challenge as i4_05 } from './i4/i4-05-stereo-balance.ts';
import { challenge as i4_06 } from './i4/i4-06-full-stereo-image.ts';

// I5 - Depth and Space
import { challenge as i5_01 } from './i5/i5-01-dry-vocals.ts';
import { challenge as i5_02 } from './i5/i5-02-push-it-back.ts';
import { challenge as i5_03 } from './i5/i5-03-depth-layers.ts';
import { challenge as i5_04 } from './i5/i5-04-drum-room.ts';
import { challenge as i5_05 } from './i5/i5-05-front-and-back.ts';
import { challenge as i5_06 } from './i5/i5-06-three-dimensional-mix.ts';

// I6 - Balance and Level Relationships
import { challenge as i6_01 } from './i6/i6-01-vocal-on-top.ts';
import { challenge as i6_02 } from './i6/i6-02-rhythm-section.ts';
import { challenge as i6_03 } from './i6/i6-03-drum-hierarchy.ts';
import { challenge as i6_04 } from './i6/i6-04-lead-and-rhythm.ts';
import { challenge as i6_05 } from './i6/i6-05-headroom.ts';
import { challenge as i6_06 } from './i6/i6-06-full-band-balance.ts';

// I7 - Track Dynamics
import { challenge as i7_01 } from './i7/i7-01-tame-the-vocal.ts';
import { challenge as i7_02 } from './i7/i7-02-drum-control.ts';
import { challenge as i7_03 } from './i7/i7-03-bass-consistency.ts';
import { challenge as i7_04 } from './i7/i7-04-dynamic-contrast.ts';
import { challenge as i7_05 } from './i7/i7-05-rhythm-vs-melody.ts';
import { challenge as i7_06 } from './i7/i7-06-dynamics-master.ts';

// A1 - Full Drum Mix
import { challenge as a1_01 } from './a1/a1-01-kit-foundation.ts';
import { challenge as a1_02 } from './a1/a1-02-punch-and-crack.ts';
import { challenge as a1_03 } from './a1/a1-03-tame-the-hat.ts';
import { challenge as a1_04 } from './a1/a1-04-drum-bus-glue.ts';
import { challenge as a1_05 } from './a1/a1-05-stereo-kit.ts';
import { challenge as a1_06 } from './a1/a1-06-room-sound.ts';
import { challenge as a1_07 } from './a1/a1-07-full-drum-processing.ts';
import { challenge as a1_08 } from './a1/a1-08-punchy-kit-master.ts';

// A2 - Full Vocal Chain
import { challenge as a2_01 } from './a2/a2-01-vocal-clarity.ts';
import { challenge as a2_02 } from './a2/a2-02-vocal-warmth.ts';
import { challenge as a2_03 } from './a2/a2-03-vocal-air.ts';
import { challenge as a2_04 } from './a2/a2-04-vocal-dynamics.ts';
import { challenge as a2_05 } from './a2/a2-05-vocal-space.ts';
import { challenge as a2_06 } from './a2/a2-06-vocal-in-the-mix.ts';
import { challenge as a2_07 } from './a2/a2-07-full-vocal-chain.ts';
import { challenge as a2_08 } from './a2/a2-08-lead-vocal-master.ts';

// A3 - Instrument Balance
import { challenge as a3_01 } from './a3/a3-01-drum-kit-balance.ts';
import { challenge as a3_02 } from './a3/a3-02-bass-kick-relationship.ts';
import { challenge as a3_03 } from './a3/a3-03-rhythm-section.ts';
import { challenge as a3_04 } from './a3/a3-04-guitar-stacking.ts';
import { challenge as a3_05 } from './a3/a3-05-keys-and-pads.ts';
import { challenge as a3_06 } from './a3/a3-06-full-band-balance.ts';
import { challenge as a3_07 } from './a3/a3-07-lead-and-rhythm.ts';
import { challenge as a3_08 } from './a3/a3-08-complete-instrument-balance.ts';

// A4 - Mix Bus Processing
import { challenge as a4_01 } from './a4/a4-01-bus-glue.ts';
import { challenge as a4_02 } from './a4/a4-02-bus-eq-warmth.ts';
import { challenge as a4_03 } from './a4/a4-03-bus-eq-air.ts';
import { challenge as a4_04 } from './a4/a4-04-tame-the-lows.ts';
import { challenge as a4_05 } from './a4/a4-05-punch-and-glue.ts';
import { challenge as a4_06 } from './a4/a4-06-mix-bus-width.ts';
import { challenge as a4_07 } from './a4/a4-07-mix-bus-depth.ts';
import { challenge as a4_08 } from './a4/a4-08-complete-bus-chain.ts';

// A5 - Genre-Specific Mixing
import { challenge as a5_01 } from './a5/a5-01-rock-punch.ts';
import { challenge as a5_02 } from './a5/a5-02-pop-polish.ts';
import { challenge as a5_03 } from './a5/a5-03-hip-hop-low-end.ts';
import { challenge as a5_04 } from './a5/a5-04-edm-width.ts';
import { challenge as a5_05 } from './a5/a5-05-rnb-warmth.ts';
import { challenge as a5_06 } from './a5/a5-06-acoustic-natural.ts';
import { challenge as a5_07 } from './a5/a5-07-metal-wall.ts';
import { challenge as a5_08 } from './a5/a5-08-genre-master.ts';

// M1 - Complete Song Mixing
import { challenge as m1_01 } from './m1/m1-01-start-with-drums.ts';
import { challenge as m1_02 } from './m1/m1-02-add-the-bass.ts';
import { challenge as m1_03 } from './m1/m1-03-rhythm-section-lock.ts';
import { challenge as m1_04 } from './m1/m1-04-harmonic-foundation.ts';
import { challenge as m1_05 } from './m1/m1-05-bring-in-the-vocal.ts';
import { challenge as m1_06 } from './m1/m1-06-create-width.ts';
import { challenge as m1_07 } from './m1/m1-07-add-depth.ts';
import { challenge as m1_08 } from './m1/m1-08-bus-polish.ts';
import { challenge as m1_09 } from './m1/m1-09-final-balance.ts';
import { challenge as m1_10 } from './m1/m1-10-complete-song-mix.ts';

// M2 - Mastering Basics
import { challenge as m2_01 } from './m2/m2-01-tonal-balance.ts';
import { challenge as m2_02 } from './m2/m2-02-glue-compression.ts';
import { challenge as m2_03 } from './m2/m2-03-low-end-control.ts';
import { challenge as m2_04 } from './m2/m2-04-high-end-sparkle.ts';
import { challenge as m2_05 } from './m2/m2-05-stereo-check.ts';
import { challenge as m2_06 } from './m2/m2-06-final-master.ts';

// M3 - Reference Matching
import { challenge as m3_01 } from './m3/m3-01-match-the-lows.ts';
import { challenge as m3_02 } from './m3/m3-02-match-the-brightness.ts';
import { challenge as m3_03 } from './m3/m3-03-match-the-width.ts';
import { challenge as m3_04 } from './m3/m3-04-match-the-depth.ts';
import { challenge as m3_05 } from './m3/m3-05-match-the-punch.ts';
import { challenge as m3_06 } from './m3/m3-06-complete-reference-match.ts';

// M4 - Troubleshooting
import { challenge as m4_01 } from './m4/m4-01-fix-the-mud.ts';
import { challenge as m4_02 } from './m4/m4-02-fix-the-harshness.ts';
import { challenge as m4_03 } from './m4/m4-03-fix-the-thinness.ts';
import { challenge as m4_04 } from './m4/m4-04-fix-the-clutter.ts';
import { challenge as m4_05 } from './m4/m4-05-fix-the-imbalance.ts';
import { challenge as m4_06 } from './m4/m4-06-complete-troubleshoot.ts';

/**
 * All mixing challenges indexed by ID
 */
export const mixingChallengesById: Record<string, MixingChallenge> = {
  'f1-01-low-boost': f1_01,
  'f1-02-high-cut': f1_02,
  'f1-03-mid-scoop': f1_03,
  'f1-04-presence-boost': f1_04,
  'f2-01-warm-it-up': f2_01,
  'f2-02-add-brightness': f2_02,
  'f2-03-smiley-curve': f2_03,
  'f2-04-telephone-effect': f2_04,
  'f3-01-muddy-bass': f3_01,
  'f3-02-harsh-highs': f3_02,
  'f3-03-boxy-mids': f3_03,
  'f3-04-thin-tone': f3_04,
  'f4-01-gentle-squeeze': f4_01,
  'f4-02-tame-the-peaks': f4_02,
  'f4-03-heavy-squeeze': f4_03,
  'f4-04-parallel-punch': f4_04,
  'f5-01-snappy-attack': f5_01,
  'f5-02-let-it-breathe': f5_02,
  'f5-03-pump-and-release': f5_03,
  'f5-04-smooth-sustain': f5_04,
  'f6-01-punchy-bass': f6_01,
  'f6-02-bright-drums': f6_02,
  'f6-03-warm-pad': f6_03,
  'f6-04-radio-ready': f6_04,
  'f7-01-fix-the-boom': f7_01,
  'f7-02-tame-the-harsh': f7_02,
  'f7-03-unbury-the-attack': f7_03,
  'f7-04-control-the-dynamics': f7_04,
  'f8-01-fill-the-spectrum': f8_01,
  'f8-02-make-it-sit': f8_02,
  'f8-03-punch-through': f8_03,
  'f8-04-polish-and-glue': f8_04,
  // I1 - Kick and Bass Relationship
  'i1-01-carve-the-low-end': i1_01,
  'i1-02-bass-clarity': i1_02,
  'i1-03-punch-and-weight': i1_03,
  'i1-04-sub-stack': i1_04,
  'i1-05-click-and-growl': i1_05,
  'i1-06-lock-it-in': i1_06,
  // I2 - Vocal Presence and Clarity
  'i2-01-cut-through': i2_01,
  'i2-02-warm-vocals': i2_02,
  'i2-03-de-mud': i2_03,
  'i2-04-air-and-sparkle': i2_04,
  'i2-05-vocal-pocket': i2_05,
  'i2-06-lead-vocal-mix': i2_06,
  // I3 - Drum Punch and Impact
  'i3-01-kick-punch': i3_01,
  'i3-02-snare-crack': i3_02,
  'i3-03-snare-body': i3_03,
  'i3-04-hihat-sizzle': i3_04,
  'i3-05-drum-balance': i3_05,
  'i3-06-punchy-kit': i3_06,
  // I4 - Stereo Width and Imaging
  'i4-01-center-the-foundation': i4_01,
  'i4-02-wide-guitars': i4_02,
  'i4-03-vocal-center-stage': i4_03,
  'i4-04-drum-kit-imaging': i4_04,
  'i4-05-stereo-balance': i4_05,
  'i4-06-full-stereo-image': i4_06,
  // I5 - Depth and Space
  'i5-01-dry-vocals': i5_01,
  'i5-02-push-it-back': i5_02,
  'i5-03-depth-layers': i5_03,
  'i5-04-drum-room': i5_04,
  'i5-05-front-and-back': i5_05,
  'i5-06-three-dimensional-mix': i5_06,
  // I6 - Balance and Level Relationships
  'i6-01-vocal-on-top': i6_01,
  'i6-02-rhythm-section': i6_02,
  'i6-03-drum-hierarchy': i6_03,
  'i6-04-lead-and-rhythm': i6_04,
  'i6-05-headroom': i6_05,
  'i6-06-full-band-balance': i6_06,
  // I7 - Track Dynamics
  'i7-01-tame-the-vocal': i7_01,
  'i7-02-drum-control': i7_02,
  'i7-03-bass-consistency': i7_03,
  'i7-04-dynamic-contrast': i7_04,
  'i7-05-rhythm-vs-melody': i7_05,
  'i7-06-dynamics-master': i7_06,
  // A1 - Full Drum Mix
  'a1-01-kit-foundation': a1_01,
  'a1-02-punch-and-crack': a1_02,
  'a1-03-tame-the-hat': a1_03,
  'a1-04-drum-bus-glue': a1_04,
  'a1-05-stereo-kit': a1_05,
  'a1-06-room-sound': a1_06,
  'a1-07-full-drum-processing': a1_07,
  'a1-08-punchy-kit-master': a1_08,
  // A2 - Full Vocal Chain
  'a2-01-vocal-clarity': a2_01,
  'a2-02-vocal-warmth': a2_02,
  'a2-03-vocal-air': a2_03,
  'a2-04-vocal-dynamics': a2_04,
  'a2-05-vocal-space': a2_05,
  'a2-06-vocal-in-the-mix': a2_06,
  'a2-07-full-vocal-chain': a2_07,
  'a2-08-lead-vocal-master': a2_08,
  // A3 - Instrument Balance
  'a3-01-drum-kit-balance': a3_01,
  'a3-02-bass-kick-relationship': a3_02,
  'a3-03-rhythm-section': a3_03,
  'a3-04-guitar-stacking': a3_04,
  'a3-05-keys-and-pads': a3_05,
  'a3-06-full-band-balance': a3_06,
  'a3-07-lead-and-rhythm': a3_07,
  'a3-08-complete-instrument-balance': a3_08,
  // A4 - Mix Bus Processing
  'a4-01-bus-glue': a4_01,
  'a4-02-bus-eq-warmth': a4_02,
  'a4-03-bus-eq-air': a4_03,
  'a4-04-tame-the-lows': a4_04,
  'a4-05-punch-and-glue': a4_05,
  'a4-06-mix-bus-width': a4_06,
  'a4-07-mix-bus-depth': a4_07,
  'a4-08-complete-bus-chain': a4_08,
  // A5 - Genre-Specific Mixing
  'a5-01-rock-punch': a5_01,
  'a5-02-pop-polish': a5_02,
  'a5-03-hip-hop-low-end': a5_03,
  'a5-04-edm-width': a5_04,
  'a5-05-rnb-warmth': a5_05,
  'a5-06-acoustic-natural': a5_06,
  'a5-07-metal-wall': a5_07,
  'a5-08-genre-master': a5_08,
  // M1 - Complete Song Mixing
  'm1-01-start-with-drums': m1_01,
  'm1-02-add-the-bass': m1_02,
  'm1-03-rhythm-section-lock': m1_03,
  'm1-04-harmonic-foundation': m1_04,
  'm1-05-bring-in-the-vocal': m1_05,
  'm1-06-create-width': m1_06,
  'm1-07-add-depth': m1_07,
  'm1-08-bus-polish': m1_08,
  'm1-09-final-balance': m1_09,
  'm1-10-complete-song-mix': m1_10,
  // M2 - Mastering Basics
  'm2-01-tonal-balance': m2_01,
  'm2-02-glue-compression': m2_02,
  'm2-03-low-end-control': m2_03,
  'm2-04-high-end-sparkle': m2_04,
  'm2-05-stereo-check': m2_05,
  'm2-06-final-master': m2_06,
  // M3 - Reference Matching
  'm3-01-match-the-lows': m3_01,
  'm3-02-match-the-brightness': m3_02,
  'm3-03-match-the-width': m3_03,
  'm3-04-match-the-depth': m3_04,
  'm3-05-match-the-punch': m3_05,
  'm3-06-complete-reference-match': m3_06,
  // M4 - Troubleshooting
  'm4-01-fix-the-mud': m4_01,
  'm4-02-fix-the-harshness': m4_02,
  'm4-03-fix-the-thinness': m4_03,
  'm4-04-fix-the-clutter': m4_04,
  'm4-05-fix-the-imbalance': m4_05,
  'm4-06-complete-troubleshoot': m4_06,
};

/**
 * Mixing challenges grouped by module
 */
export const mixingChallengesByModule: Record<string, MixingChallenge[]> = {
  F1: [f1_01, f1_02, f1_03, f1_04],
  F2: [f2_01, f2_02, f2_03, f2_04],
  F3: [f3_01, f3_02, f3_03, f3_04],
  F4: [f4_01, f4_02, f4_03, f4_04],
  F5: [f5_01, f5_02, f5_03, f5_04],
  F6: [f6_01, f6_02, f6_03, f6_04],
  F7: [f7_01, f7_02, f7_03, f7_04],
  F8: [f8_01, f8_02, f8_03, f8_04],
  I1: [i1_01, i1_02, i1_03, i1_04, i1_05, i1_06],
  I2: [i2_01, i2_02, i2_03, i2_04, i2_05, i2_06],
  I3: [i3_01, i3_02, i3_03, i3_04, i3_05, i3_06],
  I4: [i4_01, i4_02, i4_03, i4_04, i4_05, i4_06],
  I5: [i5_01, i5_02, i5_03, i5_04, i5_05, i5_06],
  I6: [i6_01, i6_02, i6_03, i6_04, i6_05, i6_06],
  I7: [i7_01, i7_02, i7_03, i7_04, i7_05, i7_06],
  A1: [a1_01, a1_02, a1_03, a1_04, a1_05, a1_06, a1_07, a1_08],
  A2: [a2_01, a2_02, a2_03, a2_04, a2_05, a2_06, a2_07, a2_08],
  A3: [a3_01, a3_02, a3_03, a3_04, a3_05, a3_06, a3_07, a3_08],
  A4: [a4_01, a4_02, a4_03, a4_04, a4_05, a4_06, a4_07, a4_08],
  A5: [a5_01, a5_02, a5_03, a5_04, a5_05, a5_06, a5_07, a5_08],
  M1: [m1_01, m1_02, m1_03, m1_04, m1_05, m1_06, m1_07, m1_08, m1_09, m1_10],
  M2: [m2_01, m2_02, m2_03, m2_04, m2_05, m2_06],
  M3: [m3_01, m3_02, m3_03, m3_04, m3_05, m3_06],
  M4: [m4_01, m4_02, m4_03, m4_04, m4_05, m4_06],
};

/**
 * Ordered list of all mixing challenges
 */
export const allMixingChallenges: MixingChallenge[] = [
  // F1 - Frequency Basics
  f1_01,
  f1_02,
  f1_03,
  f1_04,
  // F2 - EQ Shaping
  f2_01,
  f2_02,
  f2_03,
  f2_04,
  // F3 - EQ Repair
  f3_01,
  f3_02,
  f3_03,
  f3_04,
  // F4 - Compression Basics
  f4_01,
  f4_02,
  f4_03,
  f4_04,
  // F5 - Advanced Compression
  f5_01,
  f5_02,
  f5_03,
  f5_04,
  // F6 - Combined Processing
  f6_01,
  f6_02,
  f6_03,
  f6_04,
  // F7 - Problem Solving
  f7_01,
  f7_02,
  f7_03,
  f7_04,
  // F8 - Mix Balance
  f8_01,
  f8_02,
  f8_03,
  f8_04,
  // I1 - Kick and Bass Relationship
  i1_01,
  i1_02,
  i1_03,
  i1_04,
  i1_05,
  i1_06,
  // I2 - Vocal Presence and Clarity
  i2_01,
  i2_02,
  i2_03,
  i2_04,
  i2_05,
  i2_06,
  // I3 - Drum Punch and Impact
  i3_01,
  i3_02,
  i3_03,
  i3_04,
  i3_05,
  i3_06,
  // I4 - Stereo Width and Imaging
  i4_01,
  i4_02,
  i4_03,
  i4_04,
  i4_05,
  i4_06,
  // I5 - Depth and Space
  i5_01,
  i5_02,
  i5_03,
  i5_04,
  i5_05,
  i5_06,
  // I6 - Balance and Level Relationships
  i6_01,
  i6_02,
  i6_03,
  i6_04,
  i6_05,
  i6_06,
  // I7 - Track Dynamics
  i7_01,
  i7_02,
  i7_03,
  i7_04,
  i7_05,
  i7_06,
  // A1 - Full Drum Mix
  a1_01,
  a1_02,
  a1_03,
  a1_04,
  a1_05,
  a1_06,
  a1_07,
  a1_08,
  // A2 - Full Vocal Chain
  a2_01,
  a2_02,
  a2_03,
  a2_04,
  a2_05,
  a2_06,
  a2_07,
  a2_08,
  // A3 - Instrument Balance
  a3_01,
  a3_02,
  a3_03,
  a3_04,
  a3_05,
  a3_06,
  a3_07,
  a3_08,
  // A4 - Mix Bus Processing
  a4_01,
  a4_02,
  a4_03,
  a4_04,
  a4_05,
  a4_06,
  a4_07,
  a4_08,
  // A5 - Genre-Specific Mixing
  a5_01,
  a5_02,
  a5_03,
  a5_04,
  a5_05,
  a5_06,
  a5_07,
  a5_08,
  // M1 - Complete Song Mixing
  m1_01,
  m1_02,
  m1_03,
  m1_04,
  m1_05,
  m1_06,
  m1_07,
  m1_08,
  m1_09,
  m1_10,
  // M2 - Mastering Basics
  m2_01,
  m2_02,
  m2_03,
  m2_04,
  m2_05,
  m2_06,
  // M3 - Reference Matching
  m3_01,
  m3_02,
  m3_03,
  m3_04,
  m3_05,
  m3_06,
  // M4 - Troubleshooting
  m4_01,
  m4_02,
  m4_03,
  m4_04,
  m4_05,
  m4_06,
];

/**
 * Mixing module metadata
 */
export const mixingModules = {
  F1: {
    id: 'F1',
    title: 'Frequency Basics',
    description: 'Learn to hear and adjust low, mid, and high frequencies with a 3-band EQ.',
    challengeCount: 4,
  },
  F2: {
    id: 'F2',
    title: 'EQ Shaping',
    description: 'Shape the overall character of sounds by combining EQ moves.',
    challengeCount: 4,
  },
  F3: {
    id: 'F3',
    title: 'EQ Repair',
    description: 'Fix common frequency problems: muddy bass, harsh highs, boxy mids.',
    challengeCount: 4,
  },
  F4: {
    id: 'F4',
    title: 'Compression Basics',
    description: 'Control dynamics with threshold and amount. Learn to hear compression.',
    challengeCount: 4,
  },
  F5: {
    id: 'F5',
    title: 'Advanced Compression',
    description: 'Master attack and release timing for transparent or pumping compression.',
    challengeCount: 4,
  },
  F6: {
    id: 'F6',
    title: 'Combined Processing',
    description: 'Use EQ and compression together to shape sounds for different contexts.',
    challengeCount: 4,
  },
  F7: {
    id: 'F7',
    title: 'Problem Solving',
    description: 'Diagnose and fix common audio problems: boom, harshness, weak attack.',
    challengeCount: 4,
  },
  F8: {
    id: 'F8',
    title: 'Mix Balance',
    description: 'Advanced scenarios: filling the spectrum, sitting in a mix, polishing.',
    challengeCount: 4,
  },
  I1: {
    id: 'I1',
    title: 'Kick & Bass',
    description: 'Master the relationship between kick and bass with frequency carving and separation.',
    challengeCount: 6,
  },
  I2: {
    id: 'I2',
    title: 'Vocal Presence',
    description: 'Make vocals cut through the mix with clarity, warmth, and air.',
    challengeCount: 6,
  },
  I3: {
    id: 'I3',
    title: 'Drum Punch',
    description: 'Make drums hit hard with punch, crack, and impact.',
    challengeCount: 6,
  },
  I4: {
    id: 'I4',
    title: 'Stereo Width',
    description: 'Create width and depth by mastering stereo imaging and panning.',
    challengeCount: 6,
  },
  I5: {
    id: 'I5',
    title: 'Depth & Space',
    description: 'Use reverb to create front-to-back depth and a three-dimensional soundstage.',
    challengeCount: 6,
  },
  I6: {
    id: 'I6',
    title: 'Level Balance',
    description: 'Master volume relationships to create professional-sounding mixes.',
    challengeCount: 6,
  },
  I7: {
    id: 'I7',
    title: 'Track Dynamics',
    description: 'Control dynamics on individual tracks with per-track compression.',
    challengeCount: 6,
  },
  A1: {
    id: 'A1',
    title: 'Full Drum Mix',
    description: 'Master the complete drum mix using all your tools: EQ, compression, panning, and reverb.',
    challengeCount: 8,
  },
  A2: {
    id: 'A2',
    title: 'Full Vocal Chain',
    description: 'Build professional vocal processing: clarity, warmth, air, dynamics, and space.',
    challengeCount: 8,
  },
  A3: {
    id: 'A3',
    title: 'Instrument Balance',
    description: 'Balance multiple instruments in a mix: drums, bass, guitars, keys, and full bands.',
    challengeCount: 8,
  },
  A4: {
    id: 'A4',
    title: 'Mix Bus Processing',
    description: 'Process the entire mix with bus compression and EQ for polish and cohesion.',
    challengeCount: 8,
  },
  A5: {
    id: 'A5',
    title: 'Genre-Specific Mixing',
    description: 'Apply genre-appropriate mixing techniques: rock, pop, hip-hop, EDM, R&B, and more.',
    challengeCount: 8,
  },
  M1: {
    id: 'M1',
    title: 'Complete Song Mixing',
    description: 'Mix a complete song from scratch, applying all techniques in a professional workflow.',
    challengeCount: 10,
  },
  M2: {
    id: 'M2',
    title: 'Mastering Basics',
    description: 'Prepare mixes for release with tonal balance, compression, and final polish.',
    challengeCount: 6,
  },
  M3: {
    id: 'M3',
    title: 'Reference Matching',
    description: 'Match the sound of professional references: frequency balance, dynamics, width, and depth.',
    challengeCount: 6,
  },
  M4: {
    id: 'M4',
    title: 'Troubleshooting',
    description: 'Diagnose and fix common mix problems: mud, harshness, thinness, clutter, and imbalance.',
    challengeCount: 6,
  },
} as const;

/**
 * Get a mixing challenge by ID
 */
export function getMixingChallenge(id: string): MixingChallenge | undefined {
  return mixingChallengesById[id];
}

/**
 * Get the next mixing challenge after the given one
 */
export function getNextMixingChallenge(currentId: string): MixingChallenge | undefined {
  const index = allMixingChallenges.findIndex((c) => c.id === currentId);
  if (index === -1 || index >= allMixingChallenges.length - 1) {
    return undefined;
  }
  return allMixingChallenges[index + 1];
}
