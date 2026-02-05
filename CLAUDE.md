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
    sound-analysis.ts
    sound-comparison.ts
  ui/             # React components. Imports from core/ only.
    components/   # Reusable UI (Knob, Slider, WaveformSelector, LFOWaveformSelector, SpectrumAnalyzer, etc.)
    views/        # Full-screen views (SynthView, ChallengeView)
    stores/       # Zustand stores (synth-store.ts, challenge-store.ts)
  data/           # Static data files
    challenges/   # Challenge definitions by module (sd1-sd7/)
  server/         # tRPC backend
    routers/      # API routers (feedback.ts for AI feedback)
  tests/          # Mirrors src/ structure
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

## Three-Track Curriculum

1. **Sound Design** (32 challenges) — synthesis, filters, envelopes, modulation. Ships first.
2. **Production** (20 challenges) — layering, arrangement, frequency stacking.
3. **Mixing** (136 challenges) — EQ, compression, reverb, stereo, levels.

Sound design is the entry point. It has the lowest content requirements (synthesis generates its own audio) and teaches concepts that make mixing intuitive later.

## Current State

**32 Sound Design challenges complete (SD1-SD7)** with AI-powered feedback.

- Subtractive synth with oscillator, filter, dual ADSR envelopes, LFO (filter modulation)
- Effects chain: distortion, delay, reverb, chorus (all with dry/wet mix)
- Challenge system with scoring (70% audio features, 30% parameter proximity)
- tRPC backend with Claude API for natural language feedback
- Full UI controls for all synth parameters and effects

**Sound Design Track Complete:**
- SD6: Synthesis Techniques - 6 mastery challenges combining all concepts
- SD7: Genre Sound Design - 6 challenges recreating iconic synth sounds (80s Brass, Reese Bass, Juno Pad, Trance Supersaw, Synthwave Bass, Cinematic Strings)

**Polish Complete:**
- Progress persistence (localStorage via Zustand)
- Progress display in menu header (stars, completion %)
- Module progress bars with star counts
- "Continue" button to resume from last incomplete challenge
- Success celebration confetti on passing challenges
- Mobile responsive menu layout
- First-time user onboarding tooltip

**Next:** Production track

## Session Log

| Session | Date | What Was Built |
|---------|------|----------------|
| 0 | — | Repo setup, deps, structure |
| 1 | 2026-02-04 | Synth engine (Tone.js), SynthView with all controls, spectrum analyzer, piano keyboard |
| 2 | 2026-02-04 | Sound analysis (Meyda.js), comparison scoring, ChallengeView, SD1 module (4 challenges) |
| 3 | 2026-02-05 | SD2 (Filter Basics), AI feedback (tRPC + Claude), SD3 (Envelopes), LFO support, SD4 (Modulation), LFO UI controls |
| 4 | 2026-02-05 | SD5 (Effects), SD6 (Synthesis Techniques), SD7 (Genre Sound Design) - Sound Design track complete (32 challenges) |
| 5 | 2026-02-05 | Polish - progress display, module progress bars, continue button, confetti celebration, mobile responsive, onboarding |
