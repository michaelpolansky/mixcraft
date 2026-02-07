# XY Pad UX Enhancement Design

**Date:** 2026-02-06
**Status:** Approved

## Overview

Enhance the XY Pad component with visual feedback, improved interaction, and optional sound feedback inspired by Ableton Learning Synths.

## Visual Feedback

### Motion Trail
- Store last 20-30 positions in array during drag
- Draw fading circles: oldest (transparent) → newest (opaque)
- Trail color matches `accentColor` with decreasing alpha
- Clear trail on mouse release

### Smooth Crosshair
- Use `requestAnimationFrame` for continuous rendering
- Crosshair lerps toward target position (~0.2s ease-out)
- Parameter values update instantly (no audio lag)
- Only visual position is smoothed

### Click Pulse
- Expanding ring animation on mousedown
- Starts at crosshair size, expands to ~3x, fades out
- Duration: ~300ms
- Creates "I clicked here" feedback

## Interaction

### Keyboard Control
- Add `tabIndex={0}` to canvas for focus
- Arrow keys: move 1% per press
- Shift+Arrow: move 10% per press
- Visual focus ring when focused

### Shift+Drag Precision
- Normal drag: 1:1 movement ratio
- Shift held: 4:1 ratio (drag 4px = move 1px)
- Cursor changes to indicate precision mode

### Double-Click Reset
- Double-click returns to center (0.5, 0.5)
- Small animation showing reset
- Quick way to reach neutral position

## Sound Feedback

### Click Sound
- Short ~50ms tick on mousedown
- Web Audio oscillator (~1000Hz, quick decay)
- Quiet, tactile confirmation
- Enabled by default

### Theremin Mode
- Separate oscillator while dragging
- X-axis: pitch (100Hz - 800Hz)
- Y-axis: volume or filter
- Fades in/out on drag start/end
- Disabled by default (synth already makes sound)

### Props
```typescript
enableClickSound?: boolean;   // default: true
enableThereminMode?: boolean; // default: false
```

## Implementation Order

1. Visual feedback (trail, lerp, pulse)
2. Interaction (keyboard, shift-precision, double-click reset)
3. Sound feedback (click, theremin)

## Files to Modify

- `src/ui/components/XYPad.tsx` - All changes in this file
