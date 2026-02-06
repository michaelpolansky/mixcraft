# Additive Synthesis Engine Design

**Date:** 2026-02-05
**Status:** Approved
**Module:** Sound Design (SD9)

---

## Overview

Add additive synthesis capabilities to Mixcraft's audio engine, enabling the SD9 curriculum module ("Additive Synthesis - Building sounds from harmonics"). This introduces a new `AdditiveSynthEngine` class that builds complex timbres by summing 16 sine wave partials, teaching Fourier theory through hands-on exploration.

## Goals

1. Implement 16-harmonic additive synthesis with educational parameter exposure
2. Create Hammond-style drawbar UI for intuitive harmonic control
3. Include waveform presets that demonstrate harmonic recipes
4. Integrate with existing effects chain and evaluation system

## Non-Goals

- Per-harmonic envelopes (future enhancement)
- Inharmonic partials (future enhancement)
- Resynthesis from audio (separate future work)

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AdditiveSynthView                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SpectrumAnalyzer (shared)              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              HarmonicDrawbars (16 sliders)          │   │
│  │  [Presets: Saw] [Square] [Triangle] [Organ]         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Envelope + Effects + Volume            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PianoKeyboard (shared)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Signal Flow

```
AdditiveSynthEngine:
  Oscillator 1 (1x freq, amp[0]) ─┐
  Oscillator 2 (2x freq, amp[1]) ─┤
  Oscillator 3 (3x freq, amp[2]) ─┼─> Gain (sum) -> Envelope -> EffectsChain -> Output
  ...                             │
  Oscillator 16 (16x freq, amp[15])┘
```

---

## Type Definitions

**File:** `src/core/types.ts`

```typescript
// Additive Synth Parameters
export interface AdditiveSynthParams {
  /** Amplitude for each of 16 harmonics (0 to 1) */
  harmonics: number[];
  /** Shared amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
}

export const DEFAULT_ADDITIVE_SYNTH_PARAMS: AdditiveSynthParams = {
  harmonics: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Fundamental only
  amplitudeEnvelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
  },
  effects: DEFAULT_EFFECTS,
  volume: -12,
};

// Harmonic presets
export const ADDITIVE_PRESETS = {
  /** Sawtooth: all harmonics at 1/n amplitude */
  saw: Array.from({ length: 16 }, (_, i) => 1 / (i + 1)),

  /** Square: odd harmonics at 1/n amplitude */
  square: Array.from({ length: 16 }, (_, i) => (i + 1) % 2 === 1 ? 1 / (i + 1) : 0),

  /** Triangle: odd harmonics at 1/n² amplitude */
  triangle: Array.from({ length: 16 }, (_, i) => (i + 1) % 2 === 1 ? 1 / Math.pow(i + 1, 2) : 0),

  /** Hammond organ style */
  organ: [1, 0.8, 0, 0.6, 0, 0.4, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0],
} as const;

export type AdditivePreset = keyof typeof ADDITIVE_PRESETS;
```

---

## Component Details

### 1. AdditiveSynthEngine Class

Wraps 16 Tone.js Oscillators summed together with a shared envelope.

**File:** `src/core/additive-synth-engine.ts`

```typescript
class AdditiveSynthEngine {
  private oscillators: Tone.Oscillator[];
  private gains: Tone.Gain[];           // Per-oscillator gain for amplitude
  private sumGain: Tone.Gain;           // Sums all oscillators
  private envelope: Tone.AmplitudeEnvelope;
  private effectsChain: EffectsChain;
  private analyser: AnalyserNode;
  private params: AdditiveSynthParams;

  constructor(initialParams?: Partial<AdditiveSynthParams>)

  // Initialization
  async start(): Promise<void>
  get initialized(): boolean
  dispose(): void

  // Harmonic control
  setHarmonic(index: number, amplitude: number): void
  setHarmonics(amplitudes: number[]): void
  applyPreset(preset: AdditivePreset): void

  // Envelope
  setAmplitudeEnvelope(adsr: Partial<ADSREnvelope>): void
  setAmplitudeAttack(time: number): void
  setAmplitudeDecay(time: number): void
  setAmplitudeSustain(level: number): void
  setAmplitudeRelease(time: number): void

  // Effects (delegated to EffectsChain)
  setDistortion(params: Partial<DistortionParams>): void
  setDelay(params: Partial<DelayParams>): void
  setReverb(params: Partial<ReverbParams>): void
  setChorus(params: Partial<ChorusParams>): void

  // Volume
  setVolume(db: number): void

  // Note control
  triggerAttack(note: string | number): void
  triggerRelease(): void
  triggerAttackRelease(note: string | number, duration: number | string): void

  // Visualization
  getAnalyser(): AnalyserNode
  getParams(): AdditiveSynthParams
}
```

### 2. HarmonicDrawbars Component

16 vertical sliders in Hammond organ drawbar style.

**File:** `src/ui/components/HarmonicDrawbars.tsx`

```typescript
interface HarmonicDrawbarsProps {
  harmonics: number[];
  onChange: (index: number, value: number) => void;
  onPreset: (preset: AdditivePreset) => void;
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐
│  │  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  │
│  │  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  │
│  │▓▓││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  ││  │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘
│   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  │  Saw   │ │ Square │ │Triangle│ │ Organ  │
│  └────────┘ └────────┘ └────────┘ └────────┘
└──────────────────────────────────────────────────────────────┘
```

### 3. AdditiveSynthPanel Component

Full control panel including drawbars, envelope, effects, and volume.

**File:** `src/ui/components/AdditiveSynthPanel.tsx`

### 4. AdditiveSynthView

Sandbox view for free exploration.

**File:** `src/ui/views/AdditiveSynthView.tsx`

---

## SD9 Challenge Definitions

| Challenge | Harmonics | Learning |
|-----------|-----------|----------|
| **sd9-01-fundamental** | [1,0,0,...] | Pure sine = fundamental only |
| **sd9-02-octave-stack** | [1,1,0,1,0,0,0,1,...] | Harmonics 1,2,4,8 = octaves |
| **sd9-03-bright-saw** | 1/n curve | Sawtooth = all harmonics |
| **sd9-04-hollow-square** | Odd only, 1/n | Square = odd harmonics |
| **sd9-05-soft-triangle** | Odd only, 1/n² | Triangle = gentle rolloff |
| **sd9-06-organ-tone** | Hammond-style | Classic organ registration |

---

## Files Summary

### New Files

| File | Description | Est. Lines |
|------|-------------|------------|
| `src/core/additive-synth-engine.ts` | Engine with 16 oscillators | ~350 |
| `src/ui/stores/additive-synth-store.ts` | Zustand store | ~200 |
| `src/ui/components/HarmonicDrawbars.tsx` | Drawbar sliders | ~150 |
| `src/ui/components/AdditiveSynthPanel.tsx` | Full control panel | ~150 |
| `src/ui/views/AdditiveSynthView.tsx` | Sandbox view | ~150 |
| `src/data/challenges/sd9/*.ts` | 6 challenge files | ~180 |

### Modified Files

| File | Changes |
|------|---------|
| `src/core/types.ts` | Add AdditiveSynthParams, presets |
| `src/App.tsx` | Add Additive Sandbox route |
| `src/ui/views/ChallengeView.tsx` | Add additive controls branch |
| `src/data/challenges/index.ts` | Register SD9 module |

---

## Implementation Order

1. **Types** - AdditiveSynthParams and presets in types.ts
2. **AdditiveSynthEngine** - Core engine with 16 oscillators
3. **additive-synth-store** - Zustand store
4. **HarmonicDrawbars** - Drawbar slider component
5. **AdditiveSynthPanel** - Full control panel
6. **AdditiveSynthView** - Sandbox view + App routing
7. **ChallengeView update** - Add additive controls branch
8. **SD9 challenges** - Create 6 challenge definitions
9. **Integration** - Wire everything together

---

## Testing Strategy

- Unit tests for AdditiveSynthEngine harmonic setting
- Unit tests for preset application
- Unit tests for note triggering
- Existing synth tests must continue passing
- Manual testing of additive sounds in browser
