# nada — Smoke Break Ritual

**Date:** 2026-06-10
**Status:** Approved (delegated)
**Builds on:** the nada iOS app + food + doomscroll rituals. Completes the four-ritual set.

## Overview

The fourth and final placebo ritual: **the smoke break, minus the cigarette.** The insight from
the original SK "dopamine websites": the smoke break's real payoff is the *pause* — stepping
away, breathing, a moment of sanctioned idleness. nada recreates exactly that: a timed, calm
break with a guided breathing rhythm and the gentle ambiance of a shared break room ("3 others
are on a break right now") — no nicotine, no backend, no chat (client-only; the presence line is
inert theater, consistent with the app's honest-placebo framing).

- **Entry:** the "Smoke break" card on the You tab (currently the last locked teaser) → `/break`.
- **Payoff tone:** calm, like the doomscroll exit — not the confetti money-blast.

## Decisions
- **Metric:** **breaks taken** (count) + **total break seconds** + a daily streak — its own pure
  reducer + provider (`nada_break_v1`), mirroring the scroll pattern. Does NOT touch the savings
  reducer or scroll state.
- **You hub:** the Reclaimed block area becomes a **two-up row**: "Reclaimed" (scroll time) and
  "Breaks" (count + minutes). Smoke break card unlocks (Try it →).
- **No chat, no accounts** — presence is a deterministic, harmless line of theater.

## Flow
1. `/break` — **Step out** screen: title ("Step outside"), deadpan subline ("All of the break,
   none of the cigarette."), duration pills **1 / 3 / 5 min** (default 3), a "3 others are on a
   break right now" presence line, big "Step out" PillButton.
2. **Break screen** (same route, state switch): a large **breathing circle** (Reanimated loop:
   ~4s expand "breathe in" / ~4s contract "breathe out", label cycles), **mm:ss countdown**,
   the presence line, subtle "End break early".
3. **Completion** (timer done, or early-end with ≥30s elapsed): record the break, then a calm
   reveal: 🌿 "BREAK TAKEN" / big "X min away" / "You stepped out, you breathed, you came back.
   No cigarette required." / "Back to nada" → You tab. Early-end under 30s: just exit, nothing
   recorded.

## Data & state
`lib/breaks.ts` (pure, tested): `BreakState { breaksTaken, secondsAway, streak, lastActiveDate }`,
`INITIAL_BREAK_STATE`, `recordBreak(state, seconds, today)` — count+1, seconds accumulate
(clamped ≥0, rounded), streak via the shared `isSameDay`/`isYesterday` logic.
`BreakProvider` (AsyncStorage `nada_break_v1`): `{ state, hydrated, recordBreak(seconds), reset }` —
same hydrate/persist-gated pattern as ScrollProvider.

## Reuse
Tokens, `Reveal`, `PillButton`, `formatDuration`, web-guarded haptics, the calm-reveal language
(quiet glow, no confetti). Breathing circle: Reanimated `withRepeat(withTiming)` loop, scale
~1.0→1.45 with soft sage glow; respect reduce-motion (static circle + label only).

## Testing
Unit (Vitest): `lib/breaks.ts` reducer (count/seconds accumulation, clamp, streak cases).
Manual (web preview): full ritual + You hub two-up stats + persistence across reload.

## Done =
You → Smoke break → duration → breathing break with countdown → calm completion → Breaks stat
on You (persisted). All four ritual cards active. Web-safe; tests/typecheck/export green.
