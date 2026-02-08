# FM & Additive Feature Parity Implementation Plan

> **For Claude:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Bring FM and Additive synth sandboxes to feature parity with Subtractive synth.

**Architecture:** Extend existing engine classes with new Tone.js nodes (LFO, Noise, Panner), add types to types.ts, update stores with new actions, add UI modules to views.

**Tech Stack:** TypeScript, Tone.js, React, Zustand, Canvas 2D

---

## Phase 1: FM Synth (Tasks 1-8)

### Task 1: Add FM-specific Types to types.ts

**Files:**
- Modify: `src/core/types.ts`

**Implementation:**

Add new types after FMSynthParams:

```typescript
// FM LFO destination options
export type FMLFODestination = 'modulationIndex' | 'harmonicity' | 'pitch';

// FM Mod Matrix sources and destinations
export type FMModSource = 'lfo' | 'modEnvelope' | 'velocity';
export type FMModDestination = 'modulationIndex' | 'harmonicity' | 'pitch' | 'pan' | 'amplitude';

// FM-specific LFO params
export interface FMLFOParams {
  rate: number;        // 0.1 - 20 Hz
  depth: number;       // 0 - 1
  waveform: LFOWaveform;
  destination: FMLFODestination;
}

// FM Mod Matrix
export interface FMModRoute {
  source: FMModSource;
  destination: FMModDestination;
  amount: number; // -1 to 1
  enabled: boolean;
}

export interface FMModMatrix {
  routes: [FMModRoute, FMModRoute, FMModRoute, FMModRoute];
}

// FM Velocity
export interface FMVelocityParams {
  ampAmount: number;      // 0 to 1
  modIndexAmount: number; // 0 to 1
}
```

Update FMSynthParams interface to include new fields:

```typescript
export interface FMSynthParams {
  // ... existing fields ...
  lfo: FMLFOParams;
  noise: NoiseParams;
  glide: GlideParams;
  velocity: FMVelocityParams;
  arpeggiator: ArpeggiatorParams;
  modMatrix: FMModMatrix;
  pan: number;
}
```

Update DEFAULT_FM_SYNTH_PARAMS with new defaults.

**Verify:** `npx tsc --noEmit` - expect errors in fm-synth-engine.ts (missing implementations)

---

### Task 2: Add LFO to FM Engine

**Files:**
- Modify: `src/core/fm-synth-engine.ts`

**Implementation:**

Add private members:
```typescript
private lfo: Tone.LFO;
private lfoGain: Tone.Gain;
```

In constructor, create LFO and connect based on destination:
```typescript
this.lfo = new Tone.LFO({
  frequency: this.params.lfo.rate,
  min: -1,
  max: 1,
  type: this.params.lfo.waveform,
});
this.lfoGain = new Tone.Gain(this.params.lfo.depth);
this.lfo.connect(this.lfoGain);

// Connect based on destination
this.connectLFOToDestination(this.params.lfo.destination);
```

Add methods:
- `setLFORate(rate: number)`
- `setLFODepth(depth: number)`
- `setLFOWaveform(waveform: LFOWaveform)`
- `setLFODestination(destination: FMLFODestination)`
- `private connectLFOToDestination(destination: FMLFODestination)`

Start LFO in `start()` method.

**Verify:** `npx tsc --noEmit` passes

---

### Task 3: Add Glide, Noise, Pan to FM Engine

**Files:**
- Modify: `src/core/fm-synth-engine.ts`

**Implementation:**

Add private members:
```typescript
private noise: Tone.Noise;
private noiseGain: Tone.Gain;
private noiseFilter: Tone.Filter;
private panner: Tone.Panner;
```

In constructor:
- Create Noise -> NoiseFilter -> NoiseGain, connect to effects chain input
- Create Panner between effects chain output and analyser
- Set synth portamento based on glide params

Add methods:
- `setNoiseType(type: NoiseType)`
- `setNoiseLevel(level: number)`
- `setGlideEnabled(enabled: boolean)`
- `setGlideTime(time: number)`
- `setPan(pan: number)`

Update triggerAttack to respect glide settings.

**Verify:** `npx tsc --noEmit` passes

---

### Task 4: Add Velocity to FM Engine

**Files:**
- Modify: `src/core/fm-synth-engine.ts`

**Implementation:**

Store current velocity:
```typescript
private currentVelocity = 1;
```

Modify `triggerAttack` to accept optional velocity:
```typescript
triggerAttack(note: string | number, velocity = 1): void {
  this.currentVelocity = velocity;
  // Apply velocity to amplitude
  const ampScale = 1 - this.params.velocity.ampAmount * (1 - velocity);
  // Apply velocity to mod index
  const modIndexScale = 1 - this.params.velocity.modIndexAmount * (1 - velocity);
  // ... apply scaling
}
```

Add methods:
- `setVelocityAmpAmount(amount: number)`
- `setVelocityModIndexAmount(amount: number)`

**Verify:** `npx tsc --noEmit` passes

---

### Task 5: Add Arpeggiator to FM Engine

**Files:**
- Modify: `src/core/fm-synth-engine.ts`

**Implementation:**

Add private members:
```typescript
private arpSequence: Tone.Sequence | null = null;
private heldNotes: string[] = [];
```

Implement arpeggiator pattern generation (reuse logic from synth-engine.ts):
```typescript
private generateArpNotes(): string[] {
  // Generate notes based on pattern, octaves, held notes
}

private startArpeggiator(): void {
  // Create Tone.Sequence with generated notes
}

private stopArpeggiator(): void {
  // Stop and dispose sequence
}
```

Add methods:
- `setArpEnabled(enabled: boolean)`
- `setArpPattern(pattern: ArpPattern)`
- `setArpDivision(division: ArpDivision)`
- `setArpOctaves(octaves: 1 | 2 | 3 | 4)`
- `setArpGate(gate: number)`

**Verify:** `npx tsc --noEmit` passes

---

### Task 6: Add Mod Matrix to FM Engine

**Files:**
- Modify: `src/core/fm-synth-engine.ts`

**Implementation:**

Add method to apply modulation from matrix:
```typescript
private applyModMatrix(): void {
  for (const route of this.params.modMatrix.routes) {
    if (!route.enabled || route.amount === 0) continue;
    // Get source value, apply to destination with amount
  }
}
```

Add methods:
- `setModRoute(index: number, route: Partial<FMModRoute>)`
- `getModulatedValues(): Record<FMModDestination, number>` (for real-time display)

**Verify:** `npx tsc --noEmit` passes

---

### Task 7: Update FM Synth Store

**Files:**
- Modify: `src/ui/stores/fm-synth-store.ts`

**Implementation:**

Add state fields for new params (already in FMSynthParams type).

Add actions:
- LFO: `setLFORate`, `setLFODepth`, `setLFOWaveform`, `setLFODestination`
- Noise: `setNoiseType`, `setNoiseLevel`
- Glide: `setGlideEnabled`, `setGlideTime`
- Pan: `setPan`
- Velocity: `setVelocityAmpAmount`, `setVelocityModIndexAmount`
- Arp: `setArpEnabled`, `setArpPattern`, `setArpDivision`, `setArpOctaves`, `setArpGate`
- Mod Matrix: `setModRoute`

Each action calls corresponding engine method and updates params.

**Verify:** `npx tsc --noEmit` passes

---

### Task 8: Update FMSynthView with New UI

**Files:**
- Modify: `src/ui/views/FMSynthView.tsx`

**Implementation:**

Import additional components:
- `LFOVisualizer`, `NoiseVisualizer`, `Oscilloscope`
- `ModMatrixGrid` (parameterize for FM sources/destinations)

Add new StageCards in signal flow:
1. **LFO** - Rate knob, Depth knob, Waveform selector, Destination dropdown
2. **NOISE** - Type selector, Level knob
3. **VELOCITY** - Amp Amount slider, Mod Index Amount slider
4. **ARP** - Enable toggle, Pattern selector, Division selector, Octaves selector, Gate knob
5. **MOD MATRIX** - Reuse/adapt ModMatrixGrid for FM sources/destinations
6. **GLIDE** - Enable toggle, Time knob (can be in FM SYNTHESIS card or small card)
7. Add **Pan** knob and **Oscilloscope** to OUTPUT card

**Verify:** `bun run dev` - FM synth loads with all new controls visible

---

## Phase 2: Additive Synth (Tasks 9-15)

### Task 9: Add Additive-specific Types to types.ts

**Files:**
- Modify: `src/core/types.ts`

**Implementation:**

Add new types:

```typescript
// Additive LFO destination options
export type AdditiveLFODestination = 'brightness' | 'pitch';

// Additive Mod Matrix sources and destinations
export type AdditiveModSource = 'lfo' | 'ampEnvelope' | 'velocity';
export type AdditiveModDestination = 'brightness' | 'pitch' | 'pan' | 'amplitude' | 'oddHarmonics' | 'evenHarmonics';

// Additive-specific LFO params
export interface AdditiveLFOParams {
  rate: number;
  depth: number;
  waveform: LFOWaveform;
  destination: AdditiveLFODestination;
}

// Additive Mod Matrix
export interface AdditiveModRoute {
  source: AdditiveModSource;
  destination: AdditiveModDestination;
  amount: number;
  enabled: boolean;
}

export interface AdditiveModMatrix {
  routes: [AdditiveModRoute, AdditiveModRoute, AdditiveModRoute, AdditiveModRoute];
}

// Additive Velocity
export interface AdditiveVelocityParams {
  ampAmount: number;
  brightnessAmount: number;
}
```

Update AdditiveSynthParams interface to include new fields.
Update DEFAULT_ADDITIVE_SYNTH_PARAMS with new defaults.

**Verify:** `npx tsc --noEmit` - expect errors in additive-synth-engine.ts

---

### Task 10: Add LFO to Additive Engine

**Files:**
- Modify: `src/core/additive-synth-engine.ts`

**Implementation:**

Add LFO that modulates:
- `brightness`: Scales gain of harmonics 5-16 collectively
- `pitch`: Modulates frequency of all oscillators

Add methods:
- `setLFORate(rate: number)`
- `setLFODepth(depth: number)`
- `setLFOWaveform(waveform: LFOWaveform)`
- `setLFODestination(destination: AdditiveLFODestination)`

**Verify:** `npx tsc --noEmit` passes

---

### Task 11: Add Glide, Noise, Pan to Additive Engine

**Files:**
- Modify: `src/core/additive-synth-engine.ts`

**Implementation:**

Similar to FM engine:
- Noise mixed into signal before effects
- Panner after masterGain, before analyser
- Glide: smoothly ramp oscillator frequencies on note change

Add methods:
- `setNoiseType`, `setNoiseLevel`
- `setGlideEnabled`, `setGlideTime`
- `setPan`

**Verify:** `npx tsc --noEmit` passes

---

### Task 12: Add Velocity to Additive Engine

**Files:**
- Modify: `src/core/additive-synth-engine.ts`

**Implementation:**

Velocity affects:
- Amplitude (via envelope scaling)
- Brightness (scale harmonics 5-16 based on velocity)

Modify triggerAttack to accept velocity parameter.

Add methods:
- `setVelocityAmpAmount(amount: number)`
- `setVelocityBrightnessAmount(amount: number)`

**Verify:** `npx tsc --noEmit` passes

---

### Task 13: Add Arpeggiator to Additive Engine

**Files:**
- Modify: `src/core/additive-synth-engine.ts`

**Implementation:**

Identical pattern to FM arpeggiator - reuse same logic.

Add methods:
- `setArpEnabled`, `setArpPattern`, `setArpDivision`, `setArpOctaves`, `setArpGate`

**Verify:** `npx tsc --noEmit` passes

---

### Task 14: Update Additive Synth Store

**Files:**
- Modify: `src/ui/stores/additive-synth-store.ts`

**Implementation:**

Add all new actions mirroring FM store pattern.

**Verify:** `npx tsc --noEmit` passes

---

### Task 15: Update AdditiveSynthView with New UI

**Files:**
- Modify: `src/ui/views/AdditiveSynthView.tsx`

**Implementation:**

Add same new StageCards as FM, adapted for Additive:
- LFO (destinations: brightness, pitch)
- NOISE
- VELOCITY (Amp Amount, Brightness Amount)
- ARP
- MOD MATRIX (Additive sources/destinations)
- GLIDE
- Pan + Oscilloscope in OUTPUT

**Verify:** `bun run dev` - Additive synth loads with all new controls visible

---

## Phase 3: Polish (Tasks 16-18)

### Task 16: Extract Reusable ArpeggiatorControls Component

**Files:**
- Create: `src/ui/components/ArpeggiatorControls.tsx`
- Modify: `src/ui/views/SynthView.tsx` (use new component)
- Modify: `src/ui/views/FMSynthView.tsx` (use new component)
- Modify: `src/ui/views/AdditiveSynthView.tsx` (use new component)

**Implementation:**

Extract arp UI into reusable component with props:
```typescript
interface ArpeggiatorControlsProps {
  enabled: boolean;
  pattern: ArpPattern;
  division: ArpDivision;
  octaves: 1 | 2 | 3 | 4;
  gate: number;
  onEnabledChange: (enabled: boolean) => void;
  onPatternChange: (pattern: ArpPattern) => void;
  onDivisionChange: (division: ArpDivision) => void;
  onOctavesChange: (octaves: 1 | 2 | 3 | 4) => void;
  onGateChange: (gate: number) => void;
  accentColor: string;
}
```

**Verify:** All three synth views work with extracted component

---

### Task 17: Update Presets with New Parameters

**Files:**
- Modify: `src/data/presets/fm-presets.ts`
- Modify: `src/data/presets/additive-presets.ts`

**Implementation:**

Update existing presets to include default values for new parameters.
Add 2-3 new presets per synth showcasing new features:
- FM: "Wobble Bass" (LFO → mod index), "Arp Lead"
- Additive: "Shimmer Pad" (LFO → brightness), "Pluck Arp"

**Verify:** Presets load without errors

---

### Task 18: Final Verification

**Implementation:**

1. Run `npx tsc --noEmit` - all types pass
2. Run `bun test` - all 395+ tests pass
3. Manual test in browser:
   - FM synth: all new controls work
   - Additive synth: all new controls work
   - Presets load correctly
4. Commit all changes

**Verify:** All checks pass, ready for merge

---

## Files Summary

| File | Changes |
|------|---------|
| `src/core/types.ts` | Add FM/Additive LFO, ModMatrix, Velocity types |
| `src/core/fm-synth-engine.ts` | Add LFO, Noise, Glide, Pan, Velocity, Arp, ModMatrix |
| `src/core/additive-synth-engine.ts` | Add LFO, Noise, Glide, Pan, Velocity, Arp, ModMatrix |
| `src/ui/stores/fm-synth-store.ts` | Add actions for all new parameters |
| `src/ui/stores/additive-synth-store.ts` | Add actions for all new parameters |
| `src/ui/views/FMSynthView.tsx` | Add UI modules for new features |
| `src/ui/views/AdditiveSynthView.tsx` | Add UI modules for new features |
| `src/ui/components/ArpeggiatorControls.tsx` | New reusable component |
| `src/data/presets/fm-presets.ts` | Update presets |
| `src/data/presets/additive-presets.ts` | Update presets |
