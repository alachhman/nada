# nada — Doomscroll Ritual

**Date:** 2026-06-09
**Status:** Approved
**Builds on:** the nada iOS app + food ritual.

## Overview

The third placebo ritual. An **infinite, deliberately-empty feed** that looks and feels like a real
social app — so the scroll-craving is satisfied — but stripped of everything toxic: no ads, no
outrage, no unread badges, nothing to buy, no FOMO. A guilt-free dopamine drip. The payoff isn't
money saved; it's **time and peace reclaimed**: the app tracks minutes spent scrolling here (instead
of the real spiral) and celebrates them calmly.

- **Entry:** the "Doomscroll" card on the You tab (currently a teaser) → pushes a full-screen feed.
- **Tagline vibe:** "an endless feed that owes you nothing."

## Decisions
- **Metric:** **time reclaimed** — total minutes scrolled in nada + a daily guilt-free-scroll streak.
  Shown as a SEPARATE stat block on the You hub (kept distinct from the $-saved stats; does NOT touch
  the savings reducer).
- **Feed content:** a shuffled mix of — good-spirited **fake social posts** (no real people, pleasant,
  inert likes/comments), **affirmations**, **tiny wins**, deadpan **slow news** ("Local man drinks
  water, feels fine."), and **calm imagery** (soft nature / oddly-satisfying). Periodic **nada
  interstitial** cards remind you it's costing you nothing and show running time reclaimed.
- **Tone of the payoff:** calm, not a confetti blast (peace, not a dopamine explosion).

## Reuse / new
- Reuse: `lib/theme.ts` tokens, `components/ui/Reveal.tsx` (web-reliable entrance — DO NOT use Moti
  mount entrances), `PillButton`, motion (Reanimated/Moti), `expo-image`, web-guarded haptics.
- New persistence: a small **`ScrollProvider`** (AsyncStorage, key `nada_scroll_v1`) with pure
  reclaim/streak logic in `lib/scroll.ts` (mirrors the savings reducer's streak pattern). Does NOT go
  through `recordIntercept`; savings logic untouched.

## Information Architecture
| Screen | Route | Purpose |
|---|---|---|
| Doomscroll feed | `app/scroll/index.tsx` | Full-screen infinite feed; tracks session time; calm exit summary. |

(Single pushed screen, launched from You → Doomscroll card.)

## Data & state
`lib/feed.ts`:
```
type FeedItem =
  | { kind: "social";      id; author; handle; avatarColor; text; likes; comments; image? }
  | { kind: "affirmation"; id; text }
  | { kind: "tinywin";     id; text }
  | { kind: "news";        id; headline; source }
  | { kind: "calm";        id; image; caption }
  | { kind: "nada";        id; minutesReclaimed }   // periodic interstitial
generateFeed(startIndex, count): FeedItem[]   // procedural, shuffled pools, stable incremental ids, infinite
```
Content pools (~12+ each) of positive social posts, affirmations, tiny wins, slow-news headlines, calm
captions + Unsplash calm image URLs. `generateFeed` is deterministic by index (stable keys; no reliance
on a single RNG seed needed — vary by index) and sprinkles a `nada` interstitial every ~8 items.

`lib/scroll.ts` (pure, tested):
```
ScrollState { secondsReclaimed: number; streak: number; lastActiveDate: string | null }
INITIAL_SCROLL_STATE
addReclaimed(state, seconds, today): ScrollState   // adds seconds; streak: 1 fresh / unchanged same-day / +1 yesterday / reset on gap
```
`ScrollProvider` (AsyncStorage): `{ state, hydrated, addReclaimed(seconds), reset }`.

## Behavior
- **Feed:** a `FlatList` of `FeedCard`s; `onEndReached` appends the next `generateFeed(...)` batch
  (effectively infinite). Subtle `Reveal` entrance on cards; an inert "like" tap that hearts (a small
  dopamine pop, no real counts change beyond local). nada interstitial cards every ~8 items show the
  running session minutes + a gentle line.
- **Time tracking:** record a start timestamp on mount; accumulate while the screen is focused; on exit
  (back / unmount), commit `Math.round(elapsedSeconds)` via `addReclaimed`.
- **Exit summary:** on leaving, a calm (not confetti) reveal: "Time reclaimed · ~X min · you scrolled
  here instead of the spiral, and you feel fine." → back to You. (A soft variant of the celebration —
  quiet glow, no explosive confetti.)

## You hub integration
A new **"Reclaimed" stat block** on the You tab (separate section under the existing $-saved hero/pills):
"~Xh Ym reclaimed" + a guilt-free-scroll streak, reading from `useScroll()`. The Doomscroll ritual card
becomes active (navigates to `/scroll`); smoke break stays a locked teaser.

## Testing
- Unit (Vitest): `lib/scroll.ts` (`addReclaimed` accumulation + streak fresh/same-day/yesterday/gap),
  `lib/feed.ts` (`generateFeed` returns the requested count, stable unique ids, valid image URLs, mixes
  kinds, sprinkles `nada`).
- Manual: scroll the feed in web preview (variety, infinite, like tap), exit → summary, You shows reclaimed time + streak; persists across reload.

## MVP Boundary (Done)
- You → Doomscroll launches a full-screen, infinite, mixed positive feed.
- Cards render with variety (social/affirmation/tinywin/news/calm + nada interstitials), smooth scroll, inert like.
- Session time tracked; exit shows a calm "time reclaimed" summary; logged to `ScrollProvider`.
- You hub shows a "Reclaimed" stat block (time + scroll streak), persisted across reload.
- Web-safe, typechecks, unit tests pass, verified in web preview.

## Non-Goals
- No real content/network, no real social graph, no notifications, no comments composer. Smoke break ritual stays a teaser.
