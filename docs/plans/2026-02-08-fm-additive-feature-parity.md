# FM & Additive Synth Feature Parity

> **For Claude:** Use superpowers:writing-plans to create implementation tasks from this design.

**Goal:** Bring FM and Additive synth sandboxes to feature parity with Subtractive synth.

**Architecture:** Add missing features (effects, LFO, mod matrix, velocity, arp, glide, noise, oscilloscope, pan) to both synths with synth-appropriate adaptations for modulation destinations.

**Tech Stack:** TypeScript, Tone.js, React, Zustand, Canvas 2D

---

## Feature Matrix

| Feature | Subtractive | FM | Additive |
|---------|-------------|-----|----------|
| Effects (4 types) | ✅ | Add | ✅ |
| LFO | ✅ | Add | Add |
| Mod Matrix | ✅ | Add | Add |
| Velocity | ✅ | Add | Add |
| Arpeggiator | ✅ | Add | Add |
| Glide | ✅ | Add | Add |
| Noise | ✅ | Add | Add |
| Oscilloscope | ✅ | Add | Add |
| Pan | ✅ | Add | Add |

---

## FM Synth Additions

### New Parameters

```typescript
// LFO for FM
lfo: {
  rate: number;          // 0.1 - 20 Hz
  depth: number;         // 0 - 1
  waveform: LFOWaveform; // sine, triangle, square, sawtooth
  destination: 'modulationIndex' | 'harmonicity' | 'pitch';
}

// Effects (same structure as subtractive)
effects: {
  distortion: { amount: number; mix: number };
  delay: { time: number; feedback: number; mix: number };
  reverb: { decay: number; mix: number };
  chorus: { rate: number; depth: number; mix: number };
}

// Simple additions
glide: { enabled: boolean; time: number };
noise: { type: NoiseType; level: number };
velocity: { ampAmount: number; modIndexAmount: number };
pan: number;

// Arpeggiator (same structure as subtractive)
arpeggiator: {
  enabled: boolean;
  pattern: ArpPattern;
  division: ArpDivision;
  octaves: number;
  gate: number;
}
```

### FM Mod Matrix

```typescript
type FMModSource = 'lfo' | 'modEnvelope' | 'velocity';
type FMModDestination = 'modulationIndex' | 'harmonicity' | 'pitch' | 'pan' | 'amplitude';

fmModMatrix: {
  routes: Array<{
    source: FMModSource;
    destination: FMModDestination;
    amount: number; // -1 to 1
  }>;
}
```

### FM Engine Implementation

- Add Tone.js effects chain: Distortion → Chorus → Delay → Reverb → Panner → output
- Add Tone.js LFO connected to FM parameter based on destination setting
- Add Tone.js NoiseSynth mixed into output
- Glide uses `portamento` property on the FM synth
- Arpeggiator reuses same pattern logic from SynthEngine

---

## Additive Synth Additions

### New Parameters

```typescript
// LFO for Additive
lfo: {
  rate: number;          // 0.1 - 20 Hz
  depth: number;         // 0 - 1
  waveform: LFOWaveform; // sine, triangle, square, sawtooth
  destination: 'brightness' | 'pitch';
}

// Simple additions
glide: { enabled: boolean; time: number };
noise: { type: NoiseType; level: number };
velocity: { ampAmount: number; brightnessAmount: number };
pan: number;

// Arpeggiator (identical structure)
arpeggiator: {
  enabled: boolean;
  pattern: ArpPattern;
  division: ArpDivision;
  octaves: number;
  gate: number;
}
```

### Additive Mod Matrix

```typescript
type AdditiveModSource = 'lfo' | 'ampEnvelope' | 'velocity';
type AdditiveModDestination = 'brightness' | 'pitch' | 'pan' | 'amplitude' | 'oddHarmonics' | 'evenHarmonics';

additiveModMatrix: {
  routes: Array<{
    source: AdditiveModSource;
    destination: AdditiveModDestination;
    amount: number; // -1 to 1
  }>;
}
```

### Additive Engine Implementation

- LFO → brightness: modulates gain of harmonics 5-8 collectively
- LFO → pitch: modulates detune of all partials
- Add Tone.js NoiseSynth mixed into output (before existing effects chain)
- Add Panner node for pan control
- Glide: smoothly interpolate harmonic frequencies on note change
- Velocity → brightness: scale harmonics 5-8 levels based on velocity
- Arpeggiator: same pattern logic as other synths

---

## UI Changes

### FMSynthView Layout

```
Current:  FM SYNTHESIS → AMP → OUTPUT
Proposed: FM SYNTHESIS → AMP → LFO → VELOCITY → FX → MOD MATRIX → OUTPUT
          + NOISE (separate module)
          + GLIDE (in FM SYNTHESIS or small card)
          + ARP (below main flow)
          + Oscilloscope (in OUTPUT)
          + Pan knob (in OUTPUT)
```

### AdditiveSynthView Layout

```
Current:  HARMONICS → AMP → FX → OUTPUT
Proposed: HARMONICS → AMP → LFO → VELOCITY → FX → MOD MATRIX → OUTPUT
          + NOISE (separate module)
          + GLIDE (small card)
          + ARP (below main flow)
          + Oscilloscope (in OUTPUT)
          + Pan knob (in OUTPUT)
```

### Reusable Components

Already exist and can be reused:
- `Oscilloscope`
- `ModMatrixGrid` (parameterize with synth-specific sources/destinations)
- `LFOVisualizer`
- `NoiseVisualizer`
- `RecordingControl`
- `Sequencer`

New components to extract:
- `ArpeggiatorControls` (extract from SynthView)
- `GlideControls` (small: toggle + time knob)

---

## Implementation Phases

### Phase 1: FM Synth

1. Add effects chain to FM engine
2. Add LFO with 3 destinations (mod index, harmonicity, pitch)
3. Add Glide, Noise, Pan
4. Add Velocity (amp + mod index)
5. Add Arpeggiator
6. Add Mod Matrix
7. Update FMSynthView with all new UI modules
8. Update FM presets

### Phase 2: Additive Synth

1. Add LFO with 2 destinations (brightness, pitch)
2. Add Glide, Noise, Pan
3. Add Velocity (amp + brightness)
4. Add Arpeggiator
5. Add Mod Matrix
6. Update AdditiveSynthView with all new UI modules
7. Update Additive presets

### Phase 3: Polish

1. Extract reusable ArpeggiatorControls component
2. Verify consistent UX across all three synths
3. Type check and tests

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/core/types.ts` | Add FM/Additive-specific param types |
| `src/core/fm-synth-engine.ts` | Add effects, LFO, glide, noise, pan, velocity, arp |
| `src/core/additive-synth-engine.ts` | Add LFO, glide, noise, pan, velocity, arp |
| `src/ui/stores/fm-synth-store.ts` | Add actions for new parameters |
| `src/ui/stores/additive-synth-store.ts` | Add actions for new parameters |
| `src/ui/views/FMSynthView.tsx` | Add UI modules for new features |
| `src/ui/views/AdditiveSynthView.tsx` | Add UI modules for new features |
| `src/data/presets/fm-presets.ts` | Update presets with new params |
| `src/data/presets/additive-presets.ts` | Update presets with new params |

---

## Success Criteria

- All features added to both FM and Additive synths
- `npx tsc --noEmit` passes
- `bun test` passes
- Each synth sandbox fully playable with all features
- Presets demonstrate new capabilities

## Not In Scope (YAGNI)

- LFO2 for FM/Additive (one LFO sufficient)
- Real-time modulated value display (can add later)
- New challenges using these features (separate effort)
