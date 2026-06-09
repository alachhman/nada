# nada — Food Delivery Ritual

**Date:** 2026-06-09
**Status:** Approved
**Builds on:** the nada iOS app ([2026-06-08-nada-ios-design.md](2026-06-08-nada-ios-design.md))

## Overview

The second placebo ritual. The user browses restaurants and menus, builds a food order, and
"places" it — then watches a **stylized live courier map** animate a driver heading to them with
status beats. On "arrival," nada **intercepts**: no charge, a celebration of the money saved,
logged to the same You stats. Same emotional payoff as the shopping intercept, new ritual.

Unlocks the "Food delivery" card that's currently a teaser on the You tab.

## Decisions
- **Map:** a **stylized animated map** (custom route + animated courier marker on a soft "streets"
  backdrop via `react-native-svg` + Reanimated). Web-safe (verifies in Expo web preview), no API
  keys, on-brand motion. NOT `react-native-maps`.
- **Scope:** full ritual — restaurants → menu → order builder → courier tracking → intercept → You.

## Reuse (no new savings logic)
- `NadaProvider.intercept(items)` records the save and returns the amount — the food order is shaped
  as `CartItem[]` ({id,name,price,image,qty}) and passed straight in. Savings/streak/saves logic
  (`recordIntercept`) is unchanged; the order shows up in You's totals and recent-saves feed.
- Design tokens (`lib/theme.ts`), `usd()`, `CountUp`, `PillButton`, motion (Reanimated/Moti),
  haptics (web-guarded), `expo-image`. Visual language matches the shopping intercept.

## Information Architecture
Launched from the **You → Rituals → "Food delivery"** card (now active), pushed as a stack over the tabs:

| Screen | Route | Purpose |
|---|---|---|
| Restaurants | `app/food/index.tsx` | List of restaurants (image, cuisine, rating, ETA, delivery fee). |
| Menu + order | `app/food/[id].tsx` | Restaurant header + menu sections; tap items to build the order; sticky "View order (N) · $X" bar. |
| Courier tracking | `app/food/track.tsx` | The stylized animated map: courier marker travels the route to the user pin while status beats progress; on arrival → intercept reveal. |

Order state is local to the food flow (a small `useState`/context within `app/food/`), not the global shopping cart.

## Data
`lib/food.ts`:
```
Restaurant { id, name, cuisine, image, rating, etaMins, deliveryFee, menu: MenuItem[] }
MenuItem   { id, name, price, image, description }
RESTAURANTS: Restaurant[]   // ~5 restaurants, ~6 items each, Unsplash food imagery
getRestaurant(id): Restaurant | undefined
```
Unit-tested like the shop catalog (non-empty, unique ids, positive prices, http images, getRestaurant).

## The courier tracking (the theater)
- A stylized map card/screen: soft cream/sage "city" backdrop with abstract street blocks, a **route
  polyline** (SVG path) from a restaurant pin to the user's home pin, and an animated **courier marker**
  (🛵 / dot) interpolating along the path via Reanimated over ~7s (compressed).
- **Status beats** progress in sync: "Order placed" → "Restaurant is preparing…" → "Courier picked up
  your order" → "On the way" → "Arriving now". An ETA countdown + progress bar.
- On arrival: fire `intercept(order)` (records the save), then a **celebration reveal** reusing the
  CountUp + confetti/glow language (food copy, e.g. "Cravings handled. You saved $X — and you didn't
  even have to tip."), success haptic, and a "Back to nada" button → returns to You (or Shop).

## Testing
- Unit (Vitest): `lib/food.ts` catalog invariants. The courier progression logic, if extracted into a
  pure helper (e.g. status-for-progress), gets a small unit test; otherwise verified visually.
- Manual: full food ritual in Expo web preview, including the map animation and the intercept logging to You.

## MVP Boundary (Done)
- You → "Food delivery" launches the flow.
- Restaurants list → menu → build an order (add/remove/qty) → sticky order bar.
- "Place order" → courier map animates with status beats over ~7s.
- Arrival → intercept reveal ("You saved $X") → recorded to You (totalSaved/streak/saves include the food order).
- Web-safe, typechecks, tests pass, verified in web preview.

## Non-Goals
- No real maps/GPS, no real payment, no restaurant search/filters (could add later), no driver chat.
