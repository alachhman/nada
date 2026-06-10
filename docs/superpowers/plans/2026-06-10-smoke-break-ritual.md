# Smoke Break Ritual — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Follow established nada patterns:
> StyleSheet + `lib/theme.ts` tokens, `components/ui/Reveal` for entrances (NEVER Moti mount hooks
> — they blank on web), web-guarded haptics, AsyncStorage provider w/ hydrate+persist-gate,
> Vitest for pure logic, verify via Expo web preview.

**Goal:** The fourth ritual — a timed, guided-breathing "smoke break" with calm completion,
tracked as breaks taken + time away, surfaced on the You hub. Completes the ritual set.

## File structure
```
lib/breaks.ts (+ lib/breaks.test.ts)            # BreakState + recordBreak reducer
components/providers/BreakProvider.tsx          # AsyncStorage nada_break_v1
app/break/_layout.tsx, app/break/index.tsx      # the ritual screen (single route)
components/break/BreathingCircle.tsx            # Reanimated loop (reduce-motion aware)
components/break/BreakComplete.tsx              # calm reveal (quiet glow, no confetti)
components/you/ReclaimedBlock.tsx               # → two-up row: Reclaimed | Breaks (or sibling block)
app/(tabs)/you.tsx                              # unlock Smoke break card → /break
```

## Milestone SB-A — logic + provider + entry (TDD)
- [ ] `lib/breaks.ts`: `BreakState { breaksTaken: number; secondsAway: number; streak: number; lastActiveDate: string | null }`, `INITIAL_BREAK_STATE`, pure `recordBreak(state, seconds, today)` (breaksTaken+1; secondsAway += max(0, round(seconds)); streak: 1 fresh / unchanged same-day / +1 yesterday / reset gap — reuse `isSameDay`/`isYesterday` from `lib/format`).
- [ ] `lib/breaks.test.ts`: count increments; seconds accumulate over two calls; negative clamps to 0; streak fresh/same-day/yesterday/gap.
- [ ] `BreakProvider` (`nada_break_v1`): `{ state, hydrated, recordBreak(seconds), reset }`, exactly the ScrollProvider pattern (async hydrate merge-over-initial; persist effect gated on hydrated; hook throws outside provider). Wire into `app/_layout.tsx` provider nest.
- [ ] You hub: make the **Reclaimed + Breaks** stats a two-up row (two half-width surface cards matching the existing card style): left "RECLAIMED / formatDuration(secondsReclaimed) / guilt-free scrolling (+🌀 streak pill)", right "BREAKS / `${breaksTaken} taken` / `formatDuration(secondsAway)` away from cigarettes". Unlock the **Smoke break** ritual card (remove lock, "Try it →", `router.push('/break')`).
- [ ] Scaffold `app/break/_layout.tsx` (Stack headerShown false) + placeholder `app/break/index.tsx`.
- [ ] Gates: `npm test` (new tests pass), typecheck, `npx expo export --platform web`. Commit `feat(break): break state, provider, You stats row, entry`.

## Milestone SB-B — the ritual screen
- [ ] `components/break/BreathingCircle.tsx`: centered circle (~size 240) on a soft sage glow; Reanimated `withRepeat(withSequence(withTiming(1.45, 4000ms easeInOut), withTiming(1.0, 4000ms)))` scale loop; a phase label that flips "breathe in"/"breathe out" every 4s (driven by the same loop via `useAnimatedReaction`→`runOnJS` or a synced JS interval). `AccessibilityInfo.isReduceMotionEnabled()` → static circle, label still flips.
- [ ] `app/break/index.tsx` — two phases via state:
  - **setup:** back chevron (router.back), title "Step outside", subline "All of the break, none of the cigarette.", duration pills 1/3/5 min (selected state, default 3, accent-filled when active), presence line ("3 others are on a break right now" — pick the count deterministically, e.g. 2 + (minutes selected % 3), keep it gentle), full-width "Step out" PillButton (light haptic).
  - **breaking:** BreathingCircle + countdown `mm:ss` (1s interval from `durationMs`; clear on unmount), the presence line (muted), subtle "End break early" text button.
  - **completion:** when countdown hits 0 → success-ish gentle haptic (selectionAsync, web-guarded) → `recordBreak(elapsedSeconds)` (guard a `committedRef`; early-end records only if elapsed ≥ 30s, else just `router.back()`) → render `BreakComplete`.
- [ ] `components/break/BreakComplete.tsx`: calm full-screen on `magicBg` (mirror ReclaimSummary's quiet language): soft 🌿 emblem + low-opacity glow, kicker "BREAK TAKEN", big `formatDuration(seconds)` + "away" in `magicGlow`, line "You stepped out, you breathed, you came back. No cigarette required.", PillButton "Back to nada" → `router.replace('/(tabs)/you')`.
- [ ] Gates: tests/typecheck/web export. Commit `feat(break): breathing break ritual + calm completion`.

## Verify + finish (controller)
- [ ] Web preview: You → Smoke break → pick 1 min → Step out → breathing circle + countdown → (early-end after >30s or wait) → calm completion → You shows Breaks stats; persists across reload. All four ritual cards now active.
- [ ] README: smoke break line in "How it works" (replace the "remaining ritual" teaser note).
- [ ] Review pass (code-reviewer agent), fix what matters, merge `feat/smoke-break` → master.

## Notes
- Use timer-based elapsed (Date.now() diff), not tick-counting, so backgrounded tabs stay accurate.
- The presence line is INERT theater — no network, no real users; keep the copy honest-adjacent ("on a break right now" is fine; don't fake names/avatars).
- Keep everything web-safe; no native-only APIs; guard haptics with `Platform.OS !== 'web'`.
