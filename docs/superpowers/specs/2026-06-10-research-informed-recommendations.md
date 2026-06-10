# nada — Research-Informed Recommendations (Addendum)

**Date:** 2026-06-10
**Status:** Advisory addendum — does NOT modify the approved [design spec](./2026-06-08-nada-dopamine-app-design.md) or [MVP plan](../plans/2026-06-08-nada-mvp.md). Read those first; treat this as prioritized guidance layered on top.
**Source:** [Deep research report on the Korean dopamine-website trend](../../context/korean-dopamine-websites-deep-research.md) (full citations there).

## How to use this document

The MVP plan stays the contract. Items below are tagged:

- **[MVP-SAFE]** — small enough to fold into the current build without expanding scope. Implement if the touched task isn't done yet; otherwise queue as immediate follow-up.
- **[POST-MVP]** — first things to build after the MVP boundary is met. Do not start before then.
- **[COPY/POSITIONING]** — affects words and framing only, not architecture. Free to apply everywhere.
- **[DO-NOT]** — explicit anti-recommendations.

## Key research facts driving these recommendations

1. The Korean category leaders are solo-built, no-signup, free, client-only, humor-forward, single-ritual sites — nada's architecture is already category-correct. No validation work needed.
2. The most-screenshotted, most viral feature was *post-payment theater*: a fake "rabbit rider" courier with live tracking, assigned *after* the fake order completes.
3. Users came for **money saved under inflation**, not "dopamine" — that framing was invented by press. The Korean app paired money with a second saved dimension (calories).
4. Users invented a streak challenge (배달 참기 챌린지) organically; the smoke-break site's real engine was anonymous co-presence ("suffering together" chat).
5. The fake delivery app's creator marketed via in-character lore (a fictional rider's resignation letter: "no matter how far I ride, no food ever arrives") — marketing outperformed actual usage (200–300 DAU vs. millions of impressions).
6. Monetization in-category: AdSense or nothing. Nobody has tried premium/donations/B2B.
7. The substantive criticism on record: "imitation sociality" / frictionless fake rituals may weaken real-world resilience. Unaddressed by any incumbent.
8. **No fake-shopping simulator exists anywhere** — nada has no incumbent, in Korea or the West.

## Recommendations

### R1. Post-intercept theater: "Your nothing has shipped" [POST-MVP]

The intercept celebration currently ends the loop. Korean evidence says the payoff should *continue after* the transaction moment (fact 2). Add a comedic order-status page for the non-order:

- After an intercept, the save entry gets a fake "tracking" lifecycle: "Order intercepted" → "Your nothing has shipped" → "Your $203 is staying home" → "Delivered: nothing. Enjoy."
- Surface it from the SavesFeed (each entry clickable → status page). Statuses advance on elapsed wall-clock time since the intercept — derivable from `SaveEntry.timestamp`, no backend, no new state writes needed.
- This is the shareable artifact. Prioritize it first post-MVP; it is the closest analogue to the feature that made the Korean app viral.

### R2. Second "saved" dimension: boxes/clutter [MVP-SAFE]

Korea paired money + calories (fact 3). nada's natural pair is money + stuff kept out of your home:

- Count items-not-purchased per intercept (cart line quantities already exist). Display as "0 boxes headed to your door" / cumulative "items kept out of your house: 47."
- Touches: `SaveEntry` gains `itemCount`; `recordIntercept()` aggregates it; one extra stat pill + one line in the intercept celebration. Trivial if `storage.ts` isn't finalized; still cheap after.

### R3. Copy hierarchy: savings first, dopamine never (in-product) [COPY/POSITIONING]

- Hero copy and intercept celebration lead with dollars saved. Keep "dopamine," "placebo," and wellness-clinical vocabulary out of the UI entirely; the spec's dry humor is the voice.
- US cultural hooks to write toward: credit-card debt, "underconsumption core," girl-math-but-honest. The economic motive is the documented one (fact 3) — don't bury it under wellness framing.
- "Dopamine placebo" remains fine for README/press/meta description — it's the press hook, not the user hook.

### R4. Catalog and reviews as lore [MVP-SAFE, COPY/POSITIONING]

In-character world-building was the Korean creator's highest-leverage move (fact 5). The catalog (`lib/catalog.ts`) and fake reviews are nada's lore surface — they are already planned; this shapes their content:

- Reviews written by people who never received anything and are delighted: "Five stars. It never arrived. My wallet has never felt better."
- A warehouse-that-ships-nothing motif can run through product descriptions and the (R1) tracking copy.
- Zero scope cost — it's writing inside files the plan already creates.

### R5. Streak mechanics: keep, and name the challenge [MVP-SAFE]

Streaks are validated by organic user behavior in Korea (fact 4). Already in the MVP plan — no change. One copy addition: frame the streak as a named challenge ("the no-buy streak") so it's screenshot-able and self-explaining when shared.

### R6. Anonymous co-presence layer [POST-MVP, after R1]

The second engine in-category is anonymous "saving together" (fact 4). Lowest-cost version: a simulated-then-real global feed — "someone in Ohio just intercepted $84." Requires the first real backend decision, so it is strictly post-MVP. Note it is also the foundation the coming-soon smoke-break ritual needs (anonymous chat); build the feed with that reuse in mind.

### R7. "Why this works" page [POST-MVP, cheap]

Pre-empt the one substantive criticism on record (fact 7): a short static page owning the open-simulator premise — why rehearsing the ritual with an honest intercept differs from a trick, citing the Korean creator's own experience (building/testing her fake delivery app extinguished her real delivery habit). One static route, no state.

### R8. Monetization [DO-NOT, for now]

- **Do not add AdSense or any ads.** Ads are the only model anyone in-category has tried; they undercut the premise (an app about not spending that sells your attention) and the positioning whitespace is more valuable than early pennies.
- Defer all monetization past MVP. When revisited, the unexplored options are premium themes/rituals, tip-jar, B2B wellness. No action now.

### R9. Shareable save cards — promote in priority [POST-MVP]

Already listed in the spec's future enhancements. Research says move it up: the Korean trend spread entirely through screenshots and reposts (fact 5). R1's tracking page and R5's named streak are the two assets to make share-ready first.

## Suggested sequencing

1. **During MVP build:** R2 (boxes counter), R4 (lore catalog/reviews), R5 (challenge naming), R3 applied throughout — all inside files the plan already creates.
2. **Immediately post-MVP:** R1 (nothing-tracker) → R9 (share cards) → R7 (why-this-works page).
3. **Later:** R6 (co-presence feed, designed for smoke-break reuse).
4. **Never (for now):** R8 (ads/monetization).
