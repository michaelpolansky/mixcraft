# Sound Comparison System Design

**Date:** 2026-02-04
**Status:** Approved
**Scope:** Session 2 — Sound comparison, scoring, first challenges

## Overview

Add the core challenge mechanic: player hears a target sound, tries to recreate it with the synth, and gets scored on similarity. This creates the fundamental gameplay loop for the Sound Design track.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target sound format | SynthParams JSON | Simple, reproducible, no audio content needed |
| Scoring approach | Hybrid (70% audio features, 30% params) | Rewards good ears while giving partial credit |
| UI flow | Modal target with "Play Target" button | Clean UI, forces ear training |
| Feedback level | Score + feature breakdown | Guides learning without revealing answer |

## Data Model

### Challenge Definition

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  targetParams: SynthParams;
  hints: string[];
  module: string;
}
```

### Score Result

```typescript
interface ScoreResult {
  overall: number;           // 0-100
  stars: 1 | 2 | 3;          // 60/80/95 thresholds
  breakdown: {
    brightness: { score: number; feedback: string };
    attack: { score: number; feedback: string };
    filter: { score: number; feedback: string };
    envelope: { score: number; feedback: string };
  };
  passed: boolean;
}
```

### Challenge Progress

```typescript
interface ChallengeProgress {
  challengeId: string;
  bestScore: number;
  stars: number;
  attempts: number;
  completed: boolean;
}
```

## Sound Comparison System

### Feature Extraction

Capture 500ms note sample and extract via Meyda.js:

```typescript
interface SoundFeatures {
  // Spectral
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlatness: number;

  // Temporal
  attackTime: number;
  rmsEnvelope: number[];

  // Raw
  averageSpectrum: number[];
}
```

### Scoring Weights

- 70% audio feature similarity (perceptual)
- 30% parameter proximity (partial credit)

### Capture Flow

1. Player clicks "Submit"
2. Play 500ms test note from player's synth, record features
3. Play same note with target params, record features
4. Compare and score

## UI Design

### ChallengeView Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back    "Challenge Title"                 Attempt N  │
│            Challenge description                        │
├─────────────────────────────────────────────────────────┤
│   [ ▶ Play Target ]     [ ▶ Play Yours ]    [ Compare ] │
├─────────────────────────────────────────────────────────┤
│   [ Synth Controls ]         [ Spectrum + Keyboard ]    │
├─────────────────────────────────────────────────────────┤
│            [ 💡 Hint ]           [ Submit ]             │
└─────────────────────────────────────────────────────────┘
```

### Key Interactions

- **Play Target**: Plays note using target SynthParams
- **Play Yours**: Plays with current player settings
- **Compare**: Target → pause → yours back-to-back
- **Hint**: Progressive hints (max 3)
- **Submit**: Score and show results

### ResultsModal

Overlay showing:
- Overall score percentage
- Star rating (1-3)
- Feature breakdown with color-coded bars
- "Retry" / "Next Challenge" buttons

## First Challenges (SD1)

| # | Title | Target | Teaches | Difficulty |
|---|-------|--------|---------|------------|
| 1 | Pure Tone | Sine, no filter mod | Sine = pure | ★☆☆ |
| 2 | Buzzy Bass | Saw, low octave, 800Hz cutoff | Saw = harmonics | ★☆☆ |
| 3 | Hollow Pad | Triangle, slow attack | Triangle = mellow | ★★☆ |
| 4 | Punchy Pluck | Square, fast attack, short decay | Envelope = feel | ★★☆ |

## File Structure

```
src/
  core/
    sound-analysis.ts
    sound-comparison.ts
    challenge-loader.ts
  ui/
    views/
      ChallengeView.tsx
    components/
      TargetPlayer.tsx
      ResultsModal.tsx
      ScoreBar.tsx
    stores/
      challenge-store.ts
  data/
    challenges/
      sd1/
        sd1-01-pure-tone.json
        sd1-02-buzzy-bass.json
        sd1-03-hollow-pad.json
        sd1-04-punchy-pluck.json
      index.ts
```

## Implementation Order

1. `sound-analysis.ts` — Meyda feature extraction
2. `sound-comparison.ts` — Hybrid scoring logic
3. Challenge JSON files — 4 target definitions
4. `challenge-store.ts` — State management
5. `ChallengeView.tsx` + components — UI
6. Navigation between SynthView and ChallengeView

## Out of Scope

- Backend/database (localStorage only)
- User accounts
- Leaderboards
- Challenge editor UI
- Audio file targets (future)
