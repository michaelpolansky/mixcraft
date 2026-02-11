# MIXCRAFT

Game that teaches music production through interactive challenges and AI-powered feedback. Players learn sound design, production, and mixing by working with real audio and synthesis, with an AI mentor that hears their work and explains what's happening.

## Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Bun
- **Frontend:** React 18, Zustand (state), Canvas 2D (visualizations), Vite (build)
- **Audio:** Tone.js + Web Audio API
- **Analysis:** Meyda.js (feature extraction)
- **Tests:** Vitest
- **Backend:** Node.js, tRPC
- **Database:** PostgreSQL (Supabase)
- **LLM:** Claude API (feedback generation, later phases)
- **Hosting:** Vercel (frontend) + Railway (backend)

## Project Structure

```
src/
  core/           # All game logic. No React imports. Pure functions.
    types.ts      # All TypeScript interfaces and type definitions
    synth-engine.ts
    fm-synth-engine.ts
    additive-synth-engine.ts
    sampler-engine.ts
    drum-sequencer-engine.ts
    synth-sequencer.ts    # Note sequencer for synth views
    audio-recorder.ts     # WAV recording from audio nodes
    audio-source.ts       # Audio source abstraction for mixing tracks
    effects-chain.ts      # Tone.js effects chain builder
    sound-analysis.ts
    sound-comparison.ts
    sampling-evaluation.ts
    drum-sequencing-evaluation.ts
    mixing-evaluation.ts
    mixing-effects.ts     # Parametric EQ, bus processing for mixing track
    production-evaluation.ts
    production-source.ts  # Multi-layer audio source for production track
    player-model.ts       # Adaptive curriculum: skill scoring, weakness detection, recommendations
    progress-sync.ts      # Cloud progress sync logic (Supabase)
    supabase.ts           # Supabase client initialization
  ui/             # React components. Imports from core/ only.
    components/   # Reusable UI (Knob, Slider, XYPad, ModuleCard, ErrorBoundary, etc.)
      challenge/  # Challenge-specific components (Section, Header, HintsPanel, SubmitButton, ResultsModal)
      synth/      # Synth stage components (OscillatorStage, FilterStage, LFOStage, OutputStage, etc.)
      menu/       # Menu components (ChallengeButton, ChallengeModuleCard, ProgressStats, TrackSection, RecommendedChallenges)
      concepts/   # Concept Library components (ConceptCard, ConceptDetailPanel, GlossaryList, ConceptLink, ConceptDetailModal)
    views/        # Full-screen views (SynthView, FMSynthView, AdditiveSynthView, ChallengeView, ConceptLibraryView, etc.)
    stores/       # Zustand stores (synth-store.ts, fm-synth-store.ts, additive-synth-store.ts, etc.)
    hooks/        # Custom hooks (useNavigation, useAIFeedback, useProgressSync, usePlayerModel, usePointerDrag, etc.)
    context/      # React contexts (ConceptModalContext, InfoPanelContext)
    theme/        # Design system (COLORS constant for Canvas components)
  data/           # Static data files
    module-controls.ts  # Progressive control visibility (per-module + per-challenge)
    challenges/   # Challenge definitions by track (sd1-sd17/, sm1-sm6/, ds1-ds6/, etc.)
    concepts/     # Concept library data (concepts.ts, glossary.ts, concept-metadata.ts)
    presets/      # Synth presets (subtractive, FM, additive)
    sequences/    # Note sequences for synth sequencer
  server/         # tRPC backend
    routers/      # API routers (feedback.ts for AI feedback)
  tests/          # Mirrors src/ structure
public/
  samples/drums/  # Synthesized drum samples (16 sounds)
docs/
  SPEC.md         # Full product specification
```

## Conventions

- All game logic in `src/core/` with zero React dependencies
- All UI in `src/ui/`
- Data files (challenge definitions, synth presets) in `src/data/`
- Types in `src/core/types.ts` — single source of truth for all interfaces
- Tests mirror source structure in `src/tests/`
- Prefer pure functions. State is managed by Zustand stores, not scattered.
- Audio context requires user gesture before starting. Handle this on first interaction.
- Synth parameters map 1:1 to UI controls. No hidden state.
- Canvas 2D for all visualizations. No SVG, no charting libraries for real-time displays.
- Challenge evaluation is deterministic given the same audio features. AI feedback is additive, not required.

## Five-Track Curriculum

1. **Sound Design** (110 challenges) — subtractive synthesis (86), FM synthesis (12), additive synthesis (12).
2. **Production** (20 challenges) — layering, arrangement, frequency stacking.
3. **Mixing** (136 challenges) — EQ, compression, reverb, stereo, levels.
4. **Sampling** (24 challenges) — sample manipulation, chopping, pitch/time, flipping.
5. **Drum Sequencing** (24 challenges) — step sequencing, groove, velocity, genre patterns.

Sound design is the entry point. It teaches concepts that make mixing and production intuitive later.

## Current State

**All 314 challenges complete across five tracks.** Deployed to production with AI feedback on all tracks.

### Sound Design Track (110 challenges, SD1-SD17)
- **Subtractive synthesis (SD1-SD17, 86 challenges):** oscillator, filter, envelopes, LFO, effects, arpeggiator, unison/supersaw, oscillator 2, sub oscillator, noise shaping, glide/portamento, velocity sensitivity, combined techniques
- **FM synthesis (SD8, 12 challenges):** harmonicity, modulation index, carrier/modulator waveforms
- **Additive synthesis (SD9, 12 challenges):** harmonic drawbars, Fourier synthesis, timbres
- Progressive control visibility: module-level (SD1=Osc+Output, SD2 adds Filter, SD3 adds Envelopes, SD4 adds LFO, SD5+ all) with per-challenge per-control granularity (SD1-SD4 challenges specify exactly which knobs are visible)
- Per-control visibility: `SynthAvailableControls` sections accept `true` (show all) or per-control objects (e.g., `{ waveform: true, octave: true }`)
- Visualization arrays: each challenge can specify which viz panels to show (spectrum, oscilloscope, filter, envelope, lfo, effects)
- Effects chain: distortion, delay, reverb, chorus (all with dry/wet mix)
- Challenge system with scoring (70% audio features, 30% parameter proximity)
- AI feedback via Claude API (separate endpoints for subtractive, FM, additive)

### Production Track (20 challenges, P1-P5)
- Layer-based audio system with mute, volume, pan, and EQ per layer
- Reference matching (match target mix) and goal-based evaluation
- Frequency stacking, arrangement, and stereo imaging challenges
- AI feedback via Claude API

### Mixing Track (136 challenges, F1-F8, I1-I6, A1-A5, M1-M4)
- Multi-track mixing with per-track EQ, volume, pan, and reverb
- Bus processing: bus compressor and bus EQ with UI controls
- Progressive EQ complexity: 3-band simple (Fundamentals), 4-band parametric with freq/gain/Q per band (Intermediate+)
- Goal-based evaluation with 17 condition types
- Parametric-to-3-band conversion for backward-compatible evaluation
- Four difficulty tiers: Fundamentals (32), Intermediate (36), Advanced (36), Mastery (32)
- AI feedback via Claude API

### Sampling Track (24 challenges, SM1-SM6)
- SamplerEngine wrapping Tone.js Player for sample playback
- WaveformEditor with visual slice markers and drag handles
- Pitch shifting, time stretch, start/end points, fade in/out
- Challenge types: recreate-kit, chop-challenge, tune-to-track, flip-this, clean-sample
- AI feedback via Claude API

### Drum Sequencing Track (24 challenges, DS1-DS6)
- DrumSequencerEngine wrapping Tone.js Transport and Players
- StepGrid (Canvas 2D) for pattern editing with playhead
- VelocityLane for per-step dynamics control
- 16 synthesized drum samples (kick, snare, clap, hats, toms, cymbals, 808, percussion)
- Evaluation: pattern accuracy, velocity, swing, tempo
- Modules: Grid Basics, Hi-hats, Groove & Swing, Velocity, Genre Patterns, Loop Construction
- AI feedback via Claude API

### Synth Sandbox Features (Ableton-inspired)
- **XY Pad:** 2D parameter control with Canvas crosshair and drag interaction
- **Preset System:** 30 presets (10 per synth type) with dropdown selector
- **Sequencer:** 9 note patterns with optional drum backing, visual note indicator
- **Visual Redesign:** Color-coded ModuleCards with animated WaveformIcons
- **Recording:** WAV capture up to 30 seconds with playback and download
- **Noise Generator:** White/pink/brown noise with level control for transients and texture
- **Portamento/Glide:** Smooth pitch sliding between notes with adjustable time
- **LFO Sync:** Tempo-synced LFO with note division selector (1, 1/2, 1/4, 1/8, 1/16, 1/32)
- **Oscilloscope:** Real-time waveform display in OUTPUT stage
- **Arpeggiator:** Pattern-based note sequencing with up/down/updown/random modes, tempo sync
- **LFO2:** Second LFO with independent rate, depth, waveform, and sync settings
- **Mod Matrix:** 4-slot modulation routing (sources: LFO1, LFO2, Env1, Env2, Velocity; destinations: pitch, pan, amplitude, filterCutoff, osc2Mix, lfo1Rate, lfo2Rate)
- **Pan Control:** Stereo positioning with real-time modulation support
- **Real-Time Modulation Display:** Knobs show modulated values oscillating in real-time via requestAnimationFrame polling

### Infrastructure & Polish
- User accounts with cloud progress sync (Supabase auth, PostgreSQL, "best wins" merge)
- Forgot password and password reset flow
- Error boundaries: two-tier (app-level reload, view-level menu recovery)
- Hash routing with lazy-loaded Supabase/tRPC (557→355KB initial bundle)
- Lazy-loaded view components via React.lazy + Suspense code splitting
- Touch support on 12 interactive components (Knob, Slider, XYPad, etc.)
- Tailwind CSS v4 migration (793 → 183 inline styles)
- Component decomposition: App.tsx (3,968 → 268 lines), 4 largest views (4,157 → 1,739 lines)
- Progress persistence (localStorage via Zustand + cloud sync)
- Progress display in menu header (stars, completion %)
- Module progress bars with star counts
- "Continue" button to resume from last incomplete challenge
- Success celebration confetti on passing challenges
- Mobile responsive menu layout
- First-time user onboarding tooltip

### Concept Library & Adaptive Curriculum
- **Concept Library:** Searchable reference of ~50 music production concepts and ~100 glossary terms
- **Standalone view:** `#/concepts` with search, track filtering, two tabs (Concepts grid + Glossary list)
- **Deep links:** `#/concepts/{conceptId}` for direct navigation to specific concepts
- **Concept modal:** `ConceptModalContext` enables opening concept details from anywhere (hints, results)
- **Concept link markers:** `[[concept-id|display text]]` in hint strings renders inline clickable links
- **Adaptive curriculum:** Player model analyzes score breakdowns to identify weaknesses and recommend challenges
- **Score breakdowns:** Each challenge result persists dimension-level scores (e.g., filter: 70, envelope: 85)
- **Recommended challenges:** Menu shows 3-5 personalized recommendations after 5+ attempted challenges
- **Practice suggestions:** Results modal shows "Practice More" chips for weak areas when player passes

### Testing
- 582 unit tests for evaluation logic, engines, routing, player model, concept links, module controls, parametric EQ, and per-control visibility
- All pure function tests, no audio context dependencies

## Session Log

| Session | Date | What Was Built |
|---------|------|----------------|
| 0 | — | Repo setup, deps, structure |
| 1 | 2026-02-04 | Synth engine (Tone.js), SynthView with all controls, spectrum analyzer, piano keyboard |
| 2 | 2026-02-04 | Sound analysis (Meyda.js), comparison scoring, ChallengeView, SD1 module (4 challenges) |
| 3 | 2026-02-05 | SD2 (Filter Basics), AI feedback (tRPC + Claude), SD3 (Envelopes), LFO support, SD4 (Modulation), LFO UI controls |
| 4 | 2026-02-05 | SD5 (Effects), SD6 (Synthesis Techniques), SD7 (Genre Sound Design) - Sound Design track complete (32 challenges) |
| 5 | 2026-02-05 | Polish - progress display, module progress bars, continue button, confetti celebration, mobile responsive, onboarding |
| 6 | 2026-02-05 | Mixing Fundamentals (F1-F8, 32 challenges) - EQ, compression, problem-solving |
| 7 | 2026-02-05 | Mixing Intermediate (I1-I6, 36 challenges) - multi-track with kick/bass, vocals, drums, stereo, reverb, full band |
| 8 | 2026-02-05 | Mixing Advanced (A1-A5, 36 challenges) - frequency mastery, stereo mastery, depth, dynamics, integration |
| 9 | 2026-02-05 | Mixing Mastery (M1-M4, 32 challenges) - full mix, genre mixing, automation concepts, troubleshooting |
| 10 | 2026-02-05 | Production Track (P1-P5, 20 challenges) - frequency stacking, layering, arrangement, stereo, full productions |
| 11 | 2026-02-05 | Bus EQ UI, bus compressor flag fix, bus-level condition types, unit tests (70 tests), deploy to Vercel |
| 12 | 2026-02-06 | Sampling Track Phase 1 - SamplerEngine, WaveformEditor, sampler store, SamplerView sandbox |
| 13 | 2026-02-06 | Sampling Track Phase 2 - evaluation logic (40 tests), SamplerChallengeView, SM1-SM6 challenges (24 total) |
| 14 | 2026-02-06 | Drum Sequencing Track - DrumSequencerEngine (60 tests), StepGrid, VelocityLane, store, views, DS1-DS6 (24 challenges) |
| 15 | 2026-02-06 | Drum samples (16 synthesized sounds), AI feedback for Sampling and Drum Sequencing tracks |
| 16 | 2026-02-06 | FM Synthesis Track expansion - 6 new SD8 challenges (12 total), generateFMSynthesis AI feedback endpoint |
| 17 | 2026-02-06 | Additive AI feedback - generateAdditiveSynthesis endpoint, ResultsModal routing for FM/Additive/Subtractive |
| 18 | 2026-02-06 | TypeScript strict mode cleanup - fixed 95+ errors across comparison functions, stores, components, Zod schemas |
| 19 | 2026-02-06 | Ableton-style synth UI - XY Pad, preset system (30 presets), sequencer (9 patterns + drums), ModuleCard visual redesign, WAV recording |
| 20 | 2026-02-06 | Layout polish - horizontal signal-flow layout, fixed header/menu overlap, compact visualizers, RecordingControl compact mode |
| 21 | 2026-02-06 | Performance optimization - Canvas visualizer fixes (cached gradients, reused TypedArrays, conditional shadows), React.memo on all visualizers |
| 22 | 2026-02-06 | UX polish - loading states for audio initialization, error handling with user-friendly messages, canvas overflow fix (maxWidth + overflow:hidden) |
| 23 | 2026-02-06 | Modulation envelopes - separate LFO/Filter Env modules, add Pitch/Mod/PWM envelopes with full ADSR + Amount controls, fix WaveformSelector overflow |
| 24 | 2026-02-07 | Subtractive synth quick wins - Noise generator (white/pink/brown + level), Portamento/Glide (toggle + time), LFO Sync (tempo divisions), Oscilloscope display |
| 25 | 2026-02-08 | Advanced subtractive synthesis - SD10-SD17 (48 challenges): Arpeggiator, Unison/Supersaw, Oscillator 2, Sub Oscillator, Noise Shaping, Glide, Velocity, Combined Techniques. LFO2, Mod Matrix, Pan control, real-time modulation display |
| 26 | 2026-02-08 | User accounts with cloud progress sync - Supabase auth (email/password), user_progress table with RLS, "best wins" merge strategy, theme system |
| 27 | 2026-02-08 | Forgot password and password reset flow |
| 28 | 2026-02-09 | Decompose App.tsx (3,968 → 268 lines) - extracted ChallengeButton, ChallengeModuleCard, ProgressStats, SandboxButtons, OnboardingTooltip, TrackSection, useNavigation hook, MenuView. 32 duplicate module blocks replaced by data-driven TrackSection pattern |
| 29 | 2026-02-09 | Decompose 4 largest views (4,157 → 1,739 lines) - extracted 18 shared components: challenge (Section, ChallengeHeader, HintsPanel, SubmitButton, ScoreBreakdownRow, ChallengeResultsModal), synth stages (EnvelopeStage, OscillatorStage, Osc2Stage, SubOscStage, NoiseStage, MixerStage, FilterStage, LFOStage, OutputStage, BottomControlStrip), useAIFeedback hook, shared formatters |
| 30 | 2026-02-10 | Error boundaries + hash routing tests (58 new tests) - ErrorBoundary component with two-tier recovery (app-level reload, view-level menu nav), extracted hash-routing.ts pure functions from useNavigation for testability |
| 31 | 2026-02-10 | Concept Library + Adaptive Curriculum - Concept Library with ~50 concepts and ~100 glossary terms (search, filter, deep links, modal context), player model for skill scoring/weakness detection/recommendations, score breakdown persistence in all 5 stores, practice suggestions in results modal, concept link markers in hints (56 new tests) |
| 32 | 2026-02-10 | Progressive Tool Complexity - Sound design progressive controls (SD1 shows only Oscillator+Output, SD2 adds Filter, SD3 adds Envelopes, SD4 adds LFO, SD5+ all), 4-band parametric EQ for mixing intermediate modules (lowshelf/2x peak/highshelf with freq/gain/Q per band), parametric-to-3-band conversion for backward-compatible evaluation (33 new tests) |
| 33 | 2026-02-11 | Per-Challenge Control & Visualization Visibility - Per-control granularity for SD1-SD4 challenges (16 files), `isControlVisible`/`isSectionVisible`/`getVisualizations` helpers, visualization array rendering, ChallengeVisualization type (22 new tests) |
