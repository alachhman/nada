# nada (iOS) — Design Spec

**Date:** 2026-06-08
**Status:** Approved (re-brainstorm after web MVP)
**Supersedes:** the web MVP ([2026-06-08-nada-dopamine-app-design.md](2026-06-08-nada-dopamine-app-design.md)), which remains on branch `build/nada-mvp`.
**Inspiration:** [design-inspiration.md](../../context/design-inspiration.md) · concept origin [nexta_tv tweet](../../context/nexta_tv-2063252892199325983.md)

## Overview

**nada** is a native **iOS** dopamine-placebo shopping app. It looks and behaves like a real
marketplace you'd actually shop in (Amazon-density content: search, categories, deals, ratings,
"Buy now"), wearing a **clean, warm, premium skin with award-calibre motion**. The user runs the
full impulse loop — browse → cart → checkout — and at payment nada **intercepts** and celebrates
the money they did *not* spend. The user is in on it (open simulator); it's a repeatable, harm-free
outlet for the impulse-buy urge.

- **Tagline:** _"you spent nada. nice work."_
- **Platform:** iOS (Expo / React Native). Verified via Expo web preview (no full Xcode/simulator in this env).
- **Goal:** a real, shippable, deeply-polished core loop.

## Goals / Non-Goals

**Goals**
- A believable, beautiful marketplace that feels native to iOS.
- The intercept is the app's signature "magic moment" — animated, haptic, delightful.
- Reuse the proven, framework-agnostic logic from the web MVP (reducer, streak, types, catalog).

**Non-Goals (this build)**
- No accounts / backend (state in AsyncStorage).
- No onboarding flow yet.
- No real payments (the "payment" is theater).
- Other rituals (food delivery, doomscroll, smoke break) are out of scope here (may appear as teasers on the You tab, non-functional).

## Tech Stack

- **Expo** (managed) + **Expo Router** (file-based routing, native bottom tabs)
- **React Native** + **TypeScript**
- **NativeWind** (Tailwind for RN) for styling with design tokens
- **react-native-reanimated** + **moti** for motion; **react-native-gesture-handler**
- **expo-haptics** for tactile feedback; **@react-native-async-storage/async-storage** for persistence
- **Vitest** for unit tests of the pure logic
- Verification: `npx expo start --web` preview

## Design System

Derived from the inspiration (littleBite craft + Capy warmth + Apple-Design-Award polish).

- **Palette (light, primary):** bg cream `#F7F4EE`; surface `#FFFFFF`/`#FFFDF8`; ink `#2C2A26`; muted `#8A8475`; hairline `#ECE6D8`; accent (CTA) espresso/near-black `#1F1D1A`; positive/savings sage `#5A7D5A`; soft pastel accents peach `#F6C9A8`, butter `#F4E0A3`, sage `#CFE0C4`, lilac `#D8CDE:` (use sparingly for badges/chips).
- **"Magic moment" surface:** near-black `#0D0F12` with sage/emerald glow for the intercept.
- **Type:** bold rounded headlines (large, tight), generous spacing, quiet secondary text.
- **Shape/depth:** large radii (16–28), soft layered shadows, product imagery that feels liftable.
- **Motion:** spring physics (Reanimated), count-ups, badge/sticker pops, scan/glow reveals, sheet transitions, list stagger. Haptics on add-to-cart, checkout, and the intercept reveal. Respect reduce-motion.

## Information Architecture (native bottom tab bar)

| Tab | Route | Purpose |
|---|---|---|
| **Shop** | `app/(tabs)/index.tsx` | Home/store. Search entry, category chips, hero deal carousel, product sections/grids. |
| **Search** | `app/(tabs)/search.tsx` | Full search over the catalog with live filtering + category filter. |
| **Cart** | `app/(tabs)/cart.tsx` | Line items, qty steppers, total, "Check out" → intercept. |
| **You** | `app/(tabs)/you.tsx` | Savings hub: animated total saved, streak, recent saves (the wellness soul). |
| **Product** | `app/product/[id].tsx` | Detail: image gallery, price, rating, reviews, sticky Add/Buy bar. |

The **Intercept** is a full-screen modal/overlay presented over the Cart on checkout.

## Flagship Ritual

Browse (Shop/Search) → Product → Add to cart / Buy now (haptic) → Cart → **Check out** →
**processing theater** (~2s: "Placing your order…", spinner) → **intercept reveal** (spring + confetti/glow,
haptic notification): "You saved $X · Craving handled" → records to state → **You** tab updates.

## Data & State (client-only, AsyncStorage)

Ported from the web MVP; persistence becomes async.

```
NadaState { totalSaved, interceptCount, streak, lastActiveDate, saves: SaveEntry[] }
SaveEntry { items: string[], amount, timestamp }
Product / CartItem / Review  (unchanged shape)
```

- **Pure reducer** `recordIntercept(state, cart, today, nowMs?)` — ported verbatim from web MVP (savings + streak + capped-50 saves). Unit-tested.
- **Persistence** `loadState()/saveState()/resetState()` — rewritten for AsyncStorage (async). Storage key `nada_state_v1`. Cart persisted under `nada_cart_v1`.
- **Providers:** `CartProvider` (items/total/add/remove/setQty/clear, async-persisted, skip-first-save guard) and `NadaProvider` (state/hydrated/intercept→amount/reset, async hydrate, persist-after-hydration). `intercept` returns the saved amount synchronously (computed from cart) for the overlay.

## Architecture / File Structure

```
app/
  _layout.tsx                # root: providers, gesture-handler root, fonts
  (tabs)/_layout.tsx         # bottom tab navigator (Shop/Search/Cart/You)
  (tabs)/index.tsx           # Shop home
  (tabs)/search.tsx          # Search
  (tabs)/cart.tsx            # Cart (hosts Intercept overlay)
  (tabs)/you.tsx             # Savings hub
  product/[id].tsx           # Product detail
lib/
  format.ts                  # usd, isoDay, isSameDay, isYesterday  [ported, unit-tested]
  types.ts                   # shared types + INITIAL_STATE          [ported]
  storage.ts                 # recordIntercept reducer + AsyncStorage I/O  [reducer ported, I/O new]
  catalog.ts                 # static catalog (image URLs)            [ported]
  theme.ts                   # design tokens (colors, radii, spacing, shadows)
components/
  providers/CartProvider.tsx
  providers/NadaProvider.tsx
  shop/SearchBar.tsx
  shop/CategoryChips.tsx
  shop/DealCarousel.tsx
  shop/ProductCard.tsx
  shop/RatingStars.tsx
  product/ReviewBlock.tsx
  product/BuyBar.tsx         # sticky Add to cart / Buy now (haptics)
  cart/CartLine.tsx
  intercept/InterceptOverlay.tsx   # processing theater → spring/confetti/glow reveal  [tested]
  you/HeroStat.tsx           # animated count-up of total saved
  you/StatPills.tsx
  you/SavesFeed.tsx
  ui/CountUp.tsx             # Reanimated count-up
  ui/PillButton.tsx
test/  (vitest for lib/*)
```

Principles: pure logic isolated from UI and unit-tested; each component single-purpose; motion centralised in small reusable primitives; tokens in `lib/theme.ts`.

## Testing

- Unit (Vitest): `format.ts`; `storage.ts` reducer (savings/streak/cap); persistence with an AsyncStorage mock; intercept-overlay phase transition (RTL for RN or a logic-extracted hook).
- Manual: full ritual in Expo web preview, both feel and the intercept moment.

## MVP Boundary (Definition of Done)

- Bottom-tab app runs (Expo web preview): Shop, Search, Cart, You.
- Shop looks like a real store (search, categories, deal carousel, product grids with ratings/badges).
- Product detail with gallery, reviews, sticky Buy bar (haptics).
- Cart with qty steppers + total.
- Checkout → processing theater → animated intercept reveal (spring/confetti/glow + haptics) → records save.
- You tab shows animated total saved, streak, recent saves; persists across app restart (AsyncStorage).
- Motion + haptics present throughout; reduce-motion respected.
- Typechecks, unit tests pass, runs in Expo web preview.

## Future

- iOS Simulator/TestFlight build (needs full Xcode), onboarding flow, the other three rituals, sound design, shareable savings cards.
