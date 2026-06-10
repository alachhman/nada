# nada — Monetization Plan

**Date:** 2026-06-10
**TL;DR:** A **freemium subscription (`nada+`)** is the revenue core, paywalled at the app's
natural emotional peaks (the "you saved $X" moments). The signature, defensible growth lever is
**"make your savings real"** — a fintech partnership that turns intercepted-purchase dollars into
actual money moved to savings/investing, monetized via referral/revenue-share. A small one-time
**unlock / tip** captures goodwill from people who won't subscribe. **No ads, no data sale, ever** —
that's both an ethical requirement and a marketing wedge.

---

## 1. The constraint that shapes everything

nada's premise is *get the dopamine, keep the money.* Any monetization that pushes users to spend
(real ads, affiliate links to real products, manipulative upsells) directly contradicts the product
and would read as a betrayal. So the rule:

> **nada only makes money in ways that are aligned with the user spending less.**

This is a feature, not a limitation. "No ads. No tracking. No selling your data. We make money when
you do better, not worse." is a sharp, trust-building wedge in a category (wellness/finance) where
that's rare — and it's already true of the app (privacy policy: nothing collected).

---

## 2. Revenue streams (ranked)

### A. `nada+` subscription — **primary** (launch with this)
The full ritual loop stays free forever (free has to be genuinely good — it's the funnel and the
marketing). `nada+` deepens it.

**Free vs nada+ split:**

| Free | nada+ |
|---|---|
| All 4 rituals, fully playable | Everything in free, plus: |
| Core stats (total saved, streak, cravings, time reclaimed, breaks) | **Deeper insights** — weekly/monthly "you didn't spend" reports, trends, biggest cravings handled, time-of-day patterns |
| ~24 shop products, 5 restaurants, the feed | **Expanded worlds** — more stores/categories, more restaurants, seasonal "drops," more feed variety |
| Light theming | **Customization** — themes (incl. the dark "Premium" skin as a paid perk), app icons, mascot/sticker packs, breathing-pacer + ambient sound packs |
| — | **Goals & milestones** — set a "don't-spend" target, milestone celebrations, shareable "I saved $X with nada" cards |
| — | **Home-screen widgets** ("saved this month") + Apple Health "mindful minutes" sync for breaks |
| — | **"Make it real" controls** (see stream B) |

**Pricing** (anchored to "less than one impulse buy"):
- **$2.99/mo**, **$19.99/yr** (best value, ~44% off → push the annual), **$39.99 lifetime**.
- 7-day free trial on the annual; lifetime as a one-time alternative for subscription-averse users.
- Copy: *"nada+ costs less than the thing you almost bought."*

**Where the paywall lives (conversion mechanics):** never a cold wall on open. Surface `nada+` at
the **moments of peak felt value**, when the user has just experienced the payoff:
- After an intercept: *"You've saved $512 with nada. See where it's going with nada+ →"*
- On a streak/milestone: *"10-day streak. Unlock goals & reports."*
- On the You hub when stats get rich enough to be worth charting.
This converts on earned trust, not friction.

### B. "Make your savings real" — **the differentiated lever** (Phase 2)
Today nada celebrates *fake* savings. The killer feature: let users **turn an intercepted purchase
into a real transfer** — "You didn't spend $149 → move $149 (or $10, or round it) to your savings?"
This is the one upsell that's *more* on-brand the more you use it, and it's where serious revenue lives:
- **Fintech partnership / referral**: integrate (or refer to) a savings/round-up/investing provider
  (high-yield savings, auto-invest). Revenue via **referral bounties** (often $5–$50/funded account)
  and/or **rev-share** on balances.
- **Or** issue-your-own via a Banking-/Investing-as-a-Service partner (bigger lift, bigger margin).
- Framing stays honest: nada doesn't take a cut of *your* money; it earns from the partner for
  sending real savers. This reframes nada from "novelty placebo" to **"the front door to actually
  saving money"** — a much larger TAM and a fundable story.
- Gate the automation/round-up rules behind `nada+`, so it also lifts subscription value.

### C. One-time unlock / "tip jar" — **goodwill capture** (cheap to add, ship early)
Many users of a wholesome indie app will never subscribe but will happily pay once. Offer a small
**"Buy nada a coffee / Founder's unlock"** ($4.99) that grants the cosmetic perks (themes, icons,
sticker packs) permanently. Pure upside; reinforces the indie/anti-corporate vibe.

### D. B2B / licensing — **later, larger** (Phase 3, opportunistic)
The same engine is valuable to people who pay for outcomes:
- **Employers / financial-wellness & EAP vendors** — nada as a perk in benefits packages.
- **Smoking-cessation & addiction/recovery programs**, **debt counseling**, **neobanks/credit unions**
  wanting an engaging "impulse interceptor" — white-label or co-brand.
- Model: per-seat licensing or a flat platform fee. Slower sales cycle, much larger contracts.

### E. Explicitly **rejected** (write it down so it's never "tested")
- Real-product ads or affiliate links to things to *buy* — contradicts the product.
- Selling/sharing user data or analytics — breaks the privacy promise (a core asset).
- Loot-box/gacha dark patterns, fake-scarcity upsells — off-brand and App Store risk.

---

## 3. Why this mix

- **Subscription** = predictable MRR, standard, fast to ship (RevenueCat + StoreKit on Expo).
- **"Make it real"** = the moat + the fundable narrative + uncapped upside, and the only stream that
  scales with engagement *without* asking users to spend on consumption.
- **One-time/tip** = converts the 90% who won't subscribe into some revenue + advocacy.
- **B2B** = the eventual big-contract layer once consumer traction proves the mechanic.

---

## 4. Rough model (illustrative, conservative)

Assume 100k installs in year 1 (achievable for a novel, shareable, press-friendly concept).
- Free→paid conversion **3%** at ~$18 blended annual ARPPU → 3,000 subs ≈ **$54k/yr**.
- Tip/unlock **2%** at $4.99 → **$10k** one-time.
- "Make it real": even **1%** (1,000) funding a partner account at a $25 avg bounty → **$25k**, plus
  trailing rev-share that compounds with balances.
- **≈ $90k year-1**, with the savings-partner line being the one that bends upward over time and in a
  Series-A story. (These are planning anchors, not promises — instrument and revise.)

The point isn't the exact figure; it's that **the subscription pays the bills and the savings loop is
the asymmetric upside.**

---

## 5. Phased rollout

**Phase 0 — instrument (now, pre-revenue).** Add privacy-preserving, on-device-respectful analytics
for the only funnel metrics that matter (rituals/session, intercepts, retention D1/D7/D30, "saved $"
milestones reached). You can't price or place a paywall well blind.

**Phase 1 — ship `nada+` (4–6 wks).** RevenueCat + StoreKit; build the free/paid split above (most of
the paid surface is content/cosmetic/insight work, not new infra); paywall at the peak moments;
annual + lifetime; trial. Validate price with two cohorts.

**Phase 2 — "make it real" (8–12 wks, partner-dependent).** Start with the lowest-lift version: a
referral hand-off to one savings/investing partner triggered from the intercept ("move this $ for
real"). Measure attach rate; deepen to in-app automation behind `nada+` if it lands.

**Phase 3 — B2B pilots (opportunistic).** Once D30 retention + the savings mechanic are proven, pitch
one financial-wellness vendor or credit union for a co-brand pilot.

---

## 6. Implementation notes (so this is buildable, not just slideware)
- **Subscriptions:** `react-native-purchases` (RevenueCat) on Expo — handles StoreKit/Play, entitlements,
  trials, restore. A `usePremium()` gate reads the entitlement; flip paid features on that. Clean fit
  with the existing provider pattern.
- **App Store rules:** digital goods → must use IAP (we are; no outside-payment links). The savings
  partner is a *financial service*, not a digital good — handled via the partner's flow/SDK, not IAP;
  keep that boundary clean to stay compliant.
- **Paywall surfaces** map onto code we already have: the intercept reveals, the You hub, milestone
  moments — all natural insertion points.
- **No new tracking SDKs** — keep analytics first-party/aggregate to preserve the privacy wedge.

---

## 6b. How the inspiration monetizes (it doesn't — and that's the lesson)

The "initial inspiration" is a *category*, not a product: South Korea's "dopamine sites" (fake
delivery, fake carts, virtual smoke breaks). Across the press coverage — Korea Times, SCMP, the LI
Solutions teardown, the viral threads — **no monetization model is reported**; they're described as
**free digital spaces**, indie/novelty stress-relief experiments. One teardown nails *why* free is
load-bearing: *"On a real delivery app, the fee is what makes them stop… Here there's no order to
second-guess, so the hesitation never arrives."* The **absence of money/transaction is the product.**

Two takeaways for nada:
1. **There's no business model to copy** — they went viral without one. Virality ≠ revenue; nada's
   actual edge is *having* a respectful business model where they have none.
2. **Never monetize inside the ritual.** Putting a price, fee, or real-purchase prompt into the
   browse→cart→intercept flow would reintroduce exactly the friction/guilt the inspiration removes.
   This is why the plan monetizes *around* the experience (subscription for depth, turn-savings-real,
   cosmetics) and never *in* it.

## 7. The one-line strategy
> **Free app that helps you not spend; `nada+` for people who want to go deeper; real money for nada
> only when it helps you save real money. No ads, no tracking, no exceptions.**
