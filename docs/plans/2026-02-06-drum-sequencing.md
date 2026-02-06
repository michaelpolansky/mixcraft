# Drum Sequencing Track Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Drum Sequencing curriculum track with step sequencer engine, grid UI, and 24 challenges (DS1-DS6).

**Architecture:** Create a DrumSequencerEngine wrapping Tone.js Transport/Sequence for pattern playback. Build a StepGrid component for visual pattern editing. Challenges compare user patterns against target patterns.

**Tech Stack:** Tone.js (Transport, Sequence, Players), Canvas 2D (step grid, velocity display), Zustand (state), existing evaluation patterns.

---

## Task 1: Drum Sequencer Types

**Files:**
- Modify: `src/core/types.ts`

**Add these type definitions:**

```typescript
// ============================================
// Drum Sequencer Types
// ============================================

export interface DrumStep {
  /** Step is active */
  active: boolean;
  /** Velocity 0-1 */
  velocity: number;
}

export interface DrumTrack {
  /** Track ID (kick, snare, hihat-closed, etc.) */
  id: string;
  /** Display name */
  name: string;
  /** Sample URL */
  sampleUrl: string;
  /** 16 steps (one bar at 16th notes) */
  steps: DrumStep[];
}

export interface DrumPattern {
  /** Pattern name */
  name: string;
  /** Tempo in BPM */
  tempo: number;
  /** Swing amount (0-1, 0.5 = 50% swing) */
  swing: number;
  /** Number of steps (16 or 32) */
  stepCount: 16 | 32;
  /** Tracks in the pattern */
  tracks: DrumTrack[];
}

export interface DrumSequencerParams {
  /** Current pattern */
  pattern: DrumPattern;
  /** Current step (for playhead) */
  currentStep: number;
  /** Is playing */
  isPlaying: boolean;
  /** Selected track index */
  selectedTrack: number;
  /** Master volume in dB */
  volume: number;
}

export const DEFAULT_DRUM_TRACK: DrumTrack = {
  id: 'kick',
  name: 'Kick',
  sampleUrl: '/samples/drums/kick.wav',
  steps: Array(16).fill(null).map(() => ({ active: false, velocity: 0.8 })),
};

export const DEFAULT_DRUM_PATTERN: DrumPattern = {
  name: 'New Pattern',
  tempo: 120,
  swing: 0,
  stepCount: 16,
  tracks: [
    { ...DEFAULT_DRUM_TRACK, id: 'kick', name: 'Kick', sampleUrl: '/samples/drums/kick.wav' },
    { ...DEFAULT_DRUM_TRACK, id: 'snare', name: 'Snare', sampleUrl: '/samples/drums/snare.wav' },
    { ...DEFAULT_DRUM_TRACK, id: 'hihat-closed', name: 'HH Closed', sampleUrl: '/samples/drums/hihat-closed.wav' },
    { ...DEFAULT_DRUM_TRACK, id: 'hihat-open', name: 'HH Open', sampleUrl: '/samples/drums/hihat-open.wav' },
  ],
};

export const DEFAULT_DRUM_SEQUENCER_PARAMS: DrumSequencerParams = {
  pattern: DEFAULT_DRUM_PATTERN,
  currentStep: 0,
  isPlaying: false,
  selectedTrack: 0,
  volume: -6,
};

export const DRUM_SEQUENCER_RANGES = {
  tempo: { min: 60, max: 200, step: 1 },
  swing: { min: 0, max: 1, step: 0.01 },
  volume: { min: -60, max: 0, step: 0.5 },
} as const;

// Drum Sequencing Challenge
export interface DrumSequencingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  module: string;
  challengeType: 'match-beat' | 'fix-groove' | 'add-dynamics' | 'genre-challenge' | 'complete-loop';
  /** Starting pattern (may be empty or partial) */
  startingPattern: DrumPattern;
  /** Target pattern to match */
  targetPattern: DrumPattern;
  /** Which aspects to evaluate */
  evaluationFocus: ('pattern' | 'velocity' | 'swing' | 'tempo')[];
  hints: string[];
}
```

**Commit:** `feat(drum-seq): add drum sequencer type definitions`

---

## Task 2: Drum Sequencer Engine

**Files:**
- Create: `src/core/drum-sequencer-engine.ts`
- Create: `src/tests/core/drum-sequencer-engine.test.ts`

**Engine Features:**
- Wrap Tone.js Transport and Sequence
- Load drum samples into Tone.Players
- Play/stop/pause pattern
- Set tempo, swing
- Toggle step on/off
- Set step velocity
- Get current step (for playhead animation)
- Dispose cleanup

**Key Methods:**
```typescript
class DrumSequencerEngine {
  start(): void
  stop(): void
  setTempo(bpm: number): void
  setSwing(amount: number): void
  toggleStep(trackIndex: number, stepIndex: number): void
  setStepVelocity(trackIndex: number, stepIndex: number, velocity: number): void
  setPattern(pattern: DrumPattern): void
  getPattern(): DrumPattern
  getCurrentStep(): number
  onStepChange(callback: (step: number) => void): void
  dispose(): void
}
```

**Commit:** `feat(drum-seq): add DrumSequencerEngine`

---

## Task 3: Drum Sequencer Store

**Files:**
- Create: `src/ui/stores/drum-sequencer-store.ts`

**Store State:**
- engine, isInitialized, pattern, currentStep, isPlaying
- Challenge state (same pattern as sampler-store)

**Actions:**
- initEngine, start, stop, setTempo, setSwing
- toggleStep, setStepVelocity, clearTrack, clearAll
- loadPattern, loadChallenge, submitResult, retry

**Commit:** `feat(drum-seq): add Zustand drum sequencer store`

---

## Task 4: StepGrid Component

**Files:**
- Create: `src/ui/components/StepGrid.tsx`
- Modify: `src/ui/components/index.ts`

**Features:**
- Canvas 2D grid display
- Rows = tracks, Columns = steps
- Click to toggle step
- Shift+click for velocity adjustment
- Playhead indicator (current step highlighted)
- Velocity shown as cell brightness/size
- Beat markers (1, 5, 9, 13 highlighted)

**Props:**
```typescript
interface StepGridProps {
  pattern: DrumPattern;
  currentStep: number;
  selectedTrack: number;
  onToggleStep: (trackIndex: number, stepIndex: number) => void;
  onSelectTrack: (trackIndex: number) => void;
  onVelocityChange?: (trackIndex: number, stepIndex: number, velocity: number) => void;
  width?: number;
  height?: number;
  accentColor?: string;
}
```

**Commit:** `feat(drum-seq): add StepGrid component`

---

## Task 5: VelocityLane Component

**Files:**
- Create: `src/ui/components/VelocityLane.tsx`

**Features:**
- Shows velocity bars for selected track
- Click/drag to adjust velocity
- Visual feedback for velocity levels

**Commit:** `feat(drum-seq): add VelocityLane component`

---

## Task 6: DrumSequencerView (Sandbox)

**Files:**
- Create: `src/ui/views/DrumSequencerView.tsx`
- Modify: `src/App.tsx`

**Layout:**
- Header with tempo, swing, volume controls
- StepGrid main area
- VelocityLane below grid
- Transport controls (Play/Stop/Clear)
- Track list sidebar

**Commit:** `feat(drum-seq): add DrumSequencerView sandbox`

---

## Task 7: Drum Sequencing Evaluation

**Files:**
- Create: `src/core/drum-sequencing-evaluation.ts`
- Create: `src/tests/core/drum-sequencing-evaluation.test.ts`

**Scoring:**
- Pattern accuracy: Compare step on/off states
- Velocity accuracy: Compare velocity values
- Groove accuracy: Compare swing/timing
- Overall score with star rating

**Commit:** `feat(drum-seq): add drum sequencing evaluation`

---

## Task 8: DrumSequencerChallengeView

**Files:**
- Create: `src/ui/views/DrumSequencerChallengeView.tsx`
- Modify: `src/App.tsx`

**Features:**
- Side-by-side or toggle: your pattern vs target
- Submit for scoring
- Results modal
- Hints section

**Commit:** `feat(drum-seq): add DrumSequencerChallengeView`

---

## Task 9: DS1-DS6 Challenges (24 total)

**Files:**
- Create: `src/data/challenges/drum-sequencing/ds1/` through `ds6/`
- Create index files for each module
- Create main `src/data/challenges/drum-sequencing/index.ts`

**Modules:**
- DS1: Grid Basics (4) - kick/snare placement, 4-on-floor, backbeat
- DS2: Hi-hats & Percussion (4) - 8th/16th patterns, open/closed
- DS3: Groove & Swing (4) - swing %, humanization
- DS4: Velocity & Dynamics (4) - accents, ghost notes
- DS5: Genre Patterns (4) - hip-hop, house, trap, breakbeat
- DS6: Loop Construction (4) - fills, transitions, variations

**Commit:** `feat(drum-seq): add DS1-DS6 challenges (24 total)`

---

## Task 10: Curriculum Integration

**Files:**
- Modify: `src/data/challenges/index.ts`
- Modify: `src/App.tsx`
- Create: `public/samples/drums/` with basic kit samples

**Commit:** `feat(drum-seq): integrate drum sequencing into curriculum`

---

## Verification Checklist

- [ ] `bun run build` passes
- [ ] `bun run test` passes
- [ ] DrumSequencerView works (can create patterns)
- [ ] Playback works with correct timing
- [ ] Swing affects timing
- [ ] Velocity affects volume
- [ ] DS1-DS6 challenges accessible
- [ ] Challenge scoring works
