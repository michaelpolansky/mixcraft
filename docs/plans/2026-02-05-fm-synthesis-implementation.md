# FM Synthesis Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add FM synthesis capabilities to Mixcraft's audio engine for the SD6 curriculum module.

**Architecture:** Separate `FMSynthEngine` class alongside existing `SynthEngine`, with a shared `EffectsChain` extracted from the current implementation. Composable `SynthView` swaps between `SubtractiveSynthPanel` and `FMSynthPanel` based on challenge type.

**Tech Stack:** TypeScript, Tone.js (FMSynth), React, Zustand, Vitest, Canvas 2D

---

## Task 1: Add FM Synth Types

**Files:**
- Modify: `src/core/types.ts`

**Step 1: Add FMSynthParams interface**

Add after line 127 (after `SynthParams` interface):

```typescript
// ============================================
// FM Synth Types
// ============================================

export interface FMSynthParams {
  /** Ratio between modulator and carrier frequency (0.5 to 12) */
  harmonicity: number;
  /** Depth of frequency modulation (0 to 10) */
  modulationIndex: number;
  /** Carrier oscillator waveform */
  carrierType: OscillatorType;
  /** Modulator oscillator waveform */
  modulatorType: OscillatorType;
  /** Amplitude envelope */
  amplitudeEnvelope: ADSREnvelope;
  /** How much the modulation envelope affects modIndex (0 to 1) */
  modulationEnvelopeAmount: number;
  /** Effects processors */
  effects: EffectsParams;
  /** Master volume in dB (-60 to 0) */
  volume: number;
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
  effects: DEFAULT_EFFECTS,
  volume: -12,
};

export const FM_PARAM_RANGES = {
  harmonicity: { min: 0.5, max: 12, step: 0.1 },
  modulationIndex: { min: 0, max: 10, step: 0.1 },
  modulationEnvelopeAmount: { min: 0, max: 1, step: 0.01 },
} as const;

/** Common harmonicity presets for quick selection */
export const HARMONICITY_PRESETS = [1, 2, 3, 4, 5, 6] as const;
```

**Step 2: Update Challenge type to support synthesis type**

Find the `Challenge` interface (around line 270) and add:

```typescript
export interface Challenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of what to create */
  description: string;
  /** Star difficulty (1-3) */
  difficulty: 1 | 2 | 3;
  /** Synthesis type for this challenge */
  synthesisType?: 'subtractive' | 'fm';
  /** Target synth parameters to match (type depends on synthesisType) */
  targetParams: SynthParams | FMSynthParams;
  /** Progressive hints (revealed one at a time) */
  hints: string[];
  /** Curriculum module (e.g., "SD1", "SD6") */
  module: string;
  /** Note to play for comparison (e.g., "C4") */
  testNote: string;
}
```

**Step 3: Verify types compile**

Run: `bun run typecheck` or `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/core/types.ts
git commit -m "feat(types): add FMSynthParams and FM-related types"
```

---

## Task 2: Create EffectsChain Class

**Files:**
- Create: `src/core/effects-chain.ts`
- Test: `src/tests/core/effects-chain.test.ts`

**Step 1: Write the failing test**

Create `src/tests/core/effects-chain.test.ts`:

```typescript
/**
 * Tests for EffectsChain
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EffectsChain } from '../../core/effects-chain.ts';
import { DEFAULT_EFFECTS } from '../../core/types.ts';

describe('EffectsChain', () => {
  let chain: EffectsChain;

  beforeEach(() => {
    chain = new EffectsChain();
  });

  afterEach(() => {
    chain.dispose();
  });

  describe('Initialization', () => {
    it('initializes with default parameters', () => {
      const params = chain.getParams();
      expect(params.distortion.amount).toBe(0);
      expect(params.delay.mix).toBe(0);
      expect(params.reverb.mix).toBe(0);
      expect(params.chorus.mix).toBe(0);
    });

    it('accepts custom initial parameters', () => {
      const custom = new EffectsChain({
        distortion: { amount: 0.5, mix: 0.5 },
      });
      expect(custom.getParams().distortion.amount).toBe(0.5);
      custom.dispose();
    });
  });

  describe('Distortion', () => {
    it('sets distortion amount', () => {
      chain.setDistortion({ amount: 0.7 });
      expect(chain.getParams().distortion.amount).toBe(0.7);
    });

    it('sets distortion mix', () => {
      chain.setDistortion({ mix: 0.5 });
      expect(chain.getParams().distortion.mix).toBe(0.5);
    });
  });

  describe('Delay', () => {
    it('sets delay time', () => {
      chain.setDelay({ time: 0.5 });
      expect(chain.getParams().delay.time).toBe(0.5);
    });

    it('sets delay feedback', () => {
      chain.setDelay({ feedback: 0.6 });
      expect(chain.getParams().delay.feedback).toBe(0.6);
    });

    it('sets delay mix', () => {
      chain.setDelay({ mix: 0.4 });
      expect(chain.getParams().delay.mix).toBe(0.4);
    });
  });

  describe('Reverb', () => {
    it('sets reverb decay', () => {
      chain.setReverb({ decay: 3.0 });
      expect(chain.getParams().reverb.decay).toBe(3.0);
    });

    it('sets reverb mix', () => {
      chain.setReverb({ mix: 0.3 });
      expect(chain.getParams().reverb.mix).toBe(0.3);
    });
  });

  describe('Chorus', () => {
    it('sets chorus rate', () => {
      chain.setChorus({ rate: 2.0 });
      expect(chain.getParams().chorus.rate).toBe(2.0);
    });

    it('sets chorus depth', () => {
      chain.setChorus({ depth: 0.7 });
      expect(chain.getParams().chorus.depth).toBe(0.7);
    });

    it('sets chorus mix', () => {
      chain.setChorus({ mix: 0.5 });
      expect(chain.getParams().chorus.mix).toBe(0.5);
    });
  });

  describe('Bulk update', () => {
    it('sets all params at once', () => {
      chain.setParams({
        distortion: { amount: 0.2, mix: 0.2 },
        delay: { time: 0.3, feedback: 0.4, mix: 0.3 },
      });
      expect(chain.getParams().distortion.amount).toBe(0.2);
      expect(chain.getParams().delay.time).toBe(0.3);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/tests/core/effects-chain.test.ts`
Expected: FAIL - Cannot find module '../../core/effects-chain.ts'

**Step 3: Write the EffectsChain implementation**

Create `src/core/effects-chain.ts`:

```typescript
/**
 * EffectsChain
 * Reusable effects processor: Distortion → Delay → Chorus → Reverb
 */

import * as Tone from 'tone';
import type {
  EffectsParams,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
} from './types.ts';
import { DEFAULT_EFFECTS } from './types.ts';

/**
 * Reusable effects chain for audio processing
 *
 * Signal flow:
 * input → distortion (dry/wet) → delay (dry/wet) → chorus (dry/wet) → reverb (dry/wet) → output
 */
export class EffectsChain {
  private params: EffectsParams;

  // Effects nodes
  private distortion: Tone.Distortion;
  private distortionDry: Tone.Gain;
  private distortionWet: Tone.Gain;
  private delay: Tone.FeedbackDelay;
  private delayDry: Tone.Gain;
  private delayWet: Tone.Gain;
  private chorus: Tone.Chorus;
  private chorusDry: Tone.Gain;
  private chorusWet: Tone.Gain;
  private reverb: Tone.Reverb;
  private reverbDry: Tone.Gain;
  private reverbWet: Tone.Gain;

  // Connection points
  private inputGain: Tone.Gain;
  private outputGain: Tone.Gain;

  // Merge points for dry/wet
  private postDistortion: Tone.Gain;
  private postDelay: Tone.Gain;
  private postChorus: Tone.Gain;

  constructor(initialParams: Partial<EffectsParams> = {}) {
    this.params = {
      distortion: { ...DEFAULT_EFFECTS.distortion, ...initialParams.distortion },
      delay: { ...DEFAULT_EFFECTS.delay, ...initialParams.delay },
      reverb: { ...DEFAULT_EFFECTS.reverb, ...initialParams.reverb },
      chorus: { ...DEFAULT_EFFECTS.chorus, ...initialParams.chorus },
    };

    // Create input/output
    this.inputGain = new Tone.Gain(1);
    this.outputGain = new Tone.Gain(1);

    // Create distortion with dry/wet
    this.distortion = new Tone.Distortion(this.params.distortion.amount);
    this.distortionDry = new Tone.Gain(1 - this.params.distortion.mix);
    this.distortionWet = new Tone.Gain(this.params.distortion.mix);
    this.postDistortion = new Tone.Gain(1);

    // Create delay with dry/wet
    this.delay = new Tone.FeedbackDelay({
      delayTime: this.params.delay.time,
      feedback: this.params.delay.feedback,
    });
    this.delayDry = new Tone.Gain(1 - this.params.delay.mix);
    this.delayWet = new Tone.Gain(this.params.delay.mix);
    this.postDelay = new Tone.Gain(1);

    // Create chorus with dry/wet
    this.chorus = new Tone.Chorus({
      frequency: this.params.chorus.rate,
      depth: this.params.chorus.depth,
      wet: 1,
    }).start();
    this.chorusDry = new Tone.Gain(1 - this.params.chorus.mix);
    this.chorusWet = new Tone.Gain(this.params.chorus.mix);
    this.postChorus = new Tone.Gain(1);

    // Create reverb with dry/wet
    this.reverb = new Tone.Reverb({
      decay: this.params.reverb.decay,
      wet: 1,
    });
    this.reverbDry = new Tone.Gain(1 - this.params.reverb.mix);
    this.reverbWet = new Tone.Gain(this.params.reverb.mix);

    // Wire the chain
    this.wireChain();
  }

  private wireChain(): void {
    // Input → Distortion stage
    this.inputGain.connect(this.distortionDry);
    this.inputGain.connect(this.distortion);
    this.distortion.connect(this.distortionWet);
    this.distortionDry.connect(this.postDistortion);
    this.distortionWet.connect(this.postDistortion);

    // Distortion → Delay stage
    this.postDistortion.connect(this.delayDry);
    this.postDistortion.connect(this.delay);
    this.delay.connect(this.delayWet);
    this.delayDry.connect(this.postDelay);
    this.delayWet.connect(this.postDelay);

    // Delay → Chorus stage
    this.postDelay.connect(this.chorusDry);
    this.postDelay.connect(this.chorus);
    this.chorus.connect(this.chorusWet);
    this.chorusDry.connect(this.postChorus);
    this.chorusWet.connect(this.postChorus);

    // Chorus → Reverb stage
    this.postChorus.connect(this.reverbDry);
    this.postChorus.connect(this.reverb);
    this.reverb.connect(this.reverbWet);
    this.reverbDry.connect(this.outputGain);
    this.reverbWet.connect(this.outputGain);
  }

  /**
   * Get the input node to connect sources to
   */
  get input(): Tone.InputNode {
    return this.inputGain;
  }

  /**
   * Get the output node to connect to destination/analyser
   */
  get output(): Tone.OutputNode {
    return this.outputGain;
  }

  /**
   * Get current parameters
   */
  getParams(): EffectsParams {
    return {
      distortion: { ...this.params.distortion },
      delay: { ...this.params.delay },
      reverb: { ...this.params.reverb },
      chorus: { ...this.params.chorus },
    };
  }

  /**
   * Set distortion parameters
   */
  setDistortion(params: Partial<DistortionParams>): void {
    if (params.amount !== undefined) {
      this.params.distortion.amount = params.amount;
      this.distortion.distortion = params.amount;
    }
    if (params.mix !== undefined) {
      this.params.distortion.mix = params.mix;
      this.distortionDry.gain.value = 1 - params.mix;
      this.distortionWet.gain.value = params.mix;
    }
  }

  /**
   * Set delay parameters
   */
  setDelay(params: Partial<DelayParams>): void {
    if (params.time !== undefined) {
      this.params.delay.time = params.time;
      this.delay.delayTime.value = params.time;
    }
    if (params.feedback !== undefined) {
      this.params.delay.feedback = params.feedback;
      this.delay.feedback.value = params.feedback;
    }
    if (params.mix !== undefined) {
      this.params.delay.mix = params.mix;
      this.delayDry.gain.value = 1 - params.mix;
      this.delayWet.gain.value = params.mix;
    }
  }

  /**
   * Set reverb parameters
   */
  setReverb(params: Partial<ReverbParams>): void {
    if (params.decay !== undefined) {
      this.params.reverb.decay = params.decay;
      this.reverb.decay = params.decay;
    }
    if (params.mix !== undefined) {
      this.params.reverb.mix = params.mix;
      this.reverbDry.gain.value = 1 - params.mix;
      this.reverbWet.gain.value = params.mix;
    }
  }

  /**
   * Set chorus parameters
   */
  setChorus(params: Partial<ChorusParams>): void {
    if (params.rate !== undefined) {
      this.params.chorus.rate = params.rate;
      this.chorus.frequency.value = params.rate;
    }
    if (params.depth !== undefined) {
      this.params.chorus.depth = params.depth;
      this.chorus.depth = params.depth;
    }
    if (params.mix !== undefined) {
      this.params.chorus.mix = params.mix;
      this.chorusDry.gain.value = 1 - params.mix;
      this.chorusWet.gain.value = params.mix;
    }
  }

  /**
   * Set all parameters at once
   */
  setParams(params: Partial<EffectsParams>): void {
    if (params.distortion) this.setDistortion(params.distortion);
    if (params.delay) this.setDelay(params.delay);
    if (params.reverb) this.setReverb(params.reverb);
    if (params.chorus) this.setChorus(params.chorus);
  }

  /**
   * Connect output to a destination
   */
  connect(destination: Tone.InputNode): void {
    this.outputGain.connect(destination);
  }

  /**
   * Disconnect from all destinations
   */
  disconnect(): void {
    this.outputGain.disconnect();
  }

  /**
   * Dispose all nodes
   */
  dispose(): void {
    this.distortion.dispose();
    this.distortionDry.dispose();
    this.distortionWet.dispose();
    this.delay.dispose();
    this.delayDry.dispose();
    this.delayWet.dispose();
    this.chorus.dispose();
    this.chorusDry.dispose();
    this.chorusWet.dispose();
    this.reverb.dispose();
    this.reverbDry.dispose();
    this.reverbWet.dispose();
    this.inputGain.dispose();
    this.outputGain.dispose();
    this.postDistortion.dispose();
    this.postDelay.dispose();
    this.postChorus.dispose();
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `bun test src/tests/core/effects-chain.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/core/effects-chain.ts src/tests/core/effects-chain.test.ts
git commit -m "feat(audio): add EffectsChain class with tests"
```

---

## Task 3: Refactor SynthEngine to Use EffectsChain

**Files:**
- Modify: `src/core/synth-engine.ts`

**Step 1: Run existing tests to ensure baseline**

Run: `bun test`
Expected: All tests PASS (baseline)

**Step 2: Import EffectsChain and refactor**

In `src/core/synth-engine.ts`, add import at top:

```typescript
import { EffectsChain } from './effects-chain.ts';
```

**Step 3: Replace effects nodes with EffectsChain**

Remove these private fields (lines ~62-73):
```typescript
  // Remove these:
  private distortion: Tone.Distortion;
  private distortionDry: Tone.Gain;
  private distortionWet: Tone.Gain;
  private delay: Tone.FeedbackDelay;
  private delayDry: Tone.Gain;
  private delayWet: Tone.Gain;
  private reverb: Tone.Reverb;
  private reverbDry: Tone.Gain;
  private reverbWet: Tone.Gain;
  private chorus: Tone.Chorus;
  private chorusDry: Tone.Gain;
  private chorusWet: Tone.Gain;
```

Add instead:
```typescript
  private effectsChain: EffectsChain;
```

**Step 4: Update constructor**

Replace effects creation code (lines ~127-201) with:

```typescript
    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser node for spectrum visualization
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: synth → effectsChain → analyser → destination
    this.synth.connect(this.effectsChain.input);
    this.effectsChain.connect(this.analyser);
    Tone.connect(this.analyser, Tone.getDestination());
```

**Step 5: Update effects methods to delegate to EffectsChain**

Replace the effects methods (setDistortion, setDelay, etc.) to delegate:

```typescript
  // ============================================
  // Effects Controls (delegated to EffectsChain)
  // ============================================

  setDistortion(distortionParams: Partial<DistortionParams>): void {
    this.params.effects.distortion = { ...this.params.effects.distortion, ...distortionParams };
    this.effectsChain.setDistortion(distortionParams);
  }

  setDistortionAmount(amount: number): void {
    this.setDistortion({ amount });
  }

  setDistortionMix(mix: number): void {
    this.setDistortion({ mix });
  }

  setDelay(delayParams: Partial<DelayParams>): void {
    this.params.effects.delay = { ...this.params.effects.delay, ...delayParams };
    this.effectsChain.setDelay(delayParams);
  }

  setDelayTime(time: number): void {
    this.setDelay({ time });
  }

  setDelayFeedback(feedback: number): void {
    this.setDelay({ feedback });
  }

  setDelayMix(mix: number): void {
    this.setDelay({ mix });
  }

  setReverb(reverbParams: Partial<ReverbParams>): void {
    this.params.effects.reverb = { ...this.params.effects.reverb, ...reverbParams };
    this.effectsChain.setReverb(reverbParams);
  }

  setReverbDecay(decay: number): void {
    this.setReverb({ decay });
  }

  setReverbMix(mix: number): void {
    this.setReverb({ mix });
  }

  setChorus(chorusParams: Partial<ChorusParams>): void {
    this.params.effects.chorus = { ...this.params.effects.chorus, ...chorusParams };
    this.effectsChain.setChorus(chorusParams);
  }

  setChorusRate(rate: number): void {
    this.setChorus({ rate });
  }

  setChorusDepth(depth: number): void {
    this.setChorus({ depth });
  }

  setChorusMix(mix: number): void {
    this.setChorus({ mix });
  }
```

**Step 6: Update dispose method**

Replace effects disposal with:

```typescript
  dispose(): void {
    this.lfo.stop();
    this.lfo.dispose();
    this.lfoGain.dispose();
    this.effectsChain.dispose();
    this.synth.dispose();
  }
```

**Step 7: Run all tests to verify refactor**

Run: `bun test`
Expected: All tests PASS

**Step 8: Commit**

```bash
git add src/core/synth-engine.ts
git commit -m "refactor(synth): use EffectsChain for effects processing"
```

---

## Task 4: Create FMSynthEngine

**Files:**
- Create: `src/core/fm-synth-engine.ts`
- Test: `src/tests/core/fm-synth-engine.test.ts`

**Step 1: Write failing tests**

Create `src/tests/core/fm-synth-engine.test.ts`:

```typescript
/**
 * Tests for FM Synth Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FMSynthEngine } from '../../core/fm-synth-engine.ts';
import { DEFAULT_FM_SYNTH_PARAMS } from '../../core/types.ts';

describe('FMSynthEngine', () => {
  let engine: FMSynthEngine;

  beforeEach(() => {
    engine = new FMSynthEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  describe('Initialization', () => {
    it('initializes with default parameters', () => {
      const params = engine.getParams();
      expect(params.harmonicity).toBe(1);
      expect(params.modulationIndex).toBe(2);
      expect(params.carrierType).toBe('sine');
      expect(params.modulatorType).toBe('sine');
    });

    it('accepts custom initial parameters', () => {
      const custom = new FMSynthEngine({
        harmonicity: 3,
        modulationIndex: 5,
      });
      expect(custom.getParams().harmonicity).toBe(3);
      expect(custom.getParams().modulationIndex).toBe(5);
      custom.dispose();
    });
  });

  describe('Harmonicity', () => {
    it('sets harmonicity', () => {
      engine.setHarmonicity(3);
      expect(engine.getParams().harmonicity).toBe(3);
    });

    it('clamps harmonicity to valid range', () => {
      engine.setHarmonicity(0.1);
      expect(engine.getParams().harmonicity).toBe(0.5);

      engine.setHarmonicity(15);
      expect(engine.getParams().harmonicity).toBe(12);
    });
  });

  describe('Modulation Index', () => {
    it('sets modulation index', () => {
      engine.setModulationIndex(5);
      expect(engine.getParams().modulationIndex).toBe(5);
    });

    it('clamps modulation index to valid range', () => {
      engine.setModulationIndex(-1);
      expect(engine.getParams().modulationIndex).toBe(0);

      engine.setModulationIndex(15);
      expect(engine.getParams().modulationIndex).toBe(10);
    });
  });

  describe('Oscillator Types', () => {
    it('sets carrier type', () => {
      engine.setCarrierType('triangle');
      expect(engine.getParams().carrierType).toBe('triangle');
    });

    it('sets modulator type', () => {
      engine.setModulatorType('square');
      expect(engine.getParams().modulatorType).toBe('square');
    });
  });

  describe('Amplitude Envelope', () => {
    it('sets attack', () => {
      engine.setAmplitudeEnvelope({ attack: 0.5 });
      expect(engine.getParams().amplitudeEnvelope.attack).toBe(0.5);
    });

    it('sets full ADSR', () => {
      engine.setAmplitudeEnvelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0.6,
        release: 0.8,
      });
      const env = engine.getParams().amplitudeEnvelope;
      expect(env.attack).toBe(0.1);
      expect(env.decay).toBe(0.2);
      expect(env.sustain).toBe(0.6);
      expect(env.release).toBe(0.8);
    });
  });

  describe('Modulation Envelope Amount', () => {
    it('sets modulation envelope amount', () => {
      engine.setModulationEnvelopeAmount(0.8);
      expect(engine.getParams().modulationEnvelopeAmount).toBe(0.8);
    });

    it('clamps to valid range', () => {
      engine.setModulationEnvelopeAmount(1.5);
      expect(engine.getParams().modulationEnvelopeAmount).toBe(1);
    });
  });

  describe('Volume', () => {
    it('sets volume', () => {
      engine.setVolume(-6);
      expect(engine.getParams().volume).toBe(-6);
    });
  });

  describe('Effects', () => {
    it('sets distortion', () => {
      engine.setDistortion({ amount: 0.5 });
      expect(engine.getParams().effects.distortion.amount).toBe(0.5);
    });

    it('sets delay', () => {
      engine.setDelay({ mix: 0.3 });
      expect(engine.getParams().effects.delay.mix).toBe(0.3);
    });
  });

  describe('Bulk update', () => {
    it('sets multiple params at once', () => {
      engine.setParams({
        harmonicity: 4,
        modulationIndex: 6,
        carrierType: 'triangle',
      });
      const params = engine.getParams();
      expect(params.harmonicity).toBe(4);
      expect(params.modulationIndex).toBe(6);
      expect(params.carrierType).toBe('triangle');
    });
  });

  describe('Analyser', () => {
    it('provides analyser node', () => {
      const analyser = engine.getAnalyser();
      expect(analyser).toBeDefined();
      expect(analyser.fftSize).toBe(2048);
    });

    it('provides frequency data', () => {
      const data = engine.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `bun test src/tests/core/fm-synth-engine.test.ts`
Expected: FAIL - Cannot find module

**Step 3: Implement FMSynthEngine**

Create `src/core/fm-synth-engine.ts`:

```typescript
/**
 * MIXCRAFT FM Synth Engine
 * Wraps Tone.js FMSynth for FM synthesis
 */

import * as Tone from 'tone';
import type {
  FMSynthParams,
  OscillatorType,
  ADSREnvelope,
  DistortionParams,
  DelayParams,
  ReverbParams,
  ChorusParams,
  AnalyserConfig,
} from './types.ts';
import {
  DEFAULT_FM_SYNTH_PARAMS,
  FM_PARAM_RANGES,
  DEFAULT_ANALYSER_CONFIG,
} from './types.ts';
import { EffectsChain } from './effects-chain.ts';

/**
 * Clamp a value to a range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * FMSynthEngine class - wraps Tone.FMSynth for FM synthesis
 */
export class FMSynthEngine {
  private synth: Tone.FMSynth;
  private effectsChain: EffectsChain;
  private analyser: AnalyserNode;
  private params: FMSynthParams;
  private isInitialized = false;

  constructor(initialParams: Partial<FMSynthParams> = {}) {
    this.params = {
      ...DEFAULT_FM_SYNTH_PARAMS,
      ...initialParams,
      amplitudeEnvelope: {
        ...DEFAULT_FM_SYNTH_PARAMS.amplitudeEnvelope,
        ...initialParams.amplitudeEnvelope,
      },
      effects: {
        ...DEFAULT_FM_SYNTH_PARAMS.effects,
        ...initialParams.effects,
      },
    };

    // Create the FMSynth
    this.synth = new Tone.FMSynth({
      harmonicity: this.params.harmonicity,
      modulationIndex: this.params.modulationIndex,
      oscillator: {
        type: this.params.carrierType,
      },
      modulation: {
        type: this.params.modulatorType,
      },
      envelope: {
        attack: this.params.amplitudeEnvelope.attack,
        decay: this.params.amplitudeEnvelope.decay,
        sustain: this.params.amplitudeEnvelope.sustain,
        release: this.params.amplitudeEnvelope.release,
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: this.params.modulationEnvelopeAmount,
        release: 0.5,
      },
      volume: this.params.volume,
    });

    // Create effects chain
    this.effectsChain = new EffectsChain(this.params.effects);

    // Create analyser
    this.analyser = Tone.getContext().createAnalyser();
    this.configureAnalyser(DEFAULT_ANALYSER_CONFIG);

    // Wire: synth → effectsChain → analyser → destination
    this.synth.connect(this.effectsChain.input);
    this.effectsChain.connect(this.analyser);
    Tone.connect(this.analyser, Tone.getDestination());
  }

  /**
   * Configure analyser settings
   */
  configureAnalyser(config: Partial<AnalyserConfig>): void {
    const fullConfig = { ...DEFAULT_ANALYSER_CONFIG, ...config };
    this.analyser.fftSize = fullConfig.fftSize;
    this.analyser.smoothingTimeConstant = fullConfig.smoothingTimeConstant;
    this.analyser.minDecibels = fullConfig.minDecibels;
    this.analyser.maxDecibels = fullConfig.maxDecibels;
  }

  /**
   * Start audio context (requires user gesture)
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  getParams(): FMSynthParams {
    return {
      ...this.params,
      amplitudeEnvelope: { ...this.params.amplitudeEnvelope },
      effects: {
        distortion: { ...this.params.effects.distortion },
        delay: { ...this.params.effects.delay },
        reverb: { ...this.params.effects.reverb },
        chorus: { ...this.params.effects.chorus },
      },
    };
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getTimeDomainData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // ============================================
  // FM-Specific Controls
  // ============================================

  setHarmonicity(ratio: number): void {
    this.params.harmonicity = clamp(
      ratio,
      FM_PARAM_RANGES.harmonicity.min,
      FM_PARAM_RANGES.harmonicity.max
    );
    this.synth.harmonicity.value = this.params.harmonicity;
  }

  setModulationIndex(index: number): void {
    this.params.modulationIndex = clamp(
      index,
      FM_PARAM_RANGES.modulationIndex.min,
      FM_PARAM_RANGES.modulationIndex.max
    );
    this.synth.modulationIndex.value = this.params.modulationIndex;
  }

  setCarrierType(type: OscillatorType): void {
    this.params.carrierType = type;
    this.synth.oscillator.type = type;
  }

  setModulatorType(type: OscillatorType): void {
    this.params.modulatorType = type;
    this.synth.modulation.type = type;
  }

  setAmplitudeEnvelope(envelope: Partial<ADSREnvelope>): void {
    this.params.amplitudeEnvelope = { ...this.params.amplitudeEnvelope, ...envelope };

    if (envelope.attack !== undefined) {
      this.synth.envelope.attack = envelope.attack;
    }
    if (envelope.decay !== undefined) {
      this.synth.envelope.decay = envelope.decay;
    }
    if (envelope.sustain !== undefined) {
      this.synth.envelope.sustain = envelope.sustain;
    }
    if (envelope.release !== undefined) {
      this.synth.envelope.release = envelope.release;
    }
  }

  setModulationEnvelopeAmount(amount: number): void {
    this.params.modulationEnvelopeAmount = clamp(
      amount,
      FM_PARAM_RANGES.modulationEnvelopeAmount.min,
      FM_PARAM_RANGES.modulationEnvelopeAmount.max
    );
    this.synth.modulationEnvelope.sustain = this.params.modulationEnvelopeAmount;
  }

  setVolume(db: number): void {
    this.params.volume = db;
    this.synth.volume.value = db;
  }

  // ============================================
  // Effects Controls (delegated to EffectsChain)
  // ============================================

  setDistortion(params: Partial<DistortionParams>): void {
    this.params.effects.distortion = { ...this.params.effects.distortion, ...params };
    this.effectsChain.setDistortion(params);
  }

  setDelay(params: Partial<DelayParams>): void {
    this.params.effects.delay = { ...this.params.effects.delay, ...params };
    this.effectsChain.setDelay(params);
  }

  setReverb(params: Partial<ReverbParams>): void {
    this.params.effects.reverb = { ...this.params.effects.reverb, ...params };
    this.effectsChain.setReverb(params);
  }

  setChorus(params: Partial<ChorusParams>): void {
    this.params.effects.chorus = { ...this.params.effects.chorus, ...params };
    this.effectsChain.setChorus(params);
  }

  // ============================================
  // Bulk Update
  // ============================================

  setParams(params: Partial<FMSynthParams>): void {
    if (params.harmonicity !== undefined) {
      this.setHarmonicity(params.harmonicity);
    }
    if (params.modulationIndex !== undefined) {
      this.setModulationIndex(params.modulationIndex);
    }
    if (params.carrierType !== undefined) {
      this.setCarrierType(params.carrierType);
    }
    if (params.modulatorType !== undefined) {
      this.setModulatorType(params.modulatorType);
    }
    if (params.amplitudeEnvelope) {
      this.setAmplitudeEnvelope(params.amplitudeEnvelope);
    }
    if (params.modulationEnvelopeAmount !== undefined) {
      this.setModulationEnvelopeAmount(params.modulationEnvelopeAmount);
    }
    if (params.volume !== undefined) {
      this.setVolume(params.volume);
    }
    if (params.effects) {
      if (params.effects.distortion) this.setDistortion(params.effects.distortion);
      if (params.effects.delay) this.setDelay(params.effects.delay);
      if (params.effects.reverb) this.setReverb(params.effects.reverb);
      if (params.effects.chorus) this.setChorus(params.effects.chorus);
    }
  }

  // ============================================
  // Note Triggering
  // ============================================

  triggerAttack(note: string | number): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();
    this.synth.triggerAttack(frequency);
  }

  triggerRelease(): void {
    this.synth.triggerRelease();
  }

  triggerAttackRelease(note: string | number, duration: number | string = '8n'): void {
    const frequency = typeof note === 'number'
      ? note
      : Tone.Frequency(note).toFrequency();
    this.synth.triggerAttackRelease(frequency, duration);
  }

  // ============================================
  // Cleanup
  // ============================================

  dispose(): void {
    this.effectsChain.dispose();
    this.synth.dispose();
  }
}

/**
 * Factory function
 */
export function createFMSynthEngine(params?: Partial<FMSynthParams>): FMSynthEngine {
  return new FMSynthEngine(params);
}
```

**Step 4: Run tests to verify they pass**

Run: `bun test src/tests/core/fm-synth-engine.test.ts`
Expected: All tests PASS

**Step 5: Run all tests**

Run: `bun test`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/core/fm-synth-engine.ts src/tests/core/fm-synth-engine.test.ts
git commit -m "feat(audio): add FMSynthEngine with tests"
```

---

## Task 5: Create FM Synth Store

**Files:**
- Create: `src/ui/stores/fm-synth-store.ts`

**Step 1: Create the store**

Create `src/ui/stores/fm-synth-store.ts`:

```typescript
/**
 * Zustand store for FM synth state management
 * Bridges React UI with the FMSynthEngine
 */

import { create } from 'zustand';
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import type {
  FMSynthParams,
  OscillatorType,
  ADSREnvelope,
} from '../../core/types.ts';
import { DEFAULT_FM_SYNTH_PARAMS, HARMONICITY_PRESETS } from '../../core/types.ts';

interface FMSynthStore {
  // State
  params: FMSynthParams;
  engine: FMSynthEngine | null;
  isPlaying: boolean;
  currentNote: string;
  isInitialized: boolean;

  // Initialization
  initEngine: () => void;
  startAudio: () => Promise<void>;

  // Note control
  playNote: (note?: string) => void;
  stopNote: () => void;
  setCurrentNote: (note: string) => void;

  // FM-specific actions
  setHarmonicity: (ratio: number) => void;
  setHarmonicityPreset: (preset: number) => void;
  setModulationIndex: (index: number) => void;
  setCarrierType: (type: OscillatorType) => void;
  setModulatorType: (type: OscillatorType) => void;
  setModulationEnvelopeAmount: (amount: number) => void;

  // Amplitude envelope actions
  setAmplitudeAttack: (time: number) => void;
  setAmplitudeDecay: (time: number) => void;
  setAmplitudeSustain: (level: number) => void;
  setAmplitudeRelease: (time: number) => void;

  // Effects actions
  setDistortionAmount: (amount: number) => void;
  setDistortionMix: (mix: number) => void;
  setDelayTime: (time: number) => void;
  setDelayFeedback: (feedback: number) => void;
  setDelayMix: (mix: number) => void;
  setReverbDecay: (decay: number) => void;
  setReverbMix: (mix: number) => void;
  setChorusRate: (rate: number) => void;
  setChorusDepth: (depth: number) => void;
  setChorusMix: (mix: number) => void;

  // Volume
  setVolume: (db: number) => void;

  // Reset
  resetToDefaults: () => void;

  // Cleanup
  dispose: () => void;
}

export const useFMSynthStore = create<FMSynthStore>((set, get) => ({
  // Initial state
  params: { ...DEFAULT_FM_SYNTH_PARAMS },
  engine: null,
  isPlaying: false,
  currentNote: 'C4',
  isInitialized: false,

  initEngine: () => {
    const { engine } = get();
    if (engine) return;

    const newEngine = createFMSynthEngine();
    set({ engine: newEngine });
  },

  startAudio: async () => {
    const { engine } = get();
    if (!engine) return;

    await engine.start();
    set({ isInitialized: true });
  },

  playNote: (note?: string) => {
    const { engine, currentNote, isInitialized } = get();
    if (!engine || !isInitialized) return;

    const noteToPlay = note ?? currentNote;
    engine.triggerAttack(noteToPlay);
    set({ isPlaying: true, currentNote: noteToPlay });
  },

  stopNote: () => {
    const { engine } = get();
    if (!engine) return;

    engine.triggerRelease();
    set({ isPlaying: false });
  },

  setCurrentNote: (note: string) => {
    set({ currentNote: note });
  },

  // FM-specific
  setHarmonicity: (ratio: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setHarmonicity(ratio);
    set({ params: engine.getParams() });
  },

  setHarmonicityPreset: (preset: number) => {
    const { engine } = get();
    if (!engine) return;

    if (HARMONICITY_PRESETS.includes(preset as any)) {
      engine.setHarmonicity(preset);
      set({ params: engine.getParams() });
    }
  },

  setModulationIndex: (index: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulationIndex(index);
    set({ params: engine.getParams() });
  },

  setCarrierType: (type: OscillatorType) => {
    const { engine } = get();
    if (!engine) return;

    engine.setCarrierType(type);
    set({ params: engine.getParams() });
  },

  setModulatorType: (type: OscillatorType) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulatorType(type);
    set({ params: engine.getParams() });
  },

  setModulationEnvelopeAmount: (amount: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulationEnvelopeAmount(amount);
    set({ params: engine.getParams() });
  },

  // Amplitude envelope
  setAmplitudeAttack: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ attack: time });
    set({ params: engine.getParams() });
  },

  setAmplitudeDecay: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ decay: time });
    set({ params: engine.getParams() });
  },

  setAmplitudeSustain: (level: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ sustain: level });
    set({ params: engine.getParams() });
  },

  setAmplitudeRelease: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ release: time });
    set({ params: engine.getParams() });
  },

  // Effects
  setDistortionAmount: (amount: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDistortion({ amount });
    set({ params: engine.getParams() });
  },

  setDistortionMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDistortion({ mix });
    set({ params: engine.getParams() });
  },

  setDelayTime: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ time });
    set({ params: engine.getParams() });
  },

  setDelayFeedback: (feedback: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ feedback });
    set({ params: engine.getParams() });
  },

  setDelayMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ mix });
    set({ params: engine.getParams() });
  },

  setReverbDecay: (decay: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverb({ decay });
    set({ params: engine.getParams() });
  },

  setReverbMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverb({ mix });
    set({ params: engine.getParams() });
  },

  setChorusRate: (rate: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ rate });
    set({ params: engine.getParams() });
  },

  setChorusDepth: (depth: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ depth });
    set({ params: engine.getParams() });
  },

  setChorusMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ mix });
    set({ params: engine.getParams() });
  },

  setVolume: (db: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setVolume(db);
    set({ params: engine.getParams() });
  },

  resetToDefaults: () => {
    const { engine } = get();
    if (!engine) return;

    engine.setParams(DEFAULT_FM_SYNTH_PARAMS);
    set({ params: engine.getParams() });
  },

  dispose: () => {
    const { engine } = get();
    if (engine) {
      engine.dispose();
      set({ engine: null, isInitialized: false });
    }
  },
}));
```

**Step 2: Commit**

```bash
git add src/ui/stores/fm-synth-store.ts
git commit -m "feat(stores): add FM synth Zustand store"
```

---

## Task 6: Create FMSynthPanel Component

**Files:**
- Create: `src/ui/components/FMSynthPanel.tsx`
- Create: `src/ui/components/CarrierModulatorViz.tsx`

**Step 1: Create CarrierModulatorViz**

Create `src/ui/components/CarrierModulatorViz.tsx`:

```typescript
/**
 * Carrier/Modulator Waveform Visualization
 * Shows real-time oscillator waveforms for FM synthesis education
 */

import { useEffect, useRef } from 'react';
import type { OscillatorType } from '../../core/types.ts';

interface CarrierModulatorVizProps {
  carrierType: OscillatorType;
  modulatorType: OscillatorType;
  harmonicity: number;
  modulationIndex: number;
}

/**
 * Draw a waveform on canvas
 */
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  type: OscillatorType,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const centerY = height / 2;
  const amplitude = height * 0.35;

  for (let x = 0; x < width; x++) {
    const phase = (x / width) * Math.PI * 4; // Two full cycles
    let y: number;

    switch (type) {
      case 'sine':
        y = centerY + Math.sin(phase) * amplitude;
        break;
      case 'square':
        y = centerY + (Math.sin(phase) > 0 ? 1 : -1) * amplitude;
        break;
      case 'sawtooth':
        y = centerY - ((phase % (Math.PI * 2)) / Math.PI - 1) * amplitude;
        break;
      case 'triangle':
        const t = (phase % (Math.PI * 2)) / (Math.PI * 2);
        y = centerY + (t < 0.5 ? 4 * t - 1 : 3 - 4 * t) * amplitude;
        break;
      default:
        y = centerY;
    }

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

export function CarrierModulatorViz({
  carrierType,
  modulatorType,
  harmonicity,
  modulationIndex,
}: CarrierModulatorVizProps) {
  const carrierRef = useRef<HTMLCanvasElement>(null);
  const modulatorRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const carrierCanvas = carrierRef.current;
    const modulatorCanvas = modulatorRef.current;
    if (!carrierCanvas || !modulatorCanvas) return;

    const carrierCtx = carrierCanvas.getContext('2d');
    const modulatorCtx = modulatorCanvas.getContext('2d');
    if (!carrierCtx || !modulatorCtx) return;

    // Clear
    carrierCtx.fillStyle = '#0a0a0a';
    carrierCtx.fillRect(0, 0, carrierCanvas.width, carrierCanvas.height);
    modulatorCtx.fillStyle = '#0a0a0a';
    modulatorCtx.fillRect(0, 0, modulatorCanvas.width, modulatorCanvas.height);

    // Draw center lines
    carrierCtx.strokeStyle = '#222';
    carrierCtx.lineWidth = 1;
    carrierCtx.beginPath();
    carrierCtx.moveTo(0, carrierCanvas.height / 2);
    carrierCtx.lineTo(carrierCanvas.width, carrierCanvas.height / 2);
    carrierCtx.stroke();

    modulatorCtx.strokeStyle = '#222';
    modulatorCtx.lineWidth = 1;
    modulatorCtx.beginPath();
    modulatorCtx.moveTo(0, modulatorCanvas.height / 2);
    modulatorCtx.lineTo(modulatorCanvas.width, modulatorCanvas.height / 2);
    modulatorCtx.stroke();

    // Draw waveforms
    drawWaveform(carrierCtx, carrierType, carrierCanvas.width, carrierCanvas.height, '#00ff88');
    drawWaveform(modulatorCtx, modulatorType, modulatorCanvas.width, modulatorCanvas.height, '#ff8800');
  }, [carrierType, modulatorType]);

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            color: '#00ff88',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Carrier
        </div>
        <canvas
          ref={carrierRef}
          width={140}
          height={60}
          style={{
            background: '#0a0a0a',
            borderRadius: '4px',
            border: '1px solid #222',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            color: '#ff8800',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Modulator ({harmonicity}x)
        </div>
        <canvas
          ref={modulatorRef}
          width={140}
          height={60}
          style={{
            background: '#0a0a0a',
            borderRadius: '4px',
            border: '1px solid #222',
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Create FMSynthPanel**

Create `src/ui/components/FMSynthPanel.tsx`:

```typescript
/**
 * FM Synth Panel
 * Controls for FM synthesis parameters
 */

import { Knob, WaveformSelector } from './index.ts';
import { CarrierModulatorViz } from './CarrierModulatorViz.tsx';
import { PARAM_RANGES, FM_PARAM_RANGES, HARMONICITY_PRESETS } from '../../core/types.ts';
import type { FMSynthParams, OscillatorType } from '../../core/types.ts';

interface FMSynthPanelProps {
  params: FMSynthParams;
  onHarmonicityChange: (value: number) => void;
  onHarmonicityPreset: (preset: number) => void;
  onModulationIndexChange: (value: number) => void;
  onCarrierTypeChange: (type: OscillatorType) => void;
  onModulatorTypeChange: (type: OscillatorType) => void;
  onModEnvAmountChange: (value: number) => void;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FMSynthPanel({
  params,
  onHarmonicityChange,
  onHarmonicityPreset,
  onModulationIndexChange,
  onCarrierTypeChange,
  onModulatorTypeChange,
  onModEnvAmountChange,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  onVolumeChange,
}: FMSynthPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Carrier/Modulator Visualization */}
      <Section title="Oscillators">
        <CarrierModulatorViz
          carrierType={params.carrierType}
          modulatorType={params.modulatorType}
          harmonicity={params.harmonicity}
          modulationIndex={params.modulationIndex}
        />
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <WaveformSelector
              value={params.carrierType}
              onChange={onCarrierTypeChange}
              label="Carrier"
            />
          </div>
          <div style={{ flex: 1 }}>
            <WaveformSelector
              value={params.modulatorType}
              onChange={onModulatorTypeChange}
              label="Modulator"
            />
          </div>
        </div>
      </Section>

      {/* FM Parameters */}
      <Section title="Modulation">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <Knob
              value={params.harmonicity}
              min={FM_PARAM_RANGES.harmonicity.min}
              max={FM_PARAM_RANGES.harmonicity.max}
              onChange={onHarmonicityChange}
              size={56}
              label="Ratio"
            />
            {/* Quick preset buttons */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
              {HARMONICITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onHarmonicityPreset(preset)}
                  style={{
                    width: '24px',
                    height: '24px',
                    background: params.harmonicity === preset ? '#00ff88' : '#222',
                    border: 'none',
                    borderRadius: '4px',
                    color: params.harmonicity === preset ? '#000' : '#888',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <Knob
            value={params.modulationIndex}
            min={FM_PARAM_RANGES.modulationIndex.min}
            max={FM_PARAM_RANGES.modulationIndex.max}
            onChange={onModulationIndexChange}
            size={56}
            label="Index"
          />
          <Knob
            value={params.modulationEnvelopeAmount}
            min={FM_PARAM_RANGES.modulationEnvelopeAmount.min}
            max={FM_PARAM_RANGES.modulationEnvelopeAmount.max}
            onChange={onModEnvAmountChange}
            size={56}
            label="Env Amt"
          />
        </div>
      </Section>

      {/* Amplitude Envelope */}
      <Section title="Envelope">
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Knob
            value={params.amplitudeEnvelope.attack}
            min={PARAM_RANGES.attack.min}
            max={PARAM_RANGES.attack.max}
            onChange={onAttackChange}
            size={48}
            label="A"
          />
          <Knob
            value={params.amplitudeEnvelope.decay}
            min={PARAM_RANGES.decay.min}
            max={PARAM_RANGES.decay.max}
            onChange={onDecayChange}
            size={48}
            label="D"
          />
          <Knob
            value={params.amplitudeEnvelope.sustain}
            min={PARAM_RANGES.sustain.min}
            max={PARAM_RANGES.sustain.max}
            onChange={onSustainChange}
            size={48}
            label="S"
          />
          <Knob
            value={params.amplitudeEnvelope.release}
            min={PARAM_RANGES.release.min}
            max={PARAM_RANGES.release.max}
            onChange={onReleaseChange}
            size={48}
            label="R"
          />
        </div>
      </Section>

      {/* Volume */}
      <Section title="Output">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Knob
            value={params.volume}
            min={PARAM_RANGES.volume.min}
            max={PARAM_RANGES.volume.max}
            onChange={onVolumeChange}
            size={56}
            label="Volume"
            unit="dB"
          />
        </div>
      </Section>
    </div>
  );
}
```

**Step 3: Export from components index**

Add to `src/ui/components/index.ts`:

```typescript
export { FMSynthPanel } from './FMSynthPanel.tsx';
export { CarrierModulatorViz } from './CarrierModulatorViz.tsx';
```

**Step 4: Commit**

```bash
git add src/ui/components/FMSynthPanel.tsx src/ui/components/CarrierModulatorViz.tsx src/ui/components/index.ts
git commit -m "feat(ui): add FMSynthPanel and CarrierModulatorViz components"
```

---

## Task 7: Create FMSynthView

**Files:**
- Create: `src/ui/views/FMSynthView.tsx`

**Step 1: Create the view**

Create `src/ui/views/FMSynthView.tsx`:

```typescript
/**
 * FM Synthesizer View
 * Complete FM synth interface with real-time spectrum analysis
 */

import { useEffect, useCallback } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  SpectrumAnalyzer,
  PianoKeyboard,
  FMSynthPanel,
} from '../components/index.ts';

export function FMSynthView() {
  const {
    params,
    isInitialized,
    engine,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setHarmonicity,
    setHarmonicityPreset,
    setModulationIndex,
    setCarrierType,
    setModulatorType,
    setModulationEnvelopeAmount,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
    setVolume,
  } = useFMSynthStore();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle first interaction to start audio
  const handleFirstInteraction = useCallback(async () => {
    if (!isInitialized) {
      await startAudio();
    }
  }, [isInitialized, startAudio]);

  // Handle keyboard note events
  const handleNoteOn = useCallback(
    async (note: string) => {
      await handleFirstInteraction();
      playNote(note);
    },
    [handleFirstInteraction, playNote]
  );

  const handleNoteOff = useCallback(() => {
    stopNote();
  }, [stopNote]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          FM Synthesizer
        </h1>
        {!isInitialized && (
          <button
            onClick={handleFirstInteraction}
            style={{
              background: '#00ff88',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start Audio
          </button>
        )}
      </div>

      {/* Spectrum Analyzer */}
      <div
        style={{
          background: '#141414',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #2a2a2a',
        }}
      >
        <SpectrumAnalyzer
          getAnalyser={() => engine?.getAnalyser() ?? null}
          height={150}
        />
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* FM Controls */}
        <div style={{ flex: 1 }}>
          <FMSynthPanel
            params={params}
            onHarmonicityChange={setHarmonicity}
            onHarmonicityPreset={setHarmonicityPreset}
            onModulationIndexChange={setModulationIndex}
            onCarrierTypeChange={setCarrierType}
            onModulatorTypeChange={setModulatorType}
            onModEnvAmountChange={setModulationEnvelopeAmount}
            onAttackChange={setAmplitudeAttack}
            onDecayChange={setAmplitudeDecay}
            onSustainChange={setAmplitudeSustain}
            onReleaseChange={setAmplitudeRelease}
            onVolumeChange={setVolume}
          />
        </div>
      </div>

      {/* Piano Keyboard */}
      <div
        style={{
          background: '#141414',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #2a2a2a',
        }}
      >
        <PianoKeyboard
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
          startOctave={3}
          octaves={3}
        />
      </div>
    </div>
  );
}
```

**Step 2: Export from views**

Add to `src/ui/views/index.ts` (create if doesn't exist):

```typescript
export { FMSynthView } from './FMSynthView.tsx';
```

**Step 3: Commit**

```bash
git add src/ui/views/FMSynthView.tsx src/ui/views/index.ts
git commit -m "feat(ui): add FMSynthView for FM synthesis"
```

---

## Task 8: Add FM Sound Comparison

**Files:**
- Modify: `src/core/sound-comparison.ts`
- Modify: `src/tests/core/sound-comparison.test.ts`

**Step 1: Add FM comparison tests**

Add to `src/tests/core/sound-comparison.test.ts`:

```typescript
import { compareFMParams } from '../../core/sound-comparison.ts';
import { DEFAULT_FM_SYNTH_PARAMS } from '../../core/types.ts';

describe('compareFMParams', () => {
  it('scores 100 for identical params', () => {
    const result = compareFMParams(DEFAULT_FM_SYNTH_PARAMS, DEFAULT_FM_SYNTH_PARAMS);
    expect(result.score).toBe(100);
  });

  it('penalizes harmonicity difference', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, harmonicity: 3 };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, harmonicity: 1 };
    const result = compareFMParams(player, target);
    expect(result.score).toBeLessThan(100);
    expect(result.breakdown.harmonicity).toBeLessThan(100);
  });

  it('penalizes modulation index difference', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, modulationIndex: 8 };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, modulationIndex: 2 };
    const result = compareFMParams(player, target);
    expect(result.score).toBeLessThan(100);
    expect(result.breakdown.modulationIndex).toBeLessThan(100);
  });

  it('penalizes wrong carrier type', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, carrierType: 'square' as const };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, carrierType: 'sine' as const };
    const result = compareFMParams(player, target);
    expect(result.breakdown.carrierType).toBe(50);
  });

  it('penalizes wrong modulator type', () => {
    const player = { ...DEFAULT_FM_SYNTH_PARAMS, modulatorType: 'sawtooth' as const };
    const target = { ...DEFAULT_FM_SYNTH_PARAMS, modulatorType: 'sine' as const };
    const result = compareFMParams(player, target);
    expect(result.breakdown.modulatorType).toBe(50);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `bun test src/tests/core/sound-comparison.test.ts`
Expected: FAIL - compareFMParams is not defined

**Step 3: Implement compareFMParams**

Add to `src/core/sound-comparison.ts`:

```typescript
import type { FMSynthParams, ADSREnvelope } from './types.ts';
import { FM_PARAM_RANGES } from './types.ts';

export interface FMParamBreakdown {
  harmonicity: number;
  modulationIndex: number;
  carrierType: number;
  modulatorType: number;
  envelope: number;
}

export interface FMComparisonResult {
  score: number;
  breakdown: FMParamBreakdown;
}

/**
 * Compare harmonicity ratio with tolerance for close values
 */
function compareHarmonicity(player: number, target: number): number {
  const maxDiff = FM_PARAM_RANGES.harmonicity.max - FM_PARAM_RANGES.harmonicity.min;
  const diff = Math.abs(player - target);
  return Math.max(0, 100 - (diff / maxDiff) * 100);
}

/**
 * Compare modulation index
 */
function compareModIndex(player: number, target: number): number {
  const maxDiff = FM_PARAM_RANGES.modulationIndex.max - FM_PARAM_RANGES.modulationIndex.min;
  const diff = Math.abs(player - target);
  return Math.max(0, 100 - (diff / maxDiff) * 100);
}

/**
 * Compare FM synth parameters
 */
export function compareFMParams(
  player: FMSynthParams,
  target: FMSynthParams
): FMComparisonResult {
  const breakdown: FMParamBreakdown = {
    harmonicity: compareHarmonicity(player.harmonicity, target.harmonicity),
    modulationIndex: compareModIndex(player.modulationIndex, target.modulationIndex),
    carrierType: player.carrierType === target.carrierType ? 100 : 50,
    modulatorType: player.modulatorType === target.modulatorType ? 100 : 50,
    envelope: compareEnvelope(player.amplitudeEnvelope, target.amplitudeEnvelope),
  };

  // Weighted average
  const score = Math.round(
    breakdown.harmonicity * 0.25 +
    breakdown.modulationIndex * 0.25 +
    breakdown.carrierType * 0.15 +
    breakdown.modulatorType * 0.15 +
    breakdown.envelope * 0.20
  );

  return { score, breakdown };
}

/**
 * Compare ADSR envelopes (reuse for FM)
 */
function compareEnvelope(player: ADSREnvelope, target: ADSREnvelope): number {
  const attackDiff = Math.abs(player.attack - target.attack) / 2; // max 2s
  const decayDiff = Math.abs(player.decay - target.decay) / 2;
  const sustainDiff = Math.abs(player.sustain - target.sustain); // 0-1
  const releaseDiff = Math.abs(player.release - target.release) / 5; // max 5s

  const avgDiff = (attackDiff + decayDiff + sustainDiff + releaseDiff) / 4;
  return Math.max(0, Math.round((1 - avgDiff) * 100));
}
```

**Step 4: Run tests**

Run: `bun test src/tests/core/sound-comparison.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/core/sound-comparison.ts src/tests/core/sound-comparison.test.ts
git commit -m "feat(evaluation): add FM parameter comparison"
```

---

## Task 9: Integration Test and Build

**Step 1: Run all tests**

Run: `bun test`
Expected: All tests PASS

**Step 2: Type check**

Run: `bun run typecheck` or `npx tsc --noEmit`
Expected: No errors

**Step 3: Build**

Run: `bun run build`
Expected: Build succeeds

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(audio): complete FM synthesis implementation

- Add FMSynthParams types and defaults
- Create EffectsChain as reusable effects processor
- Refactor SynthEngine to use EffectsChain
- Add FMSynthEngine with full parameter control
- Add FM synth Zustand store
- Create FMSynthPanel and CarrierModulatorViz components
- Create FMSynthView
- Add FM parameter comparison for evaluation
- All tests passing"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add FM types | types.ts |
| 2 | Create EffectsChain | effects-chain.ts, test |
| 3 | Refactor SynthEngine | synth-engine.ts |
| 4 | Create FMSynthEngine | fm-synth-engine.ts, test |
| 5 | Create FM store | fm-synth-store.ts |
| 6 | Create FM UI components | FMSynthPanel.tsx, CarrierModulatorViz.tsx |
| 7 | Create FMSynthView | FMSynthView.tsx |
| 8 | Add FM comparison | sound-comparison.ts, test |
| 9 | Integration & build | - |

Total estimated time: 2-3 hours
