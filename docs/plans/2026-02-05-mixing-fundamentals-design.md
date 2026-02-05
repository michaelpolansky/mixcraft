# Mixing Fundamentals (F1-F8) Design

**Date:** 2026-02-05
**Status:** Approved

## Overview

32 challenges teaching EQ, compression, reverb, delay, and levels using procedurally generated audio. Designed to support real stems in the future.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Audio source | Procedural (Tone.js) | Fast to build, no external deps |
| UI approach | Unified ChallengeView | Reuse existing architecture |
| EQ complexity | 3-band (Low/Mid/High) | Simple for fundamentals |
| Compressor | Progressive disclosure | F4 simple, F5 adds attack/release |
| Evaluation | Hybrid | Target matching (F1-F5), problem fixing (F6-F8) |

## Architecture

### New Files

```
src/
  core/
    audio-source.ts      # Procedural audio generator
    mixing-effects.ts    # EQ, Compressor wrappers
  ui/
    components/
      EQControl.tsx      # 3-band EQ with visual feedback
      CompressorControl.tsx  # Progressive compressor UI
      GainMeter.tsx      # Level meter with peak/RMS
  data/
    challenges/
      f1/ through f8/    # 32 mixing challenges
```

### Audio Source System

Procedural signals for teaching mixing concepts:

| Source Type | Implementation | Used For |
|-------------|----------------|----------|
| Tone | Sine/saw/square at frequency | F1 frequency basics |
| Noise | White/pink noise, filtered | EQ exercises |
| Drum | Noise burst + sine + envelope | Compression |
| Bass | Low sine + harmonics | Low-end EQ |
| Pad | Filtered saw + slow attack | Reverb/delay |

```typescript
interface AudioSource {
  type: 'tone' | 'noise' | 'drum' | 'bass' | 'pad';
  frequency?: number;
  duration: number;
  loop: boolean;
}
```

Future: Add `{ type: 'stem', url: string }` for real audio.

### Effects

**3-Band EQ:**
```typescript
interface EQParams {
  low: number;   // -12 to +12 dB, shelf ~400Hz
  mid: number;   // -12 to +12 dB, peak ~1kHz
  high: number;  // -12 to +12 dB, shelf ~2.5kHz
}
```

**Compressor:**
```typescript
// F4: Simple
interface CompressorSimple {
  threshold: number;  // -60 to 0 dB
  amount: number;     // 0-100% (maps to ratio)
}

// F5: Full
interface CompressorFull extends CompressorSimple {
  attack: number;   // 0.001 to 1s
  release: number;  // 0.01 to 1s
}
```

**Effects Chain:**
```
AudioSource → EQ → Compressor → Reverb → Delay → Output
```

Reverb and delay reuse existing Sound Design implementations.

## Challenge Structure

| Module | Type | Source | Goal |
|--------|------|--------|------|
| F1 Frequency basics | Target match | Tones | Match EQ |
| F2 EQ cuts | Target match | Noise | Cut to match |
| F3 EQ boosts | Target match | Dull sounds | Boost to match |
| F4 Dynamics basics | Target match | Drums | Compress to match |
| F5 Attack/release | Target match | Transients | Shape dynamics |
| F6 Reverb basics | Problem fix | Dry sounds | Add space |
| F7 Delay basics | Problem fix | Various | Add rhythm/depth |
| F8 Levels | Problem fix | Loud/quiet | Fix gain |

### Evaluation

**Target matching (F1-F5):**
- 70% audio features (spectral, dynamics)
- 30% parameter proximity
- Same scoring as Sound Design

**Problem fixing (F6-F8):**
- AI evaluates if problem solved
- Checks for new problems
- More subjective assessment

## UI Components

**EQControl:** Three vertical sliders, frequency band visualization
**CompressorControl:** Knobs + gain reduction meter, progressive disclosure
**GainMeter:** Vertical meter with peak hold, clipping indicator

**ChallengeView integration:**
```tsx
{challenge.module.startsWith('SD') && <SynthControls />}
{challenge.module.startsWith('F') && <MixingControls />}
```

## Implementation Order

1. Audio source system (procedural generators)
2. EQ effect + EQControl component
3. F1-F3 challenges (8 total)
4. Compressor effect + CompressorControl
5. F4-F5 challenges (8 total)
6. GainMeter component
7. F6-F8 challenges (16 total)
8. Polish and testing

## Future Expansion

- Real audio stems via `{ type: 'stem', url: string }`
- Parametric EQ for Intermediate modules
- Multi-track mixing for Advanced modules
- Separate MixingView with channel strips
