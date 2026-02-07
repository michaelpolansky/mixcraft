# Synth Visual Redesign - Ableton Learning Synths Style

**Date:** 2026-02-06
**Status:** Approved

## Overview

Redesign synth views with large, interactive, Ableton Learning Synths-style visualizations. Each module gets a prominent, animated visualization that users can directly interact with.

## Layout

- Centered content column, max-width ~600px
- Generous padding/whitespace on sides
- Vertical scrolling through modules
- Dark background (#0a0a0f)
- Each module is self-contained with visualization + controls

### Module Order
1. Oscillator
2. Filter
3. Amp Envelope
4. Filter Envelope
5. LFO
6. Effects

## Module Visualizations

### Oscillator (500×200px)

**Display:**
- Real-time animated waveform (sine, saw, square, triangle)
- Shows 3-4 wave cycles
- Continuous horizontal scroll animation
- Speed relates to octave setting
- Amplitude pulses with envelope when note plays

**Controls:**
- Waveform type selector (large icons)
- Octave selector
- Detune knob

### Filter (500×250px)

**Display:**
- Frequency response curve
- X-axis: 20Hz - 20kHz (logarithmic)
- Y-axis: amplitude/gain
- Grid lines at 100Hz, 1kHz, 10kHz
- Resonance peak exaggerated when Q is high

**Controls:**
- Drag curve horizontally for cutoff
- Drag vertically near peak for resonance
- Filter type buttons (LP, HP, BP)

**Animation:**
- Smooth curve transitions
- Resonance peak glows when high

### Amp Envelope (500×200px, green accent)

**Display:**
- Classic ADSR shape
- X-axis: time
- Y-axis: level (0-1)
- Four draggable control points
- Playhead animates through when note plays

**Controls:**
- Drag attack point horizontally (attack time)
- Drag decay point horizontally (decay time)
- Drag sustain line vertically (sustain level)
- Drag release end horizontally (release time)

**Animation:**
- Playhead moves through envelope during note
- Active segment highlights

### Filter Envelope (500×200px, yellow accent)

**Display:**
- Same as Amp Envelope
- Additional "Amount" control below

**Controls:**
- Same draggable ADSR points
- Amount knob/slider for envelope depth

### LFO (500×180px, red accent)

**Display:**
- Animated waveform at LFO rate
- Vertical "now" line showing current value
- Wave scrolls at actual LFO speed

**Controls:**
- Waveform type selector
- Rate (drag horizontal or knob)
- Depth (drag vertical or knob)

**Animation:**
- Continuous animation at LFO rate
- Shows modulation effect in real-time

### Effects (4 cards, 200×150px each)

**Layout:** Horizontal row or 2×2 grid

**Distortion:**
- Transfer curve visualization (input vs output)
- Amount bends the curve
- Mix control

**Delay:**
- Animated echo visualization
- Fading repeats showing feedback
- Time as distance between echoes

**Reverb:**
- Decay envelope visualization
- Shows tail length
- Mix control

**Chorus:**
- Animated detuned wave copies
- Rate controls animation speed
- Depth controls separation

## Visual Style

- Dark background: #0a0a0f
- Module accents: existing color scheme (blue, cyan, green, yellow, red, purple)
- Smooth 60fps animations (Canvas 2D)
- Large touch-friendly targets
- Consistent border radius (8-12px)

## Implementation Notes

### New Components to Create
- `OscillatorVisualizer.tsx` - Animated waveform
- `FilterVisualizer.tsx` - Frequency response with drag
- `EnvelopeVisualizer.tsx` - Draggable ADSR (reusable for amp/filter)
- `LFOVisualizer.tsx` - Animated modulation wave
- `EffectCard.tsx` - Small effect visualization cards

### Modified Files
- `SynthView.tsx` - New centered layout, integrate visualizers
- `FMSynthView.tsx` - Similar updates
- `AdditiveSynthView.tsx` - Similar updates

### Considerations
- All visualizations use Canvas 2D (project convention)
- Maintain existing parameter ranges and callbacks
- Keep keyboard/touch accessibility
- Smooth animations via requestAnimationFrame
