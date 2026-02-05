# Production Track Design

**Date:** 2026-02-05
**Status:** Approved

## Overview

The Production track teaches how multiple sounds work together - layering, arrangement, frequency stacking, and spatial placement. It bridges Sound Design (creating sounds) and Mixing (processing sounds).

**20 challenges across 5 modules:**
- P1: Frequency Stacking (4)
- P2: Layering (4)
- P3: Arrangement Energy (4)
- P4: Rhythm and Groove (4)
- P5: Space and Depth (4)

## Core Architecture

### Multi-Layer Audio System

Each challenge has 2-4 fixed audio sources that mix together:

```
Layer 1 (kick)  → Gain → Pan → EQ? ─┐
Layer 2 (bass)  → Gain → Pan → EQ? ─┼→ Master → Destination
Layer 3 (pad)   → Gain → Pan → EQ? ─┘
```

### Progressive Control Unlock

| Module | Controls Available |
|--------|-------------------|
| P1-P2 | Volume + Mute |
| P3-P4 | + Pan |
| P5 | + Simple EQ (low/high shelf) |

This teaches the right order of production decisions:
1. Pick the right sounds and balance levels
2. Place them in the stereo field
3. Carve frequency space so they don't fight

### Types

```typescript
interface ProductionLayer {
  id: string;
  name: string;
  sourceConfig: AudioSourceConfig;
  initialVolume: number;  // dB
  initialPan?: number;    // -1 to 1
  initialMuted?: boolean;
}

interface ProductionChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  module: string;
  layers: ProductionLayer[];
  target: ProductionReferenceTarget | ProductionGoalTarget;
  availableControls: {
    volume: boolean;
    mute: boolean;
    pan: boolean;
    eq: boolean;
  };
  hints: string[];
}
```

## Evaluation System

### Reference Matching (P1-P2)

For each layer, compare player settings to target values:

```typescript
interface ProductionReferenceTarget {
  type: 'reference';
  layers: {
    volume: number;      // Target dB
    muted: boolean;      // Should be muted?
    pan?: number;        // Target pan (-1 to 1)
    eqLow?: number;      // Target low shelf dB
    eqHigh?: number;     // Target high shelf dB
  }[];
}
```

Scoring:
- Volume: Score similarity within ±3dB tolerance
- Mute state: Binary match
- Pan: Score similarity within ±0.2 tolerance
- Overall: Weighted average across layers

### Goal-Based (P3-P5)

Define acceptable conditions rather than exact values:

```typescript
interface ProductionGoalTarget {
  type: 'goal';
  description: string;
  conditions: ProductionCondition[];
}

type ProductionCondition =
  | { type: 'level_order'; louder: string; quieter: string }
  | { type: 'pan_spread'; minWidth: number }
  | { type: 'layer_active'; layerId: string; active: boolean }
  | { type: 'layer_muted'; layerId: string; muted: boolean }
  | { type: 'eq_separation'; layer1: string; layer2: string };
```

Scoring: Each condition is pass/fail, overall score is percentage met. 60% to pass.

## UI Components

### LayerStrip

Horizontal channel strip for each layer:
- Layer name/icon
- Vertical volume fader (reuse Slider component)
- Mute button (M) + Solo button (S)
- Pan knob (when unlocked)
- Low/High EQ knobs (when unlocked)
- Level meter

### ProductionMixer

Container holding 2-4 LayerStrips side by side:

```
┌─────────────────────────────────────────────┐
│ Challenge Title                    ★★☆      │
├─────────────────────────────────────────────┤
│ [▶ Reference]  [▶ Yours]  [Compare]         │
├───────────────────────┬─────────────────────┤
│  KICK  BASS  PAD      │   Spectrum          │
│   |     |     |       │   ┌────────────┐    │
│   |     █     |       │   │ ▁▂▄█▆▃▂▁  │    │
│   █     █     █       │   └────────────┘    │
│  [M][S][M][S][M][S]   │                     │
│                       │   Hints             │
├───────────────────────┴─────────────────────┤
│              [ Submit ]                      │
└─────────────────────────────────────────────┘
```

### ProductionChallengeView

Similar to MixingChallengeView:
- Header with challenge info
- Reference player (P1-P2) or goal description (P3-P5)
- ProductionMixer component
- Spectrum analyzer showing combined output
- Hints section
- Submit button

## Challenge Content

### P1: Frequency Stacking (Volume + Mute)

| # | Title | Layers | Goal |
|---|-------|--------|------|
| 1 | Find the Space | Kick, Bass, Pad | Match reference - each sound in its range |
| 2 | Bass vs Keys | Sub bass, Mid bass, Keys | Pick the right bass layer |
| 3 | Clear the Mud | Kick, Bass, Low pad | Reduce low-end buildup |
| 4 | Stack the Spectrum | Sub, Low-mid, High | Balance for full coverage |

### P2: Layering (Volume + Mute)

| # | Title | Layers | Goal |
|---|-------|--------|------|
| 1 | Attack + Body | Plucky attack, Sustained body | Blend for cohesive sound |
| 2 | Drum Stack | Acoustic kick, Sub layer, Click | Layer for punch + weight |
| 3 | Thick Pad | Thin pad, Warm pad, Bright pad | Combine for rich texture |
| 4 | Hybrid Bass | Mid growl, Sub sine, Top distortion | Create layered bass |

### P3: Arrangement Energy (+ Pan)

| # | Title | Layers | Goal |
|---|-------|--------|------|
| 1 | Build the Drop | 4 elements | Create rising energy |
| 2 | Strip It Back | 4 elements | Create breakdown |
| 3 | Call and Response | Lead, Answer, Pad | Balance conversation |
| 4 | Dynamic Range | All elements | Create contrast |

### P4: Rhythm and Groove (+ Pan)

| # | Title | Layers | Goal |
|---|-------|--------|------|
| 1 | Wide Drums | Kick, Snare, Hi-hats | Pan for stereo width |
| 2 | Pocket Balance | Kick, Bass, Percussion | Rhythm section together |
| 3 | Percussion Spread | 4 percussion elements | Distribute across stereo |
| 4 | Groove Foundation | Drums, Bass, Rhythm guitar | Balance groove elements |

### P5: Space and Depth (+ EQ)

| # | Title | Layers | Goal |
|---|-------|--------|------|
| 1 | Front and Back | Lead, Pad, Ambient | EQ for depth |
| 2 | Frequency Carving | Kick, Bass, Low synth | EQ for separation |
| 3 | Wide and Deep | 3-4 elements | Pan width + EQ depth |
| 4 | The Full Picture | 4 elements | Complete 3D soundstage |

## Implementation Order

1. **Core types** - Add ProductionChallenge, layer types to types.ts
2. **ProductionSource** - Multi-layer audio system with gain/pan/EQ
3. **ProductionStore** - Zustand store for layer states
4. **ProductionEvaluation** - Reference matching and goal-based scoring
5. **LayerStrip component** - Individual channel strip
6. **ProductionMixer component** - Container for strips
7. **ProductionChallengeView** - Full challenge view
8. **P1 challenges (4)** - First module with volume/mute
9. **P2 challenges (4)** - Layering
10. **P3 challenges (4)** - Add pan controls
11. **P4 challenges (4)** - Rhythm and groove
12. **P5 challenges (4)** - Add EQ controls
13. **App.tsx integration** - Add Production section to menu

## Files to Create

```
src/core/production-source.ts      # Multi-layer audio system
src/core/production-evaluation.ts  # Scoring logic
src/ui/stores/production-store.ts  # State management
src/ui/components/LayerStrip.tsx   # Channel strip component
src/ui/components/ProductionMixer.tsx  # Mixer container
src/ui/views/ProductionChallengeView.tsx
src/data/challenges/production/index.ts
src/data/challenges/production/p1/*.ts  # 4 files
src/data/challenges/production/p2/*.ts  # 4 files
src/data/challenges/production/p3/*.ts  # 4 files
src/data/challenges/production/p4/*.ts  # 4 files
src/data/challenges/production/p5/*.ts  # 4 files
```

## Files to Modify

```
src/core/types.ts        # Add production types
src/App.tsx              # Add production section to menu
src/ui/components/index.ts  # Export new components
```
