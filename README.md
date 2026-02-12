# Mixcraft

Learn music production through interactive challenges and AI-powered feedback. Players learn sound design, production, mixing, sampling, and drum sequencing by working with real audio and synthesis.

## Quick Start

```bash
bun install
bun run dev          # Frontend (Vite)
bun run dev:server   # Backend (tRPC)
bun run dev:all      # Both
```

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server |
| `bun run dev:server` | Start tRPC backend |
| `bun run dev:all` | Start both frontend and backend |
| `bun run build` | Production build |
| `bun run test` | Run Vitest test suite (714 tests) |
| `bun run typecheck` | TypeScript type checking (strict mode) |

## Architecture

```
src/
  core/       Pure game logic (synth engines, evaluation, analysis)
  ui/         React components, views, stores, hooks
  data/       Challenge definitions, concepts, presets, sequences
  server/     tRPC backend (AI feedback via Claude API)
  tests/      Mirrors src/ structure
```

**Key principle:** All game logic in `src/core/` with zero React dependencies. UI in `src/ui/` imports from core only.

## Five-Track Curriculum (320 challenges)

| Track | Challenges | What It Teaches |
|---|---|---|
| Sound Design | 110 | Subtractive, FM, and additive synthesis |
| Production | 20 | Layering, arrangement, frequency stacking |
| Mixing | 142 | EQ, compression, reverb, stereo, levels, dynamics |
| Sampling | 24 | Sample manipulation, chopping, pitch/time |
| Drum Sequencing | 24 | Step sequencing, groove, velocity, patterns |

## Stack

TypeScript (strict), React 18, Zustand, Tone.js + Web Audio API, Meyda.js, Canvas 2D, Vite, Vitest, tRPC, Supabase (auth + PostgreSQL), Claude API.

## Documentation

- `CLAUDE.md` -- Project conventions, current state, session log
- `docs/Spec.md` -- Full product specification
