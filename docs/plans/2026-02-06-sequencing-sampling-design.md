# Sequencing & Sampling Curriculum Design

> **For Claude:** Use superpowers:writing-plans to create implementation plans for each phase.

**Goal:** Add three new curriculum tracks — Sampling, Drum Sequencing, and Melodic Sequencing — expanding MIXCRAFT from 188 to 260 challenges.

**Architecture:** Three new tracks slot between Sound Design and Production, creating a complete music creation learning path. Each track has its own UI view, engine components, and challenge types.

---

## Curriculum Structure

### Six-Track Flow

```
Sound Design → Sampling → Drum Sequencing → Melodic Sequencing → Production → Mixing
(synthesis)    (audio)    (rhythm/groove)   (bass/arp/chords)    (arrange)    (polish)
```

### Track Summary

| Track | Modules | Challenges | Status |
|-------|---------|------------|--------|
| Sound Design | SD1-SD7 | 32 | Existing |
| Sampling | SM1-SM6 | 24 | **New** |
| Drum Sequencing | DS1-DS6 | 24 | **New** |
| Melodic Sequencing | MS1-MS6 | 24 | **New** |
| Production | P1-P5 | 20 | Existing |
| Mixing | F1-M4 | 136 | Existing |
| **Total** | | **260** | |

### Entry Points

Players can start at:
- **Sound Design** — For those interested in synthesis
- **Sampling** — For those with audio they want to manipulate
- **Drum Sequencing** — For beat makers who want to dive straight into rhythm

---

## Track 1: Sampling (24 challenges)

### Purpose

Teach audio manipulation — transforming recordings into instruments, chopping loops, and creative sampling techniques.

### Modules

| Module | Concept | Challenges | Skills |
|--------|---------|------------|--------|
| SM1 | Sample Basics | 4 | Load samples, trigger one-shots, basic pitch shifting, layer two sounds |
| SM2 | Building Instruments | 4 | Turn recordings into playable kits, map samples across keys, velocity layers |
| SM3 | Time & Pitch | 4 | Time-stretch without artifacts, tune samples to key, warp timing |
| SM4 | Chopping | 4 | Slice drum breaks, chop vocals, set slice points, trigger chops |
| SM5 | Flipping | 4 | Find loops in longer samples, rearrange chops, obscure source material |
| SM6 | Polish & Clean | 4 | Trim heads/tails, fade in/out, normalize, remove noise, loop points |

### Challenge Types

| Type | Description | Evaluation |
|------|-------------|------------|
| Recreate this kit | Build a drum kit from raw recordings to match reference | Sample similarity + mapping accuracy |
| Tune to track | Pitch/stretch a sample to fit backing track's key/tempo | Pitch accuracy + timing alignment |
| Chop challenge | Slice a break and recreate a target pattern | Pattern match + slice accuracy |
| Flip this | Create something new from source material | Originality threshold + musical quality |
| Clean this sample | Fix problems (noise, bad edits, wrong pitch) | Problem detection + fix quality |

### UI: SamplerView

```
┌─────────────────────────────────────────────────────────────┐
│ [Waveform Display with Slice Markers]                       │
│ ════════════════════════════════════════════════════════════│
│ |    |    |    |    |    |    |    |    |                  │
│ └────┴────┴────┴────┴────┴────┴────┴────┘                  │
├─────────────────────────────────────────────────────────────┤
│ Pitch: [====●====]  Stretch: [====●====]  Gain: [====●====] │
│ Start: [____]  End: [____]  Loop: [x]  Reverse: [ ]         │
├─────────────────────────────────────────────────────────────┤
│ [Pad Grid: 8 pads mapped to slices]                         │
│ [1] [2] [3] [4] [5] [6] [7] [8]                             │
└─────────────────────────────────────────────────────────────┘
```

### Technical Components

| Component | Implementation |
|-----------|---------------|
| Sampler Engine | Tone.js Sampler + GrainPlayer for time-stretch |
| Waveform Display | Canvas 2D, similar to existing visualizations |
| Slice Markers | Draggable markers on waveform |
| Pitch Control | Tone.js Player.playbackRate + detune |
| Time Stretch | Tone.js GrainPlayer for artifact-free stretching |

---

## Track 2: Drum Sequencing (24 challenges)

### Purpose

Teach rhythm and groove — step sequencing, drum programming, swing, and dynamics.

### Modules

| Module | Concept | Challenges | Skills |
|--------|---------|------------|--------|
| DS1 | Grid Basics | 4 | Step sequencer UI, kick/snare placement, 4-on-floor vs backbeat |
| DS2 | Hi-hats & Percussion | 4 | 8th/16th hat patterns, open vs closed, percussion layers |
| DS3 | Groove & Swing | 4 | Swing percentage, timing offsets, humanization, triplet feel |
| DS4 | Velocity & Dynamics | 4 | Accent patterns, ghost notes, velocity curves |
| DS5 | Genre Patterns | 4 | Hip-hop boom-bap, house, trap hi-hats, breakbeat |
| DS6 | Loop Construction | 4 | 4/8 bar structures, fills, transitions, variation |

### Challenge Types

| Type | Description | Evaluation |
|------|-------------|------------|
| Match this beat | Recreate a drum loop on the grid | Pattern accuracy + timing |
| Fix the groove | Pattern correct but timing off, add swing/feel | Groove similarity score |
| Add dynamics | Make static pattern feel alive with velocity | Dynamic range + accent placement |
| Genre challenge | Create beat matching genre characteristics | Feature matching (tempo, swing, pattern) |
| Complete the loop | Given 2 bars, create variation/fill for bars 3-4 | Musical continuity + variation quality |

### UI: DrumSequencerView

```
┌─────────────────────────────────────────────────────────────┐
│ Kit: [Acoustic ▼]     Tempo: [120]     Swing: [====●====]   │
├─────────────────────────────────────────────────────────────┤
│         1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16 │
│ Kick    [●] [ ] [ ] [ ] [●] [ ] [ ] [ ] [●] [ ] [ ] [ ] [●] [ ] [ ] [ ] │
│ Snare   [ ] [ ] [ ] [ ] [●] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [●] [ ] [ ] [ ] │
│ HH Cls  [●] [ ] [●] [ ] [●] [ ] [●] [ ] [●] [ ] [●] [ ] [●] [ ] [●] [ ] │
│ HH Opn  [ ] [ ] [ ] [ ] [ ] [ ] [ ] [●] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [●] │
│ Perc    [ ] [ ] [ ] [●] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [●] [ ] [ ] [ ] [ ] │
├─────────────────────────────────────────────────────────────┤
│ Velocity: [▁▃▅▇▅▃▁▃▅▇▅▃▁▃▅▇]                               │
└─────────────────────────────────────────────────────────────┘
```

### Visualizations

| Visualization | Purpose |
|---------------|---------|
| Step Grid | Show pattern structure, active steps highlighted |
| Velocity Bars | Show dynamics per step |
| Swing Display | Visualize timing offsets from grid |
| Loop Waveform | Show resulting audio pattern |

### Technical Components

| Component | Implementation |
|-----------|---------------|
| Sequencer Engine | Tone.js Transport + Tone.Sequence |
| Grid UI | Canvas 2D or CSS grid with click handlers |
| Velocity Control | Per-step velocity stored in pattern data |
| Swing Engine | Tone.Transport.swing + custom offset system |
| Kit Manager | Load/switch between drum kits |

---

## Track 3: Melodic Sequencing (24 challenges)

### Purpose

Teach melodic composition — basslines, arpeggios, chord progressions, and melody writing.

### Modules

| Module | Concept | Challenges | Skills |
|--------|---------|------------|--------|
| MS1 | Bassline Basics | 4 | Root note patterns, octave jumps, following chord roots |
| MS2 | Rhythm in Melody | 4 | Syncopation, rests, off-beat patterns, groove |
| MS3 | Arpeggios | 4 | Arp patterns (up/down/random), rate, note order |
| MS4 | Chord Progressions | 4 | Block chords, common progressions, voicings, inversions |
| MS5 | Melody Writing | 4 | Motifs, repetition with variation, call and response |
| MS6 | Putting It Together | 4 | Layering bass + chords + melody, rhythmic interplay |

### Challenge Types

| Type | Description | Evaluation |
|------|-------------|------------|
| Match this bassline | Recreate bass pattern (notes + rhythm) | Note accuracy + rhythm match |
| Arpeggiate this | Create arp pattern from block chords matching target | Pattern similarity |
| Complete the phrase | Write response to given 2-bar melody | Musical continuity + theory |
| Harmonize | Add chord progression to given melody | Harmonic correctness |
| Layer challenge | Build bass + chords + lead that work together | Frequency separation + rhythm cohesion |

### UI: PianoRollView

```
┌─────────────────────────────────────────────────────────────┐
│ Sound: [Bass ▼]  Key: [C ▼]  Scale: [Minor ▼]  Snap: [1/16] │
├─────────────────────────────────────────────────────────────┤
│ C5  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ B4  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ A4  │░░░░░░░░████░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░│
│ G4  │░░░░████░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░│
│ F4  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ E4  │████░░░░░░░░████░░░░████░░░░░░░░████░░░░░░░░░░░░░░░░│
│ D4  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ C4  │░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░████░░░░░░░░░░░░│
├─────────────────────────────────────────────────────────────┤
│ [Keyboard: highlighting scale notes]                        │
│ C  D  E  F  G  A  B  C                                      │
│ ■  □  ■  □  ■  ■  □  ■  (minor scale highlighted)           │
└─────────────────────────────────────────────────────────────┘
```

### Visualizations

| Visualization | Purpose |
|---------------|---------|
| Piano Roll Grid | Note placement and duration |
| Keyboard Display | Current notes, scale highlighting |
| Chord Diagram | Current chord being played |
| Scale Helper | Highlight "safe" notes in selected scale |

### Technical Components

| Component | Implementation |
|-----------|---------------|
| Piano Roll UI | Canvas 2D with note drawing/dragging |
| Note Engine | Tone.js Part for note scheduling |
| Arpeggiator | Tone.js Pattern with configurable modes |
| Scale System | Note filtering/highlighting based on key/scale |
| Chord Detection | Identify chords from selected notes |

---

## Content Requirements

### Audio Assets

| Category | Quantity | Purpose |
|----------|----------|---------|
| Source samples (breaks, vocals, textures) | ~50 | Sampling challenges |
| Drum kits (acoustic, electronic, genre-specific) | ~20 | Drum sequencing |
| Synth presets (bass, pad, lead, pluck) | ~10 | Melodic sequencing |
| Reference loops/patterns | ~72 | "Match this" challenges |

### Challenge Authoring

| Track | Challenges | Est. Time |
|-------|------------|-----------|
| Sampling | 24 | ~12 hours |
| Drum Sequencing | 24 | ~12 hours |
| Melodic Sequencing | 24 | ~12 hours |
| **Total** | **72** | **~36 hours** |

---

## Implementation Plan

### Phase 1: Sampling (3 weeks)

**Week 1: Engine**
- Sampler engine with Tone.js Sampler + GrainPlayer
- Basic load/play/pitch functionality
- Time-stretch implementation

**Week 2: UI**
- Waveform editor component (Canvas 2D)
- Slice marker system
- Pitch/time/gain controls
- Pad trigger grid

**Week 3: Challenges**
- SM1-SM6 challenge definitions
- Source sample library
- Evaluation system for sample matching
- SamplerChallengeView integration

### Phase 2: Drum Sequencing (2 weeks)

**Week 1: Engine + UI**
- Step sequencer engine (Tone.js Transport + Sequence)
- Grid UI component
- Velocity lane
- Swing/groove controls
- Kit loading system

**Week 2: Challenges**
- DS1-DS6 challenge definitions
- Drum kit library
- Pattern matching evaluation
- DrumSequencerChallengeView integration

### Phase 3: Melodic Sequencing (3 weeks)

**Week 1: Engine**
- Note sequencing engine (Tone.js Part)
- Arpeggiator (Tone.js Pattern)
- Scale/key constraint system

**Week 2: UI**
- Piano roll component (Canvas 2D)
- Note drawing/editing
- Keyboard display
- Scale/chord helpers

**Week 3: Challenges**
- MS1-MS6 challenge definitions
- Synth preset library
- Melodic evaluation system
- PianoRollChallengeView integration

---

## File Structure

```
src/
├── core/
│   ├── sampler-engine.ts         # Sample playback, pitch, stretch
│   ├── sequencer-engine.ts       # Step sequencer logic
│   ├── piano-roll-engine.ts      # Note sequencing logic
│   ├── arpeggiator.ts            # Arp pattern generation
│   └── music-theory.ts           # Scales, chords, key detection
├── ui/
│   ├── components/
│   │   ├── WaveformEditor.tsx    # Sample waveform display + editing
│   │   ├── StepSequencer.tsx     # Drum grid UI
│   │   ├── PianoRoll.tsx         # Note grid UI
│   │   ├── VelocityLane.tsx      # Velocity bars
│   │   └── KeyboardDisplay.tsx   # Piano keyboard visualization
│   └── views/
│       ├── SamplerView.tsx       # Sampling sandbox
│       ├── DrumSequencerView.tsx # Drum sandbox
│       └── PianoRollView.tsx     # Melodic sandbox
├── data/
│   ├── challenges/
│   │   ├── sampling/             # SM1-SM6 challenge files
│   │   ├── drum-sequencing/      # DS1-DS6 challenge files
│   │   └── melodic-sequencing/   # MS1-MS6 challenge files
│   ├── samples/                  # Source audio for challenges
│   ├── kits/                     # Drum kit definitions
│   └── presets/                  # Synth presets for melodic
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Challenge completion rate | >40% per track |
| Player satisfaction ("I learned something") | >85% |
| Beat creation in sandbox (post-sequencing track) | >60% of players |
| Cross-track progression (complete 2+ tracks) | >30% |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Piano roll complexity delays melodic track | Medium | Medium | Ship drums first, melodic can slip |
| Time-stretch artifacts sound bad | Medium | Low | Use GrainPlayer with tuned settings, offer multiple algorithms |
| Too many entry points confuse new users | Low | Medium | Clear track descriptions, recommended path |
| Challenge evaluation for "creativity" is subjective | Medium | Medium | Focus on measurable criteria, use AI for subjective assessment |
