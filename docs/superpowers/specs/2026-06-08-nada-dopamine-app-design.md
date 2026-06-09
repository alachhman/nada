# nada — Design Spec

**Date:** 2026-06-08
**Status:** Approved (brainstorming complete)
**Source inspiration:** [NEXTA tweet on South Korean "dopamine websites"](../../context/nexta_tv-2063252892199325983.md)

## Overview

**nada** is a dopamine-placebo web app for the US market. It recreates the *ritual* of
impulse online shopping — browsing, reading reviews, filling a cart, clicking checkout —
and at the exact moment a user would pay, it **intercepts** the purchase and celebrates the
money they did *not* spend.

The user is **in on it** from the start (an "open simulator," not a trick). This makes nada a
repeatable wellness tool — a sanctioned, harm-free outlet for the impulse-buy urge — rather
than a one-time gag.

- **Tagline:** _"you spent nada. nice work."_
- **Tone:** premium consumer app exterior, kind wellness soul, dry sense of humor in the microcopy.
- **Goal:** a real, shippable MVP (not a demo, not an art piece).

## Goals

- Deliver the full dopamine loop of impulse shopping with zero financial consequence.
- Make the *non-purchase* feel like the reward.
- Be repeatable: a returning user keeps coming back to the ritual instead of a real store.
- Look and feel like a genuine, venture-backed consumer app.

## Non-Goals (MVP)

- No user accounts, authentication, or real backend.
- No real payment processing of any kind (the "payment" is theater).
- The other three rituals (food delivery, doomscroll, smoke break) are **non-functional teasers** only.
- No audio/sound design (possible later enhancement).
- No analytics/tracking beyond local state.

## Information Architecture

| Screen | Route | Purpose |
|---|---|---|
| **Dashboard** | `/` | The hub. Hero stat (money saved, USD), streak, intercept count, recent saves feed, ritual entry cards. |
| **The Shop** | `/shop` | Flagship ritual. Browsable catalog grid (categories, prices, ratings). |
| **Product detail** | `/shop/[id]` | Product page with imagery, price, star rating, fake reviews, add-to-cart. |
| **Cart** | `/cart` | Line items, quantities, running total, "Check out" button → intercept flow. |

The three **coming-soon rituals** (Food delivery, Doomscroll, Smoke break) appear as
real-looking but locked cards on the dashboard — establishing the full product vision while
scoping the build to the shopping ritual.

A **theme toggle** switches between:
- **Light — "Calm Wellness":** soft sage + cream, warm, rounded, Headspace-like.
- **Dark — "Premium Dark":** sleek fintech (Robinhood/Apple), savings counter as hero.

## Flagship Ritual: Impulse Shopping

### The loop
Browse → Crave (product detail + reviews) → Cart → Checkout → **Processing theater** → **Intercept** → logged to dashboard.

### Catalog
- ~24 curated products across a few categories (apparel, home, tech, etc.).
- Each product: name, price, category, real-looking image, star rating, review count, a few fake review snippets.
- Static local JSON; no CMS.

### Micro-interactions
- Add to cart, adjust quantity, remove, running total — all the real small satisfactions.

### The intercept (payoff) — "B-flow" with theater
1. User clicks **Check out**.
2. **Processing theater:** "Placing your order…" spinner with fake payment/processing for ~2 seconds (recreates the post-purchase anticipation glow).
3. The processing view **morphs into the intercept celebration:**
   - 🌱 _"Craving handled."_
   - **"You saved $203"** (the cart total), large.
   - Reassuring copy: you got the hunt, the pick, the click — and kept the money.
   - Dashboard stats (month saved, streak) shown with a satisfying count-up animation.
4. Cart clears. CTAs: **Back to dashboard** / **Browse again**.

## Data & State Model

All client-side in `localStorage`. No backend, no accounts.

```
nada_state = {
  totalSaved: number,        // cumulative USD intercepted
  interceptCount: number,    // number of successful intercepts
  streak: number,            // consecutive active days
  lastActiveDate: string,    // ISO date, for streak computation
  saves: Array<{             // history feed
    items: string[],         // product names in the intercepted cart
    amount: number,          // USD saved in this intercept
    timestamp: number
  }>,
  theme: 'light' | 'dark'
}
```

- Cart state is session/in-memory (or localStorage) until intercept; on intercept it is
  written into `saves[]` and aggregated into `totalSaved` / `interceptCount`, then cleared.
- Streak logic: increment if `lastActiveDate` was yesterday, reset if older, no-op if today.
- A single `storage` module is the source of truth (load / save / reset / record-intercept).
  The dashboard reads it; the intercept flow writes to it. Intercept aggregation logic lives
  here, isolated from UI, so it can be unit-tested.

## Tech & Structure

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion. Client-only. Deploy to Vercel.

```
app/
  layout.tsx            # theme provider, fonts, shell
  page.tsx              # dashboard
  shop/page.tsx         # catalog grid
  shop/[id]/page.tsx    # product detail
  cart/page.tsx         # cart + checkout entry
lib/
  storage.ts            # localStorage state + intercept aggregation (unit-tested)
  catalog.ts            # static product data
  format.ts            # USD formatting, date/streak helpers
components/
  dashboard/            # hero stat, streak, saves feed, ritual cards
  shop/                 # product card, review block
  cart/                 # cart line items, totals
  intercept/            # processing-theater → intercept celebration overlay
  theme/                # theme toggle + provider
```

### Design principles
- Each unit single-purpose, communicates through clear props/interfaces, independently testable.
- Intercept/streak/savings logic kept out of components so it can be tested without rendering.
- Two themes implemented via CSS variables / Tailwind theme tokens, toggled at the root.

## Testing Strategy

- **Unit:** `storage.ts` — intercept aggregation, streak increment/reset/no-op, reset.
- **Unit:** `format.ts` — USD formatting, date math.
- **Component:** cart totals, intercept overlay state transition (processing → reveal).
- Manual verification of the full ritual loop in both themes.

## MVP Boundary (Definition of Done)

- Dashboard renders live stats from `localStorage`.
- Shopping ritual fully playable: browse → product → cart → checkout → 2s processing theater → intercept celebration → stats update.
- Light/dark themes both work and persist.
- Three coming-soon ritual cards present (non-functional).
- Deployable to Vercel as a static client app.

## Future Enhancements (out of scope)

- Build out the other three rituals (food delivery + live courier map, doomscroll feed, virtual smoke break + chat).
- Sound design.
- Optional accounts / cross-device sync.
- Shareable "I saved $X this month" cards for social.
