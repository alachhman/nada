# nada+ — Monetization Spec & Responsibility Charter

**Date:** 2026-06-10
**Status:** Approved (productize responsibly)
**Companion:** [docs/monetization-plan.md](../../monetization-plan.md) (strategy)

The strategy doc says *what* and *why*. This spec is the binding *how* — with a Responsibility
Charter at the top that governs every monetization decision, and a concrete, buildable Phase-1
(`nada+` subscription infra + paywall) that ships **flagged off** until live products exist.

---

## 0. Responsibility Charter (binding — overrides revenue)

nada exists to help people **cut impulse spending and time-sink habits.** Monetization may never
erode that. These rules are non-negotiable and reviewed on every monetization PR:

1. **The habit-help is free, forever.** All four rituals, the intercept, and the core stats (money
   saved, streak, cravings, time reclaimed, breaks) are 100% free and never gated, throttled, or
   degraded to push upgrades. If a feature *helps someone spend/scroll less*, it is free.
2. **Never monetize inside the ritual.** No price, fee, ad, or real-purchase prompt in the
   browse→cart→intercept (or food/scroll/break) flow — that reintroduces the exact friction/guilt
   the product removes. Money is earned *around* the experience, never *in* it.
3. **No ads. No tracking. No data sale.** First-party, aggregate, on-device-respectful analytics
   only. This is an ethical line *and* a marketing asset.
4. **No engagement dark patterns.** We do **not** optimize for time-in-app or session count — a user
   who needed nada less over time is a *success*, not churn. No streak-anxiety manipulation, no
   FOMO/scarcity, no guilt nags, no fake urgency, no loot-box mechanics.
5. **Paywalls are honest and frictionless to refuse.** Always a visible, equal-weight "Maybe later";
   never a forced wall on open; never trickery on trial-to-paid (clear pricing, clear renewal, easy
   cancel/restore). Surfaced only at genuine value moments, not friction points.
6. **"Make it real" never profits from the user's money.** nada takes **no cut of user funds**; it
   earns a partner referral/rev-share for sending real savers. We only ever suggest moving money
   *out of spending and into the user's own savings/investing* — never into anything nada sells.
7. **Premium is depth & delight, not the medicine.** Paid = deeper insight, more content, cosmetics,
   automation, real-savings rails. It enhances; it is never the thing that makes the core work.

A change fails review if it breaks any rule above, regardless of its revenue impact.

---

## 1. The free / paid boundary

**Always free (the mission):**
- All 4 rituals, fully playable; the intercept; the calm completions.
- Core stats: total saved, streak, cravings handled, time reclaimed, breaks taken + time away.
- The base catalog/restaurants/feed; light theming; the "reset" controls.

**nada+ (depth & delight — purely additive):**
- **Insights:** weekly/monthly "you didn't spend" reports, trends, biggest cravings, time-of-day
  patterns, charts.
- **Expanded worlds:** more stores/categories, more restaurants, seasonal drops, more feed variety.
- **Customization:** themes (incl. the dark "Premium" skin), alt app icons, sticker/mascot packs,
  breathing-pacer + ambient sound packs.
- **Goals & milestones:** don't-spend targets, milestone moments, shareable "I saved $X" cards,
  home-screen widgets, Apple Health "mindful minutes" sync for breaks.
- **"Make it real" automation:** round-up rules / auto-transfer config for the savings partner.

## 2. Pricing
- **$2.99/mo · $19.99/yr (push annual, 7-day trial) · $39.99 lifetime.**
- Copy: *"nada+ costs less than the thing you almost bought."*

## 3. Paywall placement (per Charter rules 5)
Surface `nada+` only at **earned-value peaks**, never a cold wall:
- After an intercept/completion: *"You've saved $X with nada. See where it's going →"*
- On a milestone/streak.
- From a locked **Insights** teaser on the You hub (the Phase-1 build below).
Every surface has an equal-weight dismiss and never blocks the free core.

## 4. Architecture
- **`PremiumProvider` / `usePremium()`** → `{ isPremium, hydrated, ... }`. Single source of truth;
  every paid feature reads this gate. Phase-1 backs it with an AsyncStorage flag (`nada_premium_v1`)
  so the gate, paywall, and gated UI are fully buildable/testable **before** IAP exists.
- **RevenueCat swap (Phase-1.5):** add `react-native-purchases`; `isPremium` reads the entitlement
  instead of the local flag (one function changes). RevenueCat handles StoreKit/Play, trials,
  restore, entitlements — clean fit with our provider pattern. Needs: Apple Developer enrollment +
  products configured in App Store Connect + RevenueCat project (all user-credentialed).
- **Feature flag `MONETIZATION_ENABLED`** (`lib/flags.ts`, default **false**): when false, the app is
  byte-for-byte today's UX (no paywall, no gated teasers) — so store builds stay clean until launch.
  Flip true (+ wire RevenueCat) to go live.

## 5. "Make it real" — partner approach (Phase 2)
Turn an intercepted non-purchase into a **real** transfer to the user's own savings/investing.
- **Best-fit model:** round-up investing (Acorns-style) — narratively identical to nada ("the money
  you didn't spend → invest the spare change for real"). Alternatives: a high-yield savings partner,
  or Robinhood-style auto-invest/HYSA.
- **Revenue:** finance is a top-paying affiliate niche — per-funded-account bounties (commonly
  $5–$100) + trailing rev-share on balances; tracked via standard affiliate infra (e.g. a
  ReferralHero/Lasso/wecantrack-style layer) or a direct partner SDK.
- **Compliance boundary:** `nada+` (a digital good) → Apple IAP. The savings partner is a **financial
  service**, handled via the partner's own flow/SDK — **not** IAP, and kept clearly separate to stay
  App-Store-compliant. nada never custodies funds; never takes a cut of the user's money (Charter 6).
- Start lowest-lift: a **referral hand-off** from the intercept ("move this for real?") to one
  partner; measure attach; deepen to in-app automation (gated by `nada+`) only if it lands.

## 6. Phase-1 build (this increment — flagged off)
Make nada **monetization-ready** without changing current UX or shipping a non-functional purchase:
1. `lib/flags.ts` — `MONETIZATION_ENABLED = false`.
2. `components/providers/PremiumProvider.tsx` — `usePremium()` (AsyncStorage `nada_premium_v1`,
   `setPremium` dev stub + `restore`/`reset`), wired into the root provider nest.
3. `app/paywall.tsx` — the on-brand, Charter-compliant `nada+` paywall (value list, 3 plan options,
   prominent "Maybe later", honest copy). For now the plan buttons call a clearly-labeled
   **placeholder** that sets the local entitlement (TODO: replace with RevenueCat purchase). Easy to
   dismiss; no dark patterns.
4. **One additive gated surface** behind the flag: a locked **"Weekly report · nada+"** Insights
   teaser on the You hub. Free → soft lock → opens `/paywall`. Premium → a small sample summary.
   The four rituals and all existing stats are untouched and free.
5. Tests: a unit test for any premium pure logic; verify the gate + paywall on web preview with the
   flag on; confirm flag-off = today's UX exactly.

## 7. Definition of done (Phase 1)
- `usePremium()` gate + dismissible `nada+` paywall + the flagged Insights teaser exist and work.
- With `MONETIZATION_ENABLED=false` (default), the app is visually identical to today.
- Charter rules all hold (habit-help free, easy dismiss, no ritual monetization, no ads/tracking).
- typecheck + tests + web export green. RevenueCat + partner are documented next steps (credential-gated).
