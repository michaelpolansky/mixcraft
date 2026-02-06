# FM Synthesis Engine Design

**Date:** 2026-02-05
**Status:** Approved
**Module:** Sound Design (SD6)

---

## Overview

Add FM synthesis capabilities to Mixcraft's audio engine, enabling the SD6 curriculum module ("Synthesis Techniques - FM bells/basses"). This design introduces a new `FMSynthEngine` class alongside the existing subtractive `SynthEngine`, with shared infrastructure for effects processing and visualization.

## Goals

1. Implement intermediate-level FM synthesis with educational parameter exposure
2. Extract reusable effects chain from existing SynthEngine
3. Create composable UI that swaps synthesis panels based on challenge type
4. Add carrier/modulator visualization to show FM concepts visually
5. Integrate with existing sound comparison and evaluation system

## Non-Goals

- Advanced FM (4-op, 6-op DX7-style) - future enhancement
- AM synthesis - separate future work
- Granular synthesis - separate future work

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      SynthView (shell)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SpectrumAnalyzer (shared)              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   SubtractiveSynthPanel  OR  FMSynthPanel           │   │
│  │   (swapped based on challenge.synthesisType)        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              EffectsPanel (shared)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Transport + A/B Toggle (shared)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Signal Flow

```
FMSynthEngine:
  Tone.FMSynth → EffectsChain.input
                      ↓
                 Distortion (dry/wet)
                      ↓
                 Delay (dry/wet)
                      ↓
                 Chorus (dry/wet)
                      ↓
                 Reverb (dry/wet)
                      ↓
                 EffectsChain.output → Analyser → Destination
```

---

## Component Details

### 1. EffectsChain Class

Extracted from SynthEngine. Reusable effects processor for any audio source.

**File:** `src/core/effects-chain.ts`

```typescript
interface EffectsParams {
  distortion: DistortionParams;
  delay: DelayParams;
  chorus: ChorusParams;
  reverb: ReverbParams;
}

class EffectsChain {
  constructor(initialParams?: Partial<EffectsParams>)

  get input(): Tone.InputNode
  get output(): Tone.OutputNode

  setDistortion(params: Partial<DistortionParams>): void
  setDelay(params: Partial<DelayParams>): void
  setReverb(params: Partial<ReverbParams>): void
  setChorus(params: Partial<ChorusParams>): void
  setParams(params: Partial<EffectsParams>): void
  getParams(): EffectsParams

  dispose(): void
}
```

### 2. FMSynthEngine Class

Wraps Tone.FMSynth with intermediate-level parameter exposure.

**File:** `src/core/fm-synth-engine.ts`

**Parameters:**

| Parameter | Type | Range | Default | Notes |
|-----------|------|-------|---------|-------|
| harmonicity | number | 0.5 - 12 | 1 | Presets: 1, 2, 3, 4, 5, 6 (harmonic) |
| modulationIndex | number | 0 - 10 | 2 | 0 = pure carrier, 10 = extreme FM |
| carrierType | OscillatorType | sine, triangle, square, sawtooth | sine | Classic FM uses sine |
| modulatorType | OscillatorType | sine, triangle, square, sawtooth | sine | Non-sine = harsher |
| amplitudeEnvelope | ADSREnvelope | standard ADSR ranges | plucky | Same as subtractive |
| modulationEnvelopeAmount | number | 0 - 1 | 0.5 | Envelope → modIndex depth |
| volume | number | -60 to +6 dB | -12 | Output level |

**API:**

```typescript
interface FMSynthParams {
  harmonicity: number;
  modulationIndex: number;
  carrierType: OscillatorType;
  modulatorType: OscillatorType;
  amplitudeEnvelope: ADSREnvelope;
  modulationEnvelopeAmount: number;
  volume: number;
  effects: EffectsParams;
}

class FMSynthEngine {
  constructor(initialParams?: Partial<FMSynthParams>)

  // Audio context
  async start(): Promise<void>
  get initialized(): boolean
  dispose(): void

  // Parameters
  setHarmonicity(ratio: number): void
  setModulationIndex(index: number): void
  setCarrierType(type: OscillatorType): void
  setModulatorType(type: OscillatorType): void
  setAmplitudeEnvelope(adsr: Partial<ADSREnvelope>): void
  setModulationEnvelopeAmount(amount: number): void
  setVolume(db: number): void
  setParams(params: Partial<FMSynthParams>): void
  getParams(): FMSynthParams

  // Effects (delegated to EffectsChain)
  setDistortion(params: Partial<DistortionParams>): void
  setDelay(params: Partial<DelayParams>): void
  setReverb(params: Partial<ReverbParams>): void
  setChorus(params: Partial<ChorusParams>): void

  // Note control
  triggerAttack(note: string | number): void
  triggerRelease(): void
  triggerAttackRelease(note: string | number, duration: number | string): void

  // Visualization
  getAnalyser(): AnalyserNode
  getFrequencyData(): Uint8Array
  getTimeDomainData(): Uint8Array
  getCarrierWaveform(): Float32Array   // For FM visualization
  getModulatorWaveform(): Float32Array // For FM visualization
}
```

### 3. FMSynthPanel Component

UI controls for FM synthesis parameters.

**File:** `src/ui/components/FMSynthPanel.tsx`

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  CARRIER                    MODULATOR                    │
│  ┌────────────────┐        ┌────────────────┐           │
│  │ (waveform viz) │        │ (waveform viz) │           │
│  └────────────────┘        └────────────────┘           │
│  [sine▾] Waveform          [sine▾] Waveform             │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  RATIO        MODULATION                                │
│  ┌────┐       ┌────┐  ┌────┐                           │
│  │    │       │    │  │    │                           │
│  └────┘       └────┘  └────┘                           │
│  Harmonicity  Index   Env Amt                          │
│  [1][2][3][4][5][6] ← Quick ratio presets              │
│                                                          │
│  ENVELOPE                                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                          │
│  │ A  │ │ D  │ │ S  │ │ R  │                          │
│  └────┘ └────┘ └────┘ └────┘                          │
└──────────────────────────────────────────────────────────┘
```

### 4. CarrierModulatorViz Component

Real-time waveform visualization showing carrier and modulator oscillators.

**File:** `src/ui/components/CarrierModulatorViz.tsx`

- Two side-by-side Canvas 2D displays
- Updates at 60fps from engine.getCarrierWaveform() / getModulatorWaveform()
- Shows students *why* FM creates its characteristic sounds

### 5. SubtractiveSynthPanel Component

Extracted from current SynthView - oscillator, filter, envelopes, LFO controls.

**File:** `src/ui/components/SubtractiveSynthPanel.tsx`

### 6. Refactored SynthView

Composable shell that swaps synthesis panels based on challenge type.

**File:** `src/ui/views/SynthView.tsx`

```typescript
function SynthView({ challenge }: { challenge: SoundDesignChallenge }) {
  const synthesisType = challenge.synthesisType ?? 'subtractive';

  return (
    <div className="synth-view">
      <SpectrumAnalyzer analyser={engine.getAnalyser()} />

      {synthesisType === 'subtractive' ? (
        <SubtractiveSynthPanel engine={synthEngine} />
      ) : (
        <FMSynthPanel engine={fmEngine} />
      )}

      <EffectsPanel engine={engine} />
      <Transport />
    </div>
  );
}
```

---

## Type Definitions

**File:** `src/core/types.ts`

```typescript
// FM Synth Parameters
export interface FMSynthParams {
  harmonicity: number;
  modulationIndex: number;
  carrierType: OscillatorType;
  modulatorType: OscillatorType;
  amplitudeEnvelope: ADSREnvelope;
  modulationEnvelopeAmount: number;
  volume: number;
  effects: EffectsParams;
}

export const DEFAULT_FM_SYNTH_PARAMS: FMSynthParams = {
  harmonicity: 1,
  modulationIndex: 2,
  carrierType: 'sine',
  modulatorType: 'sine',
  amplitudeEnvelope: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.5,
  },
  modulationEnvelopeAmount: 0.5,
  volume: -12,
  effects: DEFAULT_EFFECTS_PARAMS,
};

// Challenge type extension
export interface SoundDesignChallenge {
  // ... existing fields
  synthesisType: 'subtractive' | 'fm';
  targetParams: SynthParams | FMSynthParams;
}
```

---

## Evaluation Integration

### Sound Comparison

The existing `compareSounds` function analyzes audio features (spectral centroid, attack time, RMS envelope, spectrum). These work for FM sounds - the analysis measures the *result*, not how it was synthesized.

### FM Parameter Comparison

**File:** `src/core/sound-comparison.ts`

```typescript
function compareFMParams(
  player: FMSynthParams,
  target: FMSynthParams
): { score: number; breakdown: FMParamBreakdown } {
  const harmonicityScore = compareRatio(player.harmonicity, target.harmonicity);
  const modIndexScore = compareValue(player.modulationIndex, target.modulationIndex, 10);
  const carrierTypeScore = player.carrierType === target.carrierType ? 100 : 50;
  const modulatorTypeScore = player.modulatorType === target.modulatorType ? 100 : 50;
  const envelopeScore = compareEnvelope(player.amplitudeEnvelope, target.amplitudeEnvelope);

  // Weighted average
  const score = (
    harmonicityScore * 0.25 +
    modIndexScore * 0.25 +
    carrierTypeScore * 0.15 +
    modulatorTypeScore * 0.15 +
    envelopeScore * 0.20
  );

  return { score, breakdown: { ... } };
}
```

### Scoring Weights

Same as subtractive synthesis:
- **70%** Audio features (spectral similarity, temporal envelope)
- **30%** Parameter match (FM-specific comparison)

---

## SD6 Challenge Examples

| Challenge | Harmonicity | ModIndex | Carrier | Modulator | Learning |
|-----------|-------------|----------|---------|-----------|----------|
| FM Bell | 3.5 | 5 | sine | sine | Non-integer ratios = bell-like inharmonics |
| Electric Piano | 1 | 2 | sine | sine | Classic FM EP with fast decay |
| FM Bass | 1 | 8 | sine | sine | Heavy modulation for grit |
| Metallic Hit | 7 | 4 | sine | sine | High ratios = metallic inharmonics |
| Bright Pad | 2 | 3 | sine | triangle | Non-sine modulator = extra harmonics |
| Pluck Lead | 4 | 6 | sine | sine | Mod envelope for plucky attack |

---

## Files Summary

### New Files

| File | Description | Est. Lines |
|------|-------------|------------|
| `src/core/effects-chain.ts` | Reusable effects processor | ~150 |
| `src/core/fm-synth-engine.ts` | FM synthesis engine | ~300 |
| `src/ui/components/FMSynthPanel.tsx` | FM parameter controls | ~200 |
| `src/ui/components/SubtractiveSynthPanel.tsx` | Extracted subtractive controls | ~150 |
| `src/ui/components/CarrierModulatorViz.tsx` | Dual waveform visualization | ~100 |

### Modified Files

| File | Changes |
|------|---------|
| `src/core/synth-engine.ts` | Refactor to use EffectsChain |
| `src/core/types.ts` | Add FMSynthParams, update challenge types |
| `src/core/sound-comparison.ts` | Add compareFMParams function |
| `src/ui/views/SynthView.tsx` | Composable structure with panel swapping |
| `src/ui/stores/synth-store.ts` | Support FM engine state |

---

## Implementation Order

1. **EffectsChain** - Extract from SynthEngine, verify existing tests pass
2. **FMSynthEngine** - Core engine with Tone.FMSynth wrapper
3. **Types** - FMSynthParams and challenge type updates
4. **FMSynthPanel** - UI controls for FM parameters
5. **CarrierModulatorViz** - Waveform visualization
6. **SubtractiveSynthPanel** - Extract from SynthView
7. **SynthView refactor** - Composable shell with panel swapping
8. **FM comparison** - Evaluation integration
9. **SD6 challenges** - Create FM challenge definitions

---

## Testing Strategy

- Unit tests for EffectsChain parameter setting
- Unit tests for FMSynthEngine parameter mapping
- Unit tests for compareFMParams scoring
- Existing SynthEngine tests must continue passing after refactor
- Manual testing of FM sounds in browser
