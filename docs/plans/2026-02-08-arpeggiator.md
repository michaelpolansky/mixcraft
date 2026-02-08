# Arpeggiator Implementation Plan

> **For Claude:** Implement this plan task-by-task with verification after each.

**Goal:** Add arpeggiator that plays held notes in patterns (up, down, up-down, random) synced to sequencer tempo

**Architecture:** Track held notes in Set, build pattern array with octave expansion, use Tone.Sequence for tempo-synced playback

**Tech Stack:** TypeScript, Tone.js (Sequence, Transport)

---

## Overview

The arpeggiator automatically plays held notes one at a time in a pattern. When the user holds a chord (e.g., C-E-G), the arp plays each note sequentially in the selected pattern, optionally spanning multiple octaves.

**Parameters:**
- `enabled: boolean` - Toggle on/off
- `pattern: 'up' | 'down' | 'upDown' | 'random'` - Note order
- `division: '1n' | '2n' | '4n' | '8n' | '16n' | '32n'` - Tempo sync
- `octaves: 1 | 2 | 3 | 4` - Octave range to span
- `gate: number` - Note length percentage (0.25 to 1)

---

## Task 1: Add Types

**Files:**
- Modify: `src/core/types.ts`

**Add types:**
```typescript
export type ArpPattern = 'up' | 'down' | 'upDown' | 'random';
export type ArpDivision = '1n' | '2n' | '4n' | '8n' | '16n' | '32n';

export interface ArpeggiatorParams {
  enabled: boolean;
  pattern: ArpPattern;
  division: ArpDivision;
  octaves: 1 | 2 | 3 | 4;
  gate: number;
}
```

**Add to SynthParams:**
```typescript
arpeggiator: ArpeggiatorParams;
```

**Add defaults:**
```typescript
export const DEFAULT_ARPEGGIATOR: ArpeggiatorParams = {
  enabled: false,
  pattern: 'up',
  division: '8n',
  octaves: 1,
  gate: 0.5,
};
```

**Add to DEFAULT_SYNTH_PARAMS:**
```typescript
arpeggiator: DEFAULT_ARPEGGIATOR,
```

**Update challenges/presets:** Add `arpeggiator: { enabled: false, pattern: 'up', division: '8n', octaves: 1, gate: 0.5 }` to all files.

**Verification:** `npx tsc --noEmit`

---

## Task 2: Add Engine Arpeggiator Support

**Files:**
- Modify: `src/core/synth-engine.ts`

**Add private members:**
```typescript
// Arpeggiator state
private heldNotes: Set<string> = new Set();
private arpSequence: Tone.Sequence | null = null;
private arpNotes: string[] = [];
```

**Add helper to build pattern:**
```typescript
private buildArpPattern(): string[] {
  if (this.heldNotes.size === 0) return [];

  // Sort notes by frequency
  const notes = Array.from(this.heldNotes).sort((a, b) => {
    return Tone.Frequency(a).toFrequency() - Tone.Frequency(b).toFrequency();
  });

  // Expand across octaves
  const expanded: string[] = [];
  for (let oct = 0; oct < this.params.arpeggiator.octaves; oct++) {
    for (const note of notes) {
      const freq = Tone.Frequency(note).toFrequency();
      const octaveFreq = freq * Math.pow(2, oct);
      expanded.push(Tone.Frequency(octaveFreq).toNote());
    }
  }

  // Apply pattern
  switch (this.params.arpeggiator.pattern) {
    case 'up':
      return expanded;
    case 'down':
      return expanded.reverse();
    case 'upDown':
      if (expanded.length <= 1) return expanded;
      const down = expanded.slice(1, -1).reverse();
      return [...expanded, ...down];
    case 'random':
      return expanded; // Shuffle happens in sequence callback
    default:
      return expanded;
  }
}
```

**Add start/stop methods:**
```typescript
private startArp(): void {
  this.stopArp();

  this.arpNotes = this.buildArpPattern();
  if (this.arpNotes.length === 0) return;

  const division = this.params.arpeggiator.division;
  const gate = this.params.arpeggiator.gate;
  const isRandom = this.params.arpeggiator.pattern === 'random';

  let index = 0;
  this.arpSequence = new Tone.Sequence(
    (time, _) => {
      let note: string;
      if (isRandom) {
        note = this.arpNotes[Math.floor(Math.random() * this.arpNotes.length)]!;
      } else {
        note = this.arpNotes[index % this.arpNotes.length]!;
        index++;
      }

      // Calculate gate duration
      const stepDuration = Tone.Time(division).toSeconds();
      const noteDuration = stepDuration * gate;

      this.triggerAttack(note, 0.8);
      Tone.Transport.scheduleOnce(() => {
        this.triggerRelease();
      }, time + noteDuration);
    },
    this.arpNotes,
    division
  );

  this.arpSequence.start(0);
  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start();
  }
}

private stopArp(): void {
  if (this.arpSequence) {
    this.arpSequence.stop();
    this.arpSequence.dispose();
    this.arpSequence = null;
  }
  this.triggerRelease();
}
```

**Add note tracking methods:**
```typescript
arpAddNote(note: string): void {
  if (!this.params.arpeggiator.enabled) {
    this.triggerAttack(note);
    return;
  }
  this.heldNotes.add(note);
  this.startArp();
}

arpRemoveNote(note: string): void {
  if (!this.params.arpeggiator.enabled) {
    this.triggerRelease();
    return;
  }
  this.heldNotes.delete(note);
  if (this.heldNotes.size === 0) {
    this.stopArp();
  } else {
    this.startArp(); // Rebuild with remaining notes
  }
}
```

**Add setter methods:**
```typescript
setArpEnabled(enabled: boolean): void {
  this.params.arpeggiator.enabled = enabled;
  if (!enabled) {
    this.stopArp();
    this.heldNotes.clear();
  }
}

setArpPattern(pattern: ArpPattern): void {
  this.params.arpeggiator.pattern = pattern;
  if (this.heldNotes.size > 0) this.startArp();
}

setArpDivision(division: ArpDivision): void {
  this.params.arpeggiator.division = division;
  if (this.heldNotes.size > 0) this.startArp();
}

setArpOctaves(octaves: 1 | 2 | 3 | 4): void {
  this.params.arpeggiator.octaves = octaves;
  if (this.heldNotes.size > 0) this.startArp();
}

setArpGate(gate: number): void {
  this.params.arpeggiator.gate = Math.max(0.25, Math.min(1, gate));
}
```

**Update dispose:**
```typescript
this.stopArp();
```

**Verification:** `npx tsc --noEmit`

---

## Task 3: Add Store Actions

**Files:**
- Modify: `src/ui/stores/synth-store.ts`

**Add imports:**
```typescript
import type { ArpPattern, ArpDivision } from '../../core/types.ts';
```

**Add to SynthStore interface:**
```typescript
// Arpeggiator actions
setArpEnabled: (enabled: boolean) => void;
setArpPattern: (pattern: ArpPattern) => void;
setArpDivision: (division: ArpDivision) => void;
setArpOctaves: (octaves: 1 | 2 | 3 | 4) => void;
setArpGate: (gate: number) => void;
arpNoteOn: (note: string) => void;
arpNoteOff: (note: string) => void;
```

**Add implementations:**
```typescript
setArpEnabled: (enabled: boolean) => {
  const { engine, params } = get();
  engine?.setArpEnabled(enabled);
  set({
    params: {
      ...params,
      arpeggiator: { ...params.arpeggiator, enabled },
    },
  });
},

setArpPattern: (pattern: ArpPattern) => {
  const { engine, params } = get();
  engine?.setArpPattern(pattern);
  set({
    params: {
      ...params,
      arpeggiator: { ...params.arpeggiator, pattern },
    },
  });
},

setArpDivision: (division: ArpDivision) => {
  const { engine, params } = get();
  engine?.setArpDivision(division);
  set({
    params: {
      ...params,
      arpeggiator: { ...params.arpeggiator, division },
    },
  });
},

setArpOctaves: (octaves: 1 | 2 | 3 | 4) => {
  const { engine, params } = get();
  engine?.setArpOctaves(octaves);
  set({
    params: {
      ...params,
      arpeggiator: { ...params.arpeggiator, octaves },
    },
  });
},

setArpGate: (gate: number) => {
  const { engine, params } = get();
  engine?.setArpGate(gate);
  set({
    params: {
      ...params,
      arpeggiator: { ...params.arpeggiator, gate },
    },
  });
},

arpNoteOn: (note: string) => {
  get().engine?.arpAddNote(note);
},

arpNoteOff: (note: string) => {
  get().engine?.arpRemoveNote(note);
},
```

**Verification:** `npx tsc --noEmit`

---

## Task 4: Update PianoKeyboard Integration

**Files:**
- Modify: `src/ui/components/PianoKeyboard.tsx`

**Current behavior:** PianoKeyboard calls `onNoteOn`/`onNoteOff` props directly.

**New behavior:** No changes needed to PianoKeyboard itself - we'll update how SynthView passes the callbacks.

**In SynthView.tsx**, update the keyboard callbacks:
```typescript
// Use arp-aware note handlers
const handleNoteOn = useCallback((note: string) => {
  arpNoteOn(note);
  setIsPlaying(true);
}, [arpNoteOn]);

const handleNoteOff = useCallback((note: string) => {
  arpNoteOff(note);
  // Only set isPlaying false if arp is disabled
  if (!params.arpeggiator.enabled) {
    setIsPlaying(false);
  }
}, [arpNoteOff, params.arpeggiator.enabled]);
```

**Verification:** `npx tsc --noEmit`

---

## Task 5: Add UI

**Files:**
- Modify: `src/ui/views/SynthView.tsx`

**Add color:**
```typescript
arp: '#f59e0b', // Amber
```

**Add store bindings:**
```typescript
const {
  // ... existing
  setArpEnabled,
  setArpPattern,
  setArpDivision,
  setArpOctaves,
  setArpGate,
  arpNoteOn,
  arpNoteOff,
} = useSynthStore();
```

**Add ARP StageCard (place near LFO section):**
```tsx
{/* ARP */}
<StageCard title="ARP" color={COLORS.arp}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm }}>
    {/* Enable toggle */}
    <button
      onClick={() => setArpEnabled(!params.arpeggiator.enabled)}
      style={{
        padding: '6px 12px',
        background: params.arpeggiator.enabled ? COLORS.arp : '#222',
        border: `1px solid ${params.arpeggiator.enabled ? COLORS.arp : '#444'}`,
        borderRadius: '4px',
        color: params.arpeggiator.enabled ? '#000' : '#888',
        fontSize: '11px',
        fontWeight: 700,
        cursor: 'pointer',
        alignSelf: 'flex-start',
      }}
    >
      {params.arpeggiator.enabled ? 'ON' : 'OFF'}
    </button>

    {params.arpeggiator.enabled && (
      <>
        {/* Pattern selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
            Pattern
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {([
              { value: 'up', label: '↑' },
              { value: 'down', label: '↓' },
              { value: 'upDown', label: '↕' },
              { value: 'random', label: '?' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setArpPattern(value)}
                style={{
                  width: 28,
                  height: 28,
                  fontSize: '14px',
                  fontWeight: 600,
                  background: params.arpeggiator.pattern === value ? COLORS.arp : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: params.arpeggiator.pattern === value ? '#000' : '#fff',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Division selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
            Rate
          </span>
          <select
            value={params.arpeggiator.division}
            onChange={(e) => setArpDivision(e.target.value as ArpDivision)}
            style={{
              padding: '4px 8px',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <option value="1n">1</option>
            <option value="2n">1/2</option>
            <option value="4n">1/4</option>
            <option value="8n">1/8</option>
            <option value="16n">1/16</option>
            <option value="32n">1/32</option>
          </select>
        </div>

        {/* Octaves selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
            Octaves
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {([1, 2, 3, 4] as const).map((oct) => (
              <button
                key={oct}
                onClick={() => setArpOctaves(oct)}
                style={{
                  width: 24,
                  height: 24,
                  fontSize: '10px',
                  fontWeight: 600,
                  background: params.arpeggiator.octaves === oct ? COLORS.arp : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: params.arpeggiator.octaves === oct ? '#000' : '#fff',
                  cursor: 'pointer',
                }}
              >
                {oct}
              </button>
            ))}
          </div>
        </div>

        {/* Gate knob */}
        <Knob
          label="Gate"
          value={params.arpeggiator.gate}
          min={0.25}
          max={1}
          step={0.05}
          onChange={setArpGate}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          paramId="arp.gate"
        />
      </>
    )}
  </div>
</StageCard>
```

**Verification:** `npx tsc --noEmit` and visual check in browser

---

## Task 6: Update Presets (Optional)

**Files:**
- Modify: `src/data/presets/subtractive-presets.ts`

**Add arpeggiator defaults to all presets.**

**Optionally add 1 arp-focused preset:**
- "Arp Lead" - Square wave, arp enabled, up pattern, 1/16 division, 2 octaves

---

## Verification

After all tasks:
1. `npx tsc --noEmit` - no type errors
2. `bun test` - all tests pass
3. Manual test in browser:
   - Enable arp, hold C-E-G chord
   - Should hear notes play one at a time in pattern
   - Change pattern - should update immediately
   - Change octaves - should span higher
   - Adjust gate - short = staccato, long = legato
   - Release all keys - arp stops

---

## Files Summary

| File | Change |
|------|--------|
| `src/core/types.ts` | Add `ArpeggiatorParams`, pattern/division types |
| `src/core/synth-engine.ts` | Add arp state, Tone.Sequence, note tracking |
| `src/ui/stores/synth-store.ts` | Add arp actions |
| `src/ui/views/SynthView.tsx` | Add ARP StageCard, update keyboard handlers |
| `src/data/presets/subtractive-presets.ts` | Add arp defaults |
| Challenge files | Add arp defaults |
