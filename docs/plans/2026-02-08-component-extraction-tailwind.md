# Component Extraction & Tailwind Migration Plan

> **For Claude:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Extract shared components from synth views, reduce code duplication by ~1,500 lines, and migrate to Tailwind CSS classes.

**Architecture:** Extract duplicated local components (StageCard, MiniSlider, etc.) into `src/ui/components/`, convert inline styles to Tailwind classes, update all synth views to use shared components.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4.1, Vite

---

## Phase 1: Layout Components

### Task 1: Extract StageCard Component

**Files:**
- Create: `src/ui/components/StageCard.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

Create the shared StageCard component with Tailwind classes:

```tsx
/**
 * StageCard - Module container for synth signal flow stages
 */

import type { ReactNode } from 'react';

export interface StageCardProps {
  title: string;
  color: string;
  wide?: boolean;
  extraWide?: boolean;
  compact?: boolean;
  noBorderRadius?: 'top' | 'bottom' | 'both';
  children: ReactNode;
}

export function StageCard({
  title,
  color,
  wide = false,
  extraWide = false,
  compact = false,
  noBorderRadius,
  children,
}: StageCardProps) {
  const borderRadiusClass =
    noBorderRadius === 'both' ? 'rounded-none' :
    noBorderRadius === 'top' ? 'rounded-b-lg rounded-t-none' :
    noBorderRadius === 'bottom' ? 'rounded-t-lg rounded-b-none' : 'rounded-lg';

  const widthClass = extraWide
    ? 'w-[440px]'
    : wide
      ? 'w-[320px]'
      : 'w-[224px]';

  const paddingClass = compact ? 'p-2' : 'p-3';

  return (
    <div
      className={`bg-bg-secondary ${borderRadiusClass} ${widthClass} ${paddingClass} self-start overflow-hidden`}
      style={{ border: `1px solid ${color}40` }}
    >
      <div
        className={`text-[11px] font-semibold tracking-wide ${compact ? 'mb-2' : 'mb-3'}`}
        style={{ color }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
```

Add export to `src/ui/components/index.ts`:

```typescript
export { StageCard } from './StageCard.tsx';
export type { StageCardProps } from './StageCard.tsx';
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract StageCard component with Tailwind"`

---

### Task 2: Extract StackedModule Component

**Files:**
- Create: `src/ui/components/StackedModule.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * StackedModule - Vertically connects related StageCards (e.g., OSC + envelope)
 */

import type { ReactNode } from 'react';

export interface StackedModuleProps {
  children: ReactNode;
}

export function StackedModule({ children }: StackedModuleProps) {
  return (
    <div className="flex flex-col gap-0 self-start">
      {children}
    </div>
  );
}
```

Add export to index.ts.

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract StackedModule component"`

---

### Task 3: Extract MiniSlider Component

**Files:**
- Create: `src/ui/components/MiniSlider.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * MiniSlider - Compact horizontal slider for ADSR and other compact controls
 */

import { useCallback } from 'react';

export interface MiniSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
}

export function MiniSlider({
  label,
  value,
  min,
  max,
  onChange,
  color = '#22c55e',
}: MiniSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    onChange(min + x * (max - min));
  }, [min, max, onChange]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-text-muted w-3">{label}</span>
      <div
        className="flex-1 h-1 bg-bg-quaternary rounded-sm cursor-pointer relative"
        onClick={handleClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract MiniSlider component with Tailwind"`

---

### Task 4: Extract EffectMini Component

**Files:**
- Create: `src/ui/components/EffectMini.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * EffectMini - Compact effect control with label and knobs
 */

import { Knob } from './Knob.tsx';

export interface EffectKnobConfig {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  paramId?: string;
}

export interface EffectMiniProps {
  name: string;
  color: string;
  knobs: EffectKnobConfig[];
}

export function EffectMini({ name, color, knobs }: EffectMiniProps) {
  return (
    <div className="overflow-hidden">
      <div
        className="text-[9px] font-semibold mb-1"
        style={{ color }}
      >
        {name}
      </div>
      <div className="flex flex-col gap-1">
        {knobs.map((k) => (
          <Knob
            key={k.label}
            label={k.label}
            value={k.value}
            min={0}
            max={k.max}
            step={0.01}
            onChange={k.onChange}
            formatValue={(v) => `${Math.round((v / k.max) * 100)}%`}
            size={32}
            paramId={k.paramId ?? `effect.${name.toLowerCase()}.${k.label.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract EffectMini component"`

---

### Task 5: Extract ToggleButton Component

**Files:**
- Create: `src/ui/components/ToggleButton.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * ToggleButton - On/off toggle with label (used for GLIDE, UNISON, SYNC, etc.)
 */

export interface ToggleButtonProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  color: string;
  size?: 'sm' | 'md';
}

export function ToggleButton({
  label,
  enabled,
  onChange,
  color,
  size = 'md',
}: ToggleButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[9px]'
    : 'px-2 py-1 text-[10px]';

  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`${sizeClasses} rounded font-semibold cursor-pointer transition-all duration-150`}
      style={{
        background: enabled ? color : '#222',
        border: `1px solid ${enabled ? color : '#444'}`,
        color: enabled ? '#fff' : '#888',
      }}
    >
      {label}
    </button>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract ToggleButton component"`

---

### Task 6: Extract AudioInitScreen Component

**Files:**
- Create: `src/ui/components/AudioInitScreen.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * AudioInitScreen - "Click to start audio" screen shown before audio context starts
 */

export interface AudioInitScreenProps {
  title: string;
  subtitle: string;
  accentColor: string;
  isInitializing: boolean;
  initError?: string | null;
  onStart: () => void;
}

export function AudioInitScreen({
  title,
  subtitle,
  accentColor,
  isInitializing,
  initError,
  onStart,
}: AudioInitScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary text-text-primary font-sans">
      <h1
        className="text-[32px] font-light mb-2"
        style={{ color: accentColor }}
      >
        {title}
      </h1>
      <p className="text-text-muted mb-8">{subtitle}</p>
      <button
        onClick={onStart}
        disabled={isInitializing}
        className={`
          px-12 py-4 text-base font-semibold rounded-lg text-white
          transition-all duration-200
          ${isInitializing ? 'cursor-wait opacity-80' : 'cursor-pointer'}
        `}
        style={{
          background: isInitializing
            ? `linear-gradient(145deg, ${accentColor}80, ${accentColor}60)`
            : `linear-gradient(145deg, ${accentColor}, ${accentColor}cc)`,
          boxShadow: isInitializing
            ? `0 4px 12px ${accentColor}26`
            : `0 4px 12px ${accentColor}4d`,
        }}
      >
        {isInitializing ? 'Starting Audio...' : 'Start Audio Engine'}
      </button>
      <p className="text-text-disabled text-xs mt-4">
        Click to enable audio (browser requirement)
      </p>
      {initError && (
        <div className="mt-6 px-5 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-[13px] max-w-[400px] text-center">
          {initError}
        </div>
      )}
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract AudioInitScreen component with Tailwind"`

---

### Task 7: Extract SynthHeader Component

**Files:**
- Create: `src/ui/components/SynthHeader.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * SynthHeader - Header bar with title, preset dropdown, and action buttons
 */

import { PresetDropdown } from './PresetDropdown.tsx';
import { Tooltip } from './Tooltip.tsx';

export interface SynthHeaderProps {
  title: string;
  subtitle: string;
  accentColor: string;
  presets: Array<{ name: string; params: unknown }>;
  currentPreset: string | null;
  onPresetSelect: (name: string) => void;
  onRandomize?: () => void;
  onReset: () => void;
  helpButton?: React.ReactNode;
}

export function SynthHeader({
  title,
  subtitle,
  accentColor,
  presets,
  currentPreset,
  onPresetSelect,
  onRandomize,
  onReset,
  helpButton,
}: SynthHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center px-6 py-4 pl-[120px] border-b border-border-subtle">
        <div>
          <h1
            className="text-xl font-light m-0"
            style={{ color: accentColor }}
          >
            {title}
          </h1>
          <span className="text-[11px] text-text-muted">{subtitle}</span>
        </div>
        <div className="flex gap-3 items-center">
          <PresetDropdown
            presets={presets}
            currentPreset={currentPreset}
            onSelect={onPresetSelect}
            accentColor={accentColor}
          />
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="px-3 py-1.5 bg-gradient-to-br from-violet-500 to-violet-600 border-none rounded text-white cursor-pointer text-[11px] font-semibold hover:from-violet-400 hover:to-violet-500 transition-all"
            >
              Randomize
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-bg-tertiary border border-border-medium rounded text-text-tertiary cursor-pointer text-[11px] hover:bg-bg-quaternary transition-all"
          >
            Reset
          </button>
          {helpButton}
        </div>
      </div>
      <Tooltip accentColor={accentColor} />
    </>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract SynthHeader component with Tailwind"`

---

## Phase 2: Update Synth Views to Use Shared Components

### Task 8: Update SynthView to Use Extracted Components

**Files:**
- Modify: `src/ui/views/SynthView.tsx`

**Implementation:**

1. Add imports at top:
```tsx
import {
  StageCard,
  StackedModule,
  MiniSlider,
  EffectMini,
  ToggleButton,
  AudioInitScreen,
  SynthHeader,
} from '../components/index.ts';
```

2. Replace the `if (!isInitialized)` block with:
```tsx
if (!isInitialized) {
  return (
    <AudioInitScreen
      title="MIXCRAFT"
      subtitle="Subtractive Synthesizer"
      accentColor="#4ade80"
      isInitializing={isInitializing}
      initError={initError}
      onStart={handleStartAudio}
    />
  );
}
```

3. Replace header section with:
```tsx
<SynthHeader
  title="MIXCRAFT"
  subtitle="Subtractive Synthesizer"
  accentColor="#4ade80"
  presets={SUBTRACTIVE_PRESETS}
  currentPreset={currentPreset}
  onPresetSelect={handleLoadPreset}
  onRandomize={randomize}
  onReset={resetToDefaults}
  helpButton={<HelpModeButton />}
/>
```

4. Delete the local `StageCard`, `StackedModule`, `MiniSlider`, `EffectMini` function definitions (lines ~1170-1313).

5. Update all `StageCard` usages to use the imported component (no API changes needed).

6. Update toggle buttons (GLIDE, UNISON, SYNC) to use `ToggleButton` component.

**Verify:**
- `npx tsc --noEmit` passes
- `bun run dev` - SynthView loads and functions correctly

**Commit:** `git commit -m "refactor(SynthView): use extracted components"`

---

### Task 9: Update FMSynthView to Use Extracted Components

**Files:**
- Modify: `src/ui/views/FMSynthView.tsx`

**Implementation:**

1. Add imports for shared components.

2. Replace `if (!isInitialized)` block with `AudioInitScreen`.

3. Replace header with `SynthHeader`.

4. Delete local `StageCard`, `MiniSlider` definitions (lines ~933-1018).

5. Update all usages to imported components.

**Verify:**
- `npx tsc --noEmit` passes
- `bun run dev` - FMSynthView loads correctly

**Commit:** `git commit -m "refactor(FMSynthView): use extracted components"`

---

### Task 10: Update AdditiveSynthView to Use Extracted Components

**Files:**
- Modify: `src/ui/views/AdditiveSynthView.tsx`

**Implementation:**

Same pattern as Tasks 8-9:

1. Add imports for shared components.
2. Replace `if (!isInitialized)` with `AudioInitScreen`.
3. Replace header with `SynthHeader`.
4. Delete local component definitions (lines ~759-879).
5. Update all usages.

**Verify:**
- `npx tsc --noEmit` passes
- `bun run dev` - AdditiveSynthView loads correctly

**Commit:** `git commit -m "refactor(AdditiveSynthView): use extracted components"`

---

## Phase 3: Composite Module Components

### Task 11: Extract GlideControls Component

**Files:**
- Create: `src/ui/components/GlideControls.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * GlideControls - Glide/Portamento toggle with time knob
 */

import { ToggleButton } from './ToggleButton.tsx';
import { Knob } from './Knob.tsx';

export interface GlideControlsProps {
  enabled: boolean;
  time: number;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: number) => void;
  color: string;
}

export function GlideControls({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
  color,
}: GlideControlsProps) {
  return (
    <div className="mt-3 pt-3 border-t border-border-subtle">
      <div className="flex items-center gap-2">
        <ToggleButton
          label="GLIDE"
          enabled={enabled}
          onChange={onEnabledChange}
          color={color}
        />
        {enabled && (
          <Knob
            label="Time"
            value={time}
            min={0.01}
            max={1}
            step={0.01}
            onChange={onTimeChange}
            formatValue={(v) => `${Math.round(v * 1000)}ms`}
            size={32}
            paramId="glide.time"
          />
        )}
      </div>
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract GlideControls component"`

---

### Task 12: Extract NoiseControls Component

**Files:**
- Create: `src/ui/components/NoiseControls.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * NoiseControls - Noise type selector with level knob
 */

import { Knob } from './Knob.tsx';
import type { NoiseType } from '../../core/types.ts';

const NOISE_TYPES: Array<{ value: NoiseType; label: string }> = [
  { value: 'white', label: 'White' },
  { value: 'pink', label: 'Pink' },
  { value: 'brown', label: 'Brown' },
];

export interface NoiseControlsProps {
  type: NoiseType;
  level: number;
  onTypeChange: (type: NoiseType) => void;
  onLevelChange: (level: number) => void;
  color: string;
}

export function NoiseControls({
  type,
  level,
  onTypeChange,
  onLevelChange,
  color,
}: NoiseControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Type selector */}
      <div className="flex gap-1">
        {NOISE_TYPES.map((nt) => (
          <button
            key={nt.value}
            onClick={() => onTypeChange(nt.value)}
            className={`
              flex-1 py-1 text-[9px] font-semibold rounded cursor-pointer
              transition-all duration-150
            `}
            style={{
              background: type === nt.value ? color : '#333',
              border: 'none',
              color: '#fff',
            }}
          >
            {nt.label}
          </button>
        ))}
      </div>
      {/* Level knob */}
      <Knob
        label="Level"
        value={level}
        min={0}
        max={1}
        step={0.01}
        onChange={onLevelChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="noise.level"
      />
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract NoiseControls component"`

---

### Task 13: Extract VelocityControls Component

**Files:**
- Create: `src/ui/components/VelocityControls.tsx`
- Modify: `src/ui/components/index.ts`

**Implementation:**

```tsx
/**
 * VelocityControls - Velocity sensitivity amount controls
 */

import { Knob } from './Knob.tsx';

export interface VelocityControlsProps {
  ampAmount: number;
  secondaryAmount: number;
  secondaryLabel: string; // "Filter" for subtractive, "Mod Idx" for FM, "Brightness" for additive
  onAmpAmountChange: (value: number) => void;
  onSecondaryAmountChange: (value: number) => void;
  color: string;
}

export function VelocityControls({
  ampAmount,
  secondaryAmount,
  secondaryLabel,
  onAmpAmountChange,
  onSecondaryAmountChange,
  color,
}: VelocityControlsProps) {
  return (
    <div className="flex gap-2">
      <Knob
        label="Amp Amt"
        value={ampAmount}
        min={0}
        max={1}
        step={0.01}
        onChange={onAmpAmountChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="velocity.ampAmount"
      />
      <Knob
        label={secondaryLabel}
        value={secondaryAmount}
        min={0}
        max={1}
        step={0.01}
        onChange={onSecondaryAmountChange}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        paramId="velocity.secondaryAmount"
      />
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit` passes

**Commit:** `git commit -m "feat: extract VelocityControls component"`

---

### Task 14: Update Synth Views with Composite Components

**Files:**
- Modify: `src/ui/views/SynthView.tsx`
- Modify: `src/ui/views/FMSynthView.tsx`
- Modify: `src/ui/views/AdditiveSynthView.tsx`

**Implementation:**

In each view:
1. Import `GlideControls`, `NoiseControls`, `VelocityControls`
2. Replace inline glide toggle+knob with `<GlideControls />`
3. Replace inline noise type selector+knob with `<NoiseControls />`
4. Replace inline velocity knobs with `<VelocityControls />`

**Verify:**
- `npx tsc --noEmit` passes
- All three synth views work correctly

**Commit:** `git commit -m "refactor: use composite control components in synth views"`

---

## Phase 4: Final Cleanup

### Task 15: Remove Unused Local COLORS/SIZES Constants

**Files:**
- Modify: `src/ui/views/SynthView.tsx`
- Modify: `src/ui/views/FMSynthView.tsx`
- Modify: `src/ui/views/AdditiveSynthView.tsx`

**Implementation:**

1. Delete the local `COLORS` constant from each view (replace usages with direct hex colors or CSS variables)
2. Delete the local `SIZES` constant (use Tailwind spacing)
3. Delete the local `MODULE_WIDTH` constant (use Tailwind width classes or CSS variables)

**Verify:**
- `npx tsc --noEmit` passes
- Views still render correctly

**Commit:** `git commit -m "refactor: remove redundant local constants from synth views"`

---

### Task 16: Final Verification and Line Count

**Implementation:**

1. Run full type check: `npx tsc --noEmit`
2. Run tests: `bun test`
3. Build: `bun run build`
4. Count lines saved:
```bash
wc -l src/ui/views/SynthView.tsx src/ui/views/FMSynthView.tsx src/ui/views/AdditiveSynthView.tsx
```

**Expected results:**
- TypeScript passes
- All tests pass
- Build succeeds
- ~400-500 lines removed from synth views total

**Commit:** `git commit -m "chore: component extraction complete"`

---

## Files Summary

| File | Change |
|------|--------|
| `src/ui/components/StageCard.tsx` | New - shared module container |
| `src/ui/components/StackedModule.tsx` | New - vertical card grouping |
| `src/ui/components/MiniSlider.tsx` | New - compact ADSR slider |
| `src/ui/components/EffectMini.tsx` | New - compact effect control |
| `src/ui/components/ToggleButton.tsx` | New - on/off toggle |
| `src/ui/components/AudioInitScreen.tsx` | New - audio start screen |
| `src/ui/components/SynthHeader.tsx` | New - header with presets |
| `src/ui/components/GlideControls.tsx` | New - glide toggle + time |
| `src/ui/components/NoiseControls.tsx` | New - noise type + level |
| `src/ui/components/VelocityControls.tsx` | New - velocity amounts |
| `src/ui/components/index.ts` | Modified - add exports |
| `src/ui/views/SynthView.tsx` | Modified - use shared components |
| `src/ui/views/FMSynthView.tsx` | Modified - use shared components |
| `src/ui/views/AdditiveSynthView.tsx` | Modified - use shared components |

---

## Success Criteria

1. All 3 synth views use shared components
2. No duplicated component definitions across views
3. Tailwind classes used instead of inline styles in new components
4. TypeScript compiles without errors
5. All existing tests pass
6. Views render and function identically to before
