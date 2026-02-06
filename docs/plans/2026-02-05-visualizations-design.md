# Educational Visualizations Design

> **For Claude:** Use this design to implement the Oscilloscope and FilterResponse components.

**Goal:** Add educational visualizations to challenges that help players understand synthesis concepts visually.

**Components to build:**
1. Oscilloscope - real-time waveform display
2. FilterResponse - filter frequency response curve

---

## Component 1: Oscilloscope

**File:** `src/ui/components/Oscilloscope.tsx`

**Purpose:** Show real-time waveform shape (sine, saw, square, triangle)

**Props:**
```typescript
interface OscilloscopeProps {
  getAnalyser: () => AnalyserNode | null;
  width?: number;   // default 300
  height?: number;  // default 120
  accentColor?: string;  // default '#4ade80'
}
```

**Implementation:**
- Use `AnalyserNode.getFloatTimeDomainData()` for waveform data
- Canvas 2D rendering with requestAnimationFrame
- Filled waveform style (area between centerline and wave)
- Semi-transparent accent color fill + white stroke on edge
- Dark background (#141414)
- Horizontal center line (dimmed #333)

**Rendering approach:**
1. Get time domain data (2048 samples typical)
2. Map samples to canvas coordinates
3. Draw filled path from center to wave
4. Stroke the wave edge in white

---

## Component 2: FilterResponse

**File:** `src/ui/components/FilterResponse.tsx`

**Purpose:** Show filter frequency response with cutoff and resonance

**Props:**
```typescript
interface FilterResponseProps {
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  cutoff: number;      // Hz (20-20000)
  resonance: number;   // Q value (0.1-20)
  width?: number;      // default 300
  height?: number;     // default 150
}
```

**Visual layout:**
- X-axis: 20Hz to 20kHz (logarithmic)
- Y-axis: -24dB to +12dB
- Three frequency bands with subtle background tints:
  - Bass (20-250Hz): rgba(59, 130, 246, 0.1) blue tint
  - Mid (250-4kHz): transparent
  - High (4k-20kHz): rgba(249, 115, 22, 0.1) orange tint
- Band labels at bottom: "BASS", "MID", "HIGH"
- 0dB reference line (dimmed horizontal)
- Cutoff marked with vertical dashed line

**Filter math (simplified biquad response):**
```typescript
// For lowpass at frequency f with cutoff fc and Q:
// H(f) = 1 / sqrt(1 + (f/fc)^(2*n)) for basic rolloff
// Add resonance peak near cutoff based on Q

function calculateResponse(
  filterType: string,
  cutoff: number,
  resonance: number,
  frequency: number
): number {
  // Returns gain in dB at given frequency
  // Lowpass: flat below cutoff, -12dB/octave above, peak at cutoff if Q > 0.707
  // Highpass: -12dB/octave below cutoff, flat above, peak at cutoff
  // Bandpass: peak at cutoff, rolls off both directions
}
```

---

## Integration

**Challenge type definition (add to types.ts):**
```typescript
type VisualizationType = 'oscilloscope' | 'filter' | 'envelope' | 'fm' | 'additive' | 'none';

interface Challenge {
  // ... existing fields
  visualization?: VisualizationType;  // optional, defaults based on module
}
```

**Default visualization by module:**
- SD1 (Oscillators): oscilloscope
- SD2 (Filters): filter
- SD3 (Envelopes): envelope
- SD4 (Modulation): oscilloscope
- SD5 (Effects): oscilloscope
- SD6-7 (Combined): oscilloscope
- SD8 (FM): fm (existing CarrierModulatorViz)
- SD9 (Additive): additive (existing HarmonicDrawbars)

**ChallengeView changes:**
- Import new components
- Add visualization section in the UI
- Select component based on challenge.visualization or module default
- Pass appropriate props (analyser for oscilloscope, filter params for filter response)

---

## Files to create/modify

**Create:**
- `src/ui/components/Oscilloscope.tsx`
- `src/ui/components/FilterResponse.tsx`

**Modify:**
- `src/ui/components/index.ts` - export new components
- `src/ui/views/ChallengeView.tsx` - add visualization section
- `src/core/types.ts` - add VisualizationType (optional)
