# Doomscroll Ritual — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Reuses nada iOS patterns (StyleSheet + `lib/theme.ts` tokens, `components/ui/Reveal` for entrances — NOT Moti mount hooks, which blank on web; web-guarded haptics; `expo-image`; Vitest for pure logic). Verified via Expo web preview.

**Goal:** A guilt-free infinite "doomscroll" feed (positive social posts, affirmations, tiny wins, slow news, calm imagery) that tracks **time reclaimed** + a scroll streak, with a calm exit summary, surfaced in the You hub — separate from the $-saved stats.

**Architecture:** A pushed `app/scroll/` screen launched from the You "Doomscroll" card. Procedural feed from `lib/feed.ts`. Time/streak tracked in a new `ScrollProvider` (AsyncStorage, pure logic in `lib/scroll.ts`) — the savings reducer is untouched.

## File structure
```
lib/feed.ts                          # FeedItem union + content pools + generateFeed()  [tested]
lib/scroll.ts                        # ScrollState + addReclaimed() pure reducer         [tested]
lib/duration.ts                      # formatDuration(seconds) -> "Xh Ym" / "X min"      [tested]
components/providers/ScrollProvider.tsx   # AsyncStorage-persisted time/streak context
app/scroll/_layout.tsx               # Stack (headerShown false)
app/scroll/index.tsx                 # the infinite feed + time tracking + exit summary
components/scroll/FeedCard.tsx       # renders a FeedItem by kind
components/scroll/NadaInterstitial.tsx    # periodic "costs you nothing" card
components/scroll/ReclaimSummary.tsx # calm exit reveal (time reclaimed)
components/you/ReclaimedBlock.tsx    # You-hub stat block (time + scroll streak)
```

---

## Milestone DS-A — Data, store, provider, entry, You stat block

- [ ] **A1. `lib/duration.ts` + test** — `formatDuration(totalSeconds): string` → `"<1 min"` under 60s, `"X min"` under 60 min, `"Xh Ym"` (omit `0m`) above. Unit-test a few values.
- [ ] **A2. `lib/scroll.ts` + `lib/scroll.test.ts`** — `ScrollState { secondsReclaimed, streak, lastActiveDate }`, `INITIAL_SCROLL_STATE`, pure `addReclaimed(state, seconds, today): ScrollState` (adds seconds; streak via the same logic as the savings reducer: 1 if no lastActiveDate, unchanged same-day, +1 if `isYesterday`, reset to 1 on gap — reuse `isSameDay`/`isYesterday` from `lib/format`). Tests: accumulation; streak fresh/same-day/yesterday/gap.
- [ ] **A3. `lib/feed.ts` + `lib/feed.test.ts`** — the `FeedItem` union + content pools (≥12 each: positive social posts w/ author+handle+text+like/comment counts, affirmations, tiny wins, deadpan slow-news headlines+source, calm captions + Unsplash calm image URLs via an `img()` helper). `generateFeed(startIndex, count): FeedItem[]` — deterministic by index (stable unique string ids like `item-<n>`), cycles/shuffles the pools by index so consecutive items vary in kind, and inserts a `{kind:"nada"}` interstitial roughly every 8 items. Tests: returns exactly `count` items; ids unique across two consecutive batches; image URLs are https; contains a mix of ≥3 kinds in a batch of 20; at least one `nada` per 16.
- [ ] **A4. `components/providers/ScrollProvider.tsx`** — `{ state: ScrollState, hydrated, addReclaimed(seconds:number), reset() }`. Async hydrate from AsyncStorage key `nada_scroll_v1` (use `loadState` pattern: try/catch, merge over INITIAL). `addReclaimed(s)` computes `today = isoDay(new Date())`, `setState(prev => addReclaimed(prev, s, today))`, persists after hydration (effect gated on `hydrated`). `useScroll()` throws outside provider.
- [ ] **A5. Wire into `app/_layout.tsx`** — add `<ScrollProvider>` inside the existing provider stack (e.g. NadaProvider > ScrollProvider > CartProvider). Keep order otherwise.
- [ ] **A6. `components/you/ReclaimedBlock.tsx`** — a stat block: heading "Reclaimed", `formatDuration(state.secondsReclaimed)` big, "of guilt-free scrolling" sub, and a small "scroll streak" pill (🌀/📱 when >0). Reads `useScroll()`. Match the You card style + tokens.
- [ ] **A7. Wire into `app/(tabs)/you.tsx`** — render `<ReclaimedBlock/>` as its own section (below the $ pills / above or below Recent saves), wrapped in `Reveal`. AND make the **Doomscroll** ritual card active (remove its lock; `onPress` → `router.push('/scroll')`; add a "Try it →" affordance like the Food card). Smoke break stays locked.
- [ ] **A8. Scaffold** `app/scroll/_layout.tsx` (Stack, headerShown false) + a placeholder `app/scroll/index.tsx` so the route compiles.
- [ ] **A9.** `npm test` (new tests pass), `npm run typecheck`, `npx expo export --platform web`. Commit: `feat(scroll): feed/scroll data, ScrollProvider, You reclaimed block, entry`.

---

## Milestone DS-B — The feed (cards, infinite scroll, time tracking)

- [ ] **B1. `components/scroll/FeedCard.tsx`** — renders a `FeedItem` by `kind`, each a rounded `surface` card (tokens):
  - **social:** avatar circle (initials on `avatarColor`), author + `@handle`, post text, an inert action row (♡ like w/ count, 💬 comment w/ count). Tapping ♡ toggles a local liked state with a small heart pop (Reanimated) + light haptic (web-guarded); count +1 locally.
  - **affirmation:** soft pastel full-width card, centered affirmation text.
  - **tinywin:** "TINY WIN" label + the win text, a small ✅/🌱 accent.
  - **news:** looks like a news item — `source` eyebrow + bold `headline`, deadpan.
  - **calm:** `expo-image` (calm photo), caption overlay/below.
  Subtle `Reveal` entrance (small delay).
- [ ] **B2. `components/scroll/NadaInterstitial.tsx`** — a gentle full-width card on a soft accent/sage tint: "still nada" / "no ads. no algorithm. this costs you nothing." + the running session time (passed as a prop, e.g. `sessionSeconds`). Calm, not loud.
- [ ] **B3. `app/scroll/index.tsx` — the feed:**
  - State: `items: FeedItem[]` seeded with `generateFeed(0, 18)`; `onEndReached` appends `generateFeed(items.length, 12)` (guard against rapid duplicate appends). `FlatList` with `keyExtractor` by id, `renderItem` → `FeedCard` or `NadaInterstitial` (pass live `sessionSeconds`).
  - A minimal top bar: a back/close chevron (commits time + shows summary on press) and a tiny live "Xs" or status. Cream bg.
  - **Time tracking:** on mount store `startRef = performance.now()` (or Date.now); keep a `sessionSeconds` state ticking every 1s via `setInterval` (for the interstitial display); on exit compute elapsed.
  - For nada interstitials, render `NadaInterstitial` with `Math.floor(sessionSeconds)`.
- [ ] **B4.** typecheck + web export + commit: `feat(scroll): infinite feed + cards + time tracking`.

---

## Milestone DS-C — Exit summary, You integration polish, verify, finish

- [ ] **C1. `components/scroll/ReclaimSummary.tsx`** — a CALM full-screen reveal (NOT the confetti blast): soft dark or sage backdrop, a gentle emblem (🌿), "Time reclaimed", a count-up or plain `formatDuration(seconds)` big in `positive`, a line like "You scrolled here instead of the spiral — and you feel fine.", and a `PillButton` "Back to nada". Quiet motion (fade/rise via `Reveal` or simple Reanimated), maybe one soft glow — no explosive confetti.
- [ ] **C2. Wire exit in `app/scroll/index.tsx`** — on close/back: compute `elapsed = Math.round((now - startRef)/1000)`; if `elapsed >= 2`, call `useScroll().addReclaimed(elapsed)` and show `<ReclaimSummary seconds={elapsed} onClose={...} />`; `onClose` → `router.replace('/(tabs)/you')`. Guard against double-commit (a `committedRef`). Also commit on unmount if the user navigates away without the button (best-effort).
- [ ] **C3. Verify (controller, web preview):** You → Doomscroll → feed scrolls with variety + infinite + like pop + nada interstitials showing session time → close → calm summary → You "Reclaimed" block shows the added time + streak; persists across reload.
- [ ] **C4. README** — add the doomscroll ritual to "How it works". 
- [ ] **C5.** `npm test` + `npm run typecheck` + `npx expo export --platform web` all green. Commit: `feat(scroll): calm exit summary + verify`. Then merge `feat/doomscroll` → master.

## Self-review notes
- Time/streak in `ScrollProvider` is fully separate from the savings reducer (`recordIntercept` untouched).
- Use `components/ui/Reveal` for entrances (Moti mount hooks blank on web).
- Keep `Date.now`/`performance.now`/`setInterval` in the app runtime (fine; the no-RNG/Date rule is workflow-only).
- Web-safe (no native-only APIs); guard haptics; `expo-image` for calm photos.
- The exit summary is deliberately calmer than the money intercepts (peace, not a dopamine blast).
