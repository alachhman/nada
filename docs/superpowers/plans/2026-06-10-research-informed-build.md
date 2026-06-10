# Research-Informed Build — Execution Plan

> Executes the advisory addendum [2026-06-10-research-informed-recommendations.md](../specs/2026-06-10-research-informed-recommendations.md)
> against the CURRENT app (all four rituals shipped — every [POST-MVP] gate has passed).
> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. nada conventions apply (tokens +
> StyleSheet, `Reveal` not Moti mount hooks, web-guarded haptics, no non-worklet calls in worklets,
> AsyncStorage merge-over-default, Vitest for pure logic, verify in web preview).

## Mapping the recommendations → this build

| Rec | Disposition |
|---|---|
| R1 nothing-tracker | **Build now** — the shareable artifact (closest analog to the Korean app's viral courier). |
| R2 boxes/clutter counter | **Build now** — additive `itemCount` on SaveEntry + celebration/You copy. |
| R3 savings-first copy | **Verified already true** (grep: no dopamine/placebo in UI copy). Nothing to do. |
| R4 lore reviews | **Build now** — rewrite a slice of catalog reviews in never-received-and-delighted voice. |
| R5 name the streak | **Build now** — "No-buy streak" label. |
| R7 why-this-works page | **Build now** — static `app/why.tsx` + a quiet entry from the You hub. |
| R9 share-ready | **Build now (cheap form)** — native `Share` API (no new dep) from the nothing-tracker + streak share line. Image cards stay future/nada+. |
| R6 co-presence feed | **Deferred** (first real backend). Logged in Future notes below. |
| R8 no ads | **Already enforced** by the Responsibility Charter; monetization stays flag-off. Nothing to do. |

## Milestone NI-A — pure logic (TDD)
- [ ] `lib/types.ts`: `SaveEntry` gains optional `itemCount?: number` (total quantity intercepted). Backward-safe (older entries lack it).
- [ ] `lib/storage.ts` `recordIntercept`: set `itemCount` = sum of cart qty. Tests: itemCount recorded (incl. qty>1); old-shape entries still load (merge).
- [ ] `lib/nothing.ts` (+test): the nothing-tracker timeline. `NOTHING_STAGES` (label + sublabel + threshold) and pure `nothingStageFor(elapsedMs): { index, total, label, sublabel, progress }`:
  - 0 (< 2 min): "Order intercepted" / "Our warehouse is carefully packing nothing."
  - 1 (< 1 h): "Your nothing has shipped" / "It weighs nothing. The courier is thrilled."
  - 2 (< 24 h): "Your $X is staying home" / "Out for non-delivery." (the $X substitution happens at render)
  - 3 (≥ 24 h): "Delivered: nothing" / "Enjoy. Your money never left."
  `progress` = elapsed/24h clamped 0..1. Boundary tests.
- [ ] Helper `itemsKeptOut(saves): number` (sum itemCount ?? items.length) in `lib/storage.ts` or `lib/nothing.ts` + test.

## Milestone NI-B — UI
- [ ] **Nothing-tracker screen** `app/nothing/[ts].tsx` (ts = save timestamp): looks up the save from `useNada().state.saves`; not found → friendly empty + back. Renders: stage timeline (4 steps, current highlighted, past checked), reuse **`CourierMap`** with `progress` from `nothingStageFor` (a shared value set once — the courier carrying nothing), the save's `usd(amount)` + "N things kept out of your house", and a **Share** button (RN `Share.share` — text like "I almost spent $149. The order was intercepted. Nothing is on its way. — nada"). Web-guard share failures (try/catch; Share works on web where supported, no-op otherwise).
- [ ] **SavesFeed rows → pressable** (`components/you/SavesFeed.tsx`): each row navigates to `/nothing/<timestamp>`; add a subtle chevron. Keep style.
- [ ] **Intercept celebration line** (`components/intercept/InterceptOverlay.tsx`): under the reassurance copy add a muted line "N things kept out of your house · 0 boxes headed to your door" (N = current cart itemCount; wire via existing props/state — InterceptOverlay receives `amount`; add optional `itemCount` prop from the cart page).
- [ ] **"No-buy streak"** (`components/you/StatPills.tsx`): label "Streak" → "No-buy streak".
- [ ] **Lore reviews** (`lib/catalog.ts`): rewrite ~8–10 reviews across products in the never-received voice ("Five stars. It never arrived. My wallet has never felt better."), keep the rest as ambient realism. Tests unaffected (no shape change).
- [ ] **Why-this-works page** `app/why.tsx`: calm static page — honest open-simulator explanation (you know it's fake; the ritual is real; the intercept is the point), the Korean creator's own habit-extinction anecdote (uncredited by name, "the builder of the original fake delivery app"), and the no-ads/no-tracking promise. Entry: a small muted "why this works" link in the You hub footer (near reset).
- [ ] Gates per milestone: typecheck, tests, web export.

## Milestone NI-C — verify + finish
- [ ] Web preview: intercept → celebration shows the things-kept-out line → You → tap a save → nothing-tracker (timeline + map + share) → why page renders.
- [ ] Review pass (code-reviewer agent); fix Criticals/Importants.
- [ ] README: nothing-tracker + why page one-liners. Future notes: R6 co-presence (backend; design with smoke-break chat reuse in mind), R9 image share cards.
- [ ] Merge → master, push (CI).

## Future (logged, not built)
- **R6 anonymous co-presence** — "someone in Ohio just intercepted $84" feed; first backend; shared infra with a real damta-style smoke-break room.
- **R9 full share cards** — rendered image cards (view-shot) for saves/streaks; candidate nada+ delight.
