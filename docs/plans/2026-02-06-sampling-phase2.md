# Sampling Track Phase 2: Evaluation & Challenges

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Sampling track with evaluation logic, challenge view, and 24 challenges (SM1-SM6).

**Architecture:** Follow existing patterns from production-evaluation.ts and ProductionChallengeView.tsx. Sampling challenges compare user's sample manipulation (pitch, slices, timing) against targets.

**Tech Stack:** Existing SamplerEngine, Zustand store, Tone.js, Canvas 2D waveform visualization.

---

## Task 1: Sampling Evaluation Logic

**Files:**
- Create: `src/core/sampling-evaluation.ts`
- Create: `src/tests/core/sampling-evaluation.test.ts`

**Step 1: Create the evaluation module**

```typescript
// src/core/sampling-evaluation.ts
/**
 * Sampling Challenge Evaluation
 * Scoring logic for sampling challenges
 */

import type { SamplingChallenge, SamplerParams, SampleSlice } from './types.ts';

/**
 * Score result for sampling challenges
 */
export interface SamplingScoreResult {
  overall: number;           // 0-100
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    type: SamplingChallenge['challengeType'];
    pitchScore?: number;
    sliceScore?: number;
    timingScore?: number;
    creativityScore?: number;
  };
  feedback: string[];
}

/**
 * Tolerances for scoring
 */
const TOLERANCES = {
  pitch: 1,           // ±1 semitone
  slicePosition: 0.05, // ±5% of duration
  timing: 0.1,        // ±10% stretch
};

/**
 * Calculate pitch accuracy score
 */
function scorePitch(actual: number, target: number): number {
  const diff = Math.abs(actual - target);
  if (diff <= TOLERANCES.pitch) {
    return 100 - (diff / TOLERANCES.pitch) * 30;
  }
  return Math.max(0, 70 - (diff - TOLERANCES.pitch) * 10);
}

/**
 * Calculate slice accuracy score
 */
function scoreSlices(
  actualSlices: SampleSlice[],
  expectedCount: number,
  duration: number
): number {
  if (actualSlices.length === 0) return 0;

  // Score based on having correct number of slices
  const countScore = actualSlices.length === expectedCount ? 100 :
    Math.max(0, 100 - Math.abs(actualSlices.length - expectedCount) * 15);

  // Score based on even distribution (for auto-slice challenges)
  const expectedSliceLength = duration / expectedCount;
  let distributionScore = 100;

  for (const slice of actualSlices) {
    const sliceLength = slice.end - slice.start;
    const diff = Math.abs(sliceLength - expectedSliceLength) / expectedSliceLength;
    distributionScore -= diff * 20;
  }
  distributionScore = Math.max(0, distributionScore);

  return (countScore + distributionScore) / 2;
}

/**
 * Calculate time stretch accuracy
 */
function scoreTimeStretch(actual: number, target: number): number {
  const diff = Math.abs(actual - target);
  if (diff <= TOLERANCES.timing) {
    return 100 - (diff / TOLERANCES.timing) * 30;
  }
  return Math.max(0, 70 - (diff - TOLERANCES.timing) * 50);
}

/**
 * Evaluate a recreate-kit challenge
 */
function evaluateRecreateKit(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  let totalScore = 0;
  let components = 0;

  const breakdown: SamplingScoreResult['breakdown'] = {
    type: 'recreate-kit',
  };

  // Check if sample is loaded
  if (!userParams.sampleUrl) {
    return {
      overall: 0,
      stars: 1,
      passed: false,
      breakdown,
      feedback: ['Load a sample to begin.'],
    };
  }

  // Pitch score
  if (challenge.targetParams?.pitch !== undefined) {
    const pitchScore = scorePitch(userParams.pitch, challenge.targetParams.pitch);
    breakdown.pitchScore = pitchScore;
    totalScore += pitchScore;
    components++;

    if (pitchScore < 70) {
      const diff = userParams.pitch - challenge.targetParams.pitch;
      feedback.push(`Pitch is ${diff > 0 ? 'too high' : 'too low'} by ${Math.abs(diff)} semitones.`);
    }
  }

  // Slice score
  if (challenge.expectedSlices !== undefined) {
    const sliceScore = scoreSlices(
      userParams.slices,
      challenge.expectedSlices,
      userParams.duration
    );
    breakdown.sliceScore = sliceScore;
    totalScore += sliceScore;
    components++;

    if (sliceScore < 70) {
      feedback.push(`Expected ${challenge.expectedSlices} slices, you have ${userParams.slices.length}.`);
    }
  }

  // Time stretch score
  if (challenge.targetParams?.timeStretch !== undefined) {
    const timingScore = scoreTimeStretch(
      userParams.timeStretch,
      challenge.targetParams.timeStretch
    );
    breakdown.timingScore = timingScore;
    totalScore += timingScore;
    components++;

    if (timingScore < 70) {
      feedback.push('Time stretch doesn\'t match the target tempo.');
    }
  }

  const overall = components > 0 ? totalScore / components : 0;
  const stars = overall >= 90 ? 3 : overall >= 70 ? 2 : 1;
  const passed = overall >= 70;

  if (passed && feedback.length === 0) {
    feedback.push('Great job! Your sample manipulation matches the target.');
  }

  return { overall, stars, passed, breakdown, feedback };
}

/**
 * Evaluate a chop-challenge
 */
function evaluateChopChallenge(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const breakdown: SamplingScoreResult['breakdown'] = {
    type: 'chop-challenge',
  };

  if (!userParams.sampleUrl) {
    return {
      overall: 0,
      stars: 1,
      passed: false,
      breakdown,
      feedback: ['Load a sample to begin.'],
    };
  }

  // Main scoring: slice count and distribution
  const sliceScore = scoreSlices(
    userParams.slices,
    challenge.expectedSlices ?? 8,
    userParams.duration
  );
  breakdown.sliceScore = sliceScore;

  if (sliceScore < 70) {
    feedback.push(`Try creating ${challenge.expectedSlices ?? 8} evenly-spaced slices.`);
  } else {
    feedback.push('Good slice placement!');
  }

  const overall = sliceScore;
  const stars = overall >= 90 ? 3 : overall >= 70 ? 2 : 1;

  return {
    overall,
    stars,
    passed: overall >= 70,
    breakdown,
    feedback,
  };
}

/**
 * Evaluate a tune-to-track challenge
 */
function evaluateTuneToTrack(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  const feedback: string[] = [];
  const breakdown: SamplingScoreResult['breakdown'] = {
    type: 'tune-to-track',
  };

  if (!userParams.sampleUrl) {
    return {
      overall: 0,
      stars: 1,
      passed: false,
      breakdown,
      feedback: ['Load a sample to begin.'],
    };
  }

  let totalScore = 0;
  let components = 0;

  // Pitch accuracy (for key matching)
  if (challenge.targetParams?.pitch !== undefined) {
    const pitchScore = scorePitch(userParams.pitch, challenge.targetParams.pitch);
    breakdown.pitchScore = pitchScore;
    totalScore += pitchScore;
    components++;

    if (pitchScore < 70) {
      feedback.push('Adjust the pitch to match the target key.');
    }
  }

  // Time stretch (for BPM matching)
  if (challenge.targetParams?.timeStretch !== undefined) {
    const timingScore = scoreTimeStretch(
      userParams.timeStretch,
      challenge.targetParams.timeStretch
    );
    breakdown.timingScore = timingScore;
    totalScore += timingScore;
    components++;

    if (timingScore < 70) {
      feedback.push('Adjust time stretch to match the target tempo.');
    }
  }

  const overall = components > 0 ? totalScore / components : 0;
  const stars = overall >= 90 ? 3 : overall >= 70 ? 2 : 1;

  if (overall >= 70 && feedback.length === 0) {
    feedback.push('Perfect! The sample fits the track.');
  }

  return {
    overall,
    stars,
    passed: overall >= 70,
    breakdown,
    feedback,
  };
}

/**
 * Main evaluation function
 */
export function evaluateSamplingChallenge(
  challenge: SamplingChallenge,
  userParams: SamplerParams
): SamplingScoreResult {
  switch (challenge.challengeType) {
    case 'recreate-kit':
      return evaluateRecreateKit(challenge, userParams);
    case 'chop-challenge':
      return evaluateChopChallenge(challenge, userParams);
    case 'tune-to-track':
      return evaluateTuneToTrack(challenge, userParams);
    case 'flip-this':
      // Flip challenges are more creative - basic scoring for now
      return {
        overall: userParams.sampleUrl ? 80 : 0,
        stars: userParams.sampleUrl ? 2 : 1,
        passed: !!userParams.sampleUrl,
        breakdown: { type: 'flip-this', creativityScore: 80 },
        feedback: userParams.sampleUrl
          ? ['Creative interpretation! Keep experimenting.']
          : ['Load and manipulate a sample to complete this challenge.'],
      };
    case 'clean-sample':
      // Clean sample challenges check for proper start/end points and fades
      const hasProperTrim = userParams.startPoint > 0 || userParams.endPoint < 1;
      const hasFades = userParams.fadeIn > 0 || userParams.fadeOut > 0;
      const cleanScore = (hasProperTrim ? 50 : 0) + (hasFades ? 50 : 0);
      return {
        overall: cleanScore,
        stars: cleanScore >= 90 ? 3 : cleanScore >= 70 ? 2 : 1,
        passed: cleanScore >= 70,
        breakdown: { type: 'clean-sample' },
        feedback: [
          !hasProperTrim ? 'Trim the sample to remove silence at the start/end.' : '',
          !hasFades ? 'Add fade in/out to prevent clicks.' : '',
        ].filter(Boolean),
      };
    default:
      return {
        overall: 0,
        stars: 1,
        passed: false,
        breakdown: { type: challenge.challengeType },
        feedback: ['Unknown challenge type.'],
      };
  }
}
```

**Step 2: Add unit tests**

Create `src/tests/core/sampling-evaluation.test.ts` with tests for:
- scorePitch accuracy
- scoreSlices with correct/incorrect counts
- evaluateRecreateKit with matching/non-matching params
- evaluateChopChallenge with correct slice count
- evaluateTuneToTrack with correct pitch/timing

**Step 3: Run tests**

```bash
bun test src/tests/core/sampling-evaluation.test.ts
```

**Step 4: Commit**

```bash
git add src/core/sampling-evaluation.ts src/tests/core/sampling-evaluation.test.ts
git commit -m "feat(sampling): add sampling evaluation logic"
```

---

## Task 2: Sampling Challenge Store

**Files:**
- Modify: `src/ui/stores/sampler-store.ts` (add challenge state)

**Step 1: Add challenge-related state to sampler store**

Add to the existing store:

```typescript
// Challenge state
currentChallenge: SamplingChallenge | null;
currentAttempt: number;
hintsRevealed: number;
isScoring: boolean;
lastResult: SamplingScoreResult | null;

// Challenge actions
loadChallenge: (challenge: SamplingChallenge) => void;
revealHint: () => void;
submitScore: (result: SamplingScoreResult) => void;
retry: () => void;
```

**Step 2: Verify build**

```bash
bun run build 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/ui/stores/sampler-store.ts
git commit -m "feat(sampling): add challenge state to sampler store"
```

---

## Task 3: SamplerChallengeView

**Files:**
- Create: `src/ui/views/SamplerChallengeView.tsx`
- Modify: `src/App.tsx` (add routing)

**Step 1: Create SamplerChallengeView**

Follow ProductionChallengeView pattern:
- Props: challenge, onExit, onNext, hasNext
- Header with challenge title, difficulty stars, attempt counter
- WaveformEditor with all controls
- Pitch/Stretch/Volume knobs
- Slice pads
- Reference playback toggle (if challenge has targetSampleUrl)
- Hints section (progressive reveal)
- Submit button
- Results display with score, stars, feedback

**Step 2: Add to App.tsx routing**

Add 'sampling-challenge' view type and routing.

**Step 3: Verify build**

```bash
bun run build 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/ui/views/SamplerChallengeView.tsx src/App.tsx
git commit -m "feat(sampling): add SamplerChallengeView"
```

---

## Task 4: SM1 Challenges (Sample Basics)

**Files:**
- Create: `src/data/challenges/sampling/sm1/sm1-02-trigger-oneshot.ts`
- Create: `src/data/challenges/sampling/sm1/sm1-03-pitch-shift.ts`
- Create: `src/data/challenges/sampling/sm1/sm1-04-layer-sounds.ts`
- Modify: `src/data/challenges/sampling/sm1/index.ts`

**SM1 Challenge List:**
1. sm1-01: Load and Play (exists)
2. sm1-02: Trigger One-Shot - Trigger sample with correct timing
3. sm1-03: Pitch Shift - Match target pitch (+5 semitones)
4. sm1-04: Layer Sounds - Combine two samples at correct levels

**Step 1: Create challenges following the sm1-01 pattern**

Each challenge needs:
- id, title, description, difficulty (1-3), module ("SM1")
- challengeType
- sourceSampleUrl
- targetParams (for recreation challenges)
- hints (3 progressive hints)

**Step 2: Update sm1/index.ts**

```typescript
export { challenge as sm1_01 } from './sm1-01-load-and-play.ts';
export { challenge as sm1_02 } from './sm1-02-trigger-oneshot.ts';
export { challenge as sm1_03 } from './sm1-03-pitch-shift.ts';
export { challenge as sm1_04 } from './sm1-04-layer-sounds.ts';
```

**Step 3: Commit**

```bash
git add src/data/challenges/sampling/sm1/
git commit -m "feat(sampling): add SM1 challenges (sample basics)"
```

---

## Task 5: SM2 Challenges (Building Instruments)

**Files:**
- Create: `src/data/challenges/sampling/sm2/` directory
- 4 challenges: kit building, key mapping, velocity layers, multi-sample

**Challenge concepts:**
1. sm2-01: Build a Kit - Create 4-pad drum kit from recordings
2. sm2-02: Key Mapping - Map sample across keyboard range
3. sm2-03: Velocity Layers - Set up velocity-sensitive samples
4. sm2-04: Multi-Sample - Combine samples into playable instrument

---

## Task 6: SM3 Challenges (Time & Pitch)

**Files:**
- Create: `src/data/challenges/sampling/sm3/` directory
- 4 challenges: time stretch, tune to key, warp timing, tempo match

---

## Task 7: SM4 Challenges (Chopping)

**Files:**
- Create: `src/data/challenges/sampling/sm4/` directory
- 4 challenges: slice breaks, chop vocals, manual slices, trigger patterns

---

## Task 8: SM5 Challenges (Flipping)

**Files:**
- Create: `src/data/challenges/sampling/sm5/` directory
- 4 challenges: find loops, rearrange, obscure source, creative flip

---

## Task 9: SM6 Challenges (Polish & Clean)

**Files:**
- Create: `src/data/challenges/sampling/sm6/` directory
- 4 challenges: trim, fade, normalize, loop points

---

## Task 10: Challenge Index Integration

**Files:**
- Create: `src/data/challenges/sampling/index.ts`
- Modify: `src/data/challenges/index.ts` (add sampling)
- Modify: `src/App.tsx` (add Sampling track to menu)

**Step 1: Create sampling/index.ts aggregating all modules**

Follow the pattern from production/index.ts.

**Step 2: Add to main challenge index**

**Step 3: Add Sampling track to curriculum menu in App.tsx**

**Step 4: Commit**

```bash
git add src/data/challenges/sampling/ src/data/challenges/index.ts src/App.tsx
git commit -m "feat(sampling): integrate sampling track into curriculum"
```

---

## Verification Checklist

After all tasks:
- [ ] `bun run build` passes
- [ ] `bun run test` passes (including new evaluation tests)
- [ ] Sampling track appears in curriculum menu
- [ ] Can navigate to SM1-SM6 challenges
- [ ] Challenge scoring works correctly
- [ ] Hints reveal progressively
- [ ] Results display with stars and feedback
