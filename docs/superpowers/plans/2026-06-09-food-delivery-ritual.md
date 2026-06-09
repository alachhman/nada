# Food Delivery Ritual — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Reuses the established nada iOS patterns (StyleSheet + `lib/theme.ts` tokens, Reanimated/Moti, web-guarded haptics, `expo-image`, `NadaProvider.intercept`). Verified via Expo web preview.

**Goal:** A polished food-delivery placebo ritual — restaurants → menu → order → stylized live courier map → intercept ("You saved $X") logged to the You hub.

**Architecture:** A pushed `app/food/` stack launched from the You "Food delivery" ritual card. Static restaurant/menu data in `lib/food.ts`. A flow-scoped `FoodOrderProvider` holds the order. The courier screen animates an SVG route + marker with status beats, then calls `useNada().intercept(order)` and shows a celebration reveal reusing `CountUp` + confetti.

**Tech additions:** `react-native-svg` (Expo-installed; web-safe) for the route/marker.

## File structure
```
lib/food.ts                         # Restaurant/MenuItem types + RESTAURANTS + getRestaurant  [tested]
components/providers/FoodOrderProvider.tsx  # order context (items/total/add/remove/setQty/clear/restaurant)
app/food/_layout.tsx                # Stack + FoodOrderProvider
app/food/index.tsx                  # restaurants list
app/food/[id].tsx                   # menu + order builder + sticky order bar
app/food/track.tsx                  # courier map + status beats + arrival intercept reveal
components/food/RestaurantCard.tsx
components/food/MenuItemRow.tsx
components/food/CourierMap.tsx       # stylized SVG map + animated marker
components/food/CelebrationReveal.tsx # shared reveal (emblem + confetti + CountUp + copy + button)
```

---

## Milestone FD-A — Data, deps, entry point, flow scaffold

- [ ] **A1.** `npx expo install react-native-svg`.
- [ ] **A2.** `lib/food.ts` — `Restaurant { id, name, cuisine, image (https), rating (1-5), etaMins, deliveryFee, menu: MenuItem[] }`, `MenuItem { id, name, price, image (https), description }`. ~5 restaurants (e.g. burgers, sushi, pizza, tacos, salads), ~6 items each, Unsplash food URLs (same `img()` helper pattern as `lib/catalog.ts`). `getRestaurant(id)`. Add `next.config`-style image host: not needed (Expo image has no remote allowlist).
- [ ] **A3.** `lib/food.test.ts` (Vitest, node): ≥4 restaurants; every restaurant + menu item has unique id within scope, positive prices, http images; every restaurant has ≥3 menu items; `getRestaurant` hits/misses.
- [ ] **A4.** `components/providers/FoodOrderProvider.tsx` — context `{ restaurant: Restaurant|null, items: CartItem[], total, setRestaurant, add(MenuItem), remove(id), setQty(id,qty), clear }`. `add` shapes a `MenuItem` into `CartItem` ({id,name,price,image,qty}); bumps qty; `setQty<=0` removes. `total = sum(price*qty)`. (In-memory only; no persistence needed.) `useFoodOrder()` throws outside provider.
- [ ] **A5.** `app/food/_layout.tsx` — a `Stack` (headerShown false) wrapped in `FoodOrderProvider`. Register `index`, `[id]`, `track`.
- [ ] **A6.** Placeholder `app/food/index.tsx`, `app/food/[id].tsx`, `app/food/track.tsx` (SafeAreaView + title) so routes compile.
- [ ] **A7.** Unlock entry: in `app/(tabs)/you.tsx`, make the "Food delivery" ritual card active (remove its lock/Soon styling for that one card) and `onPress` → `router.push('/food')`. Leave Doomscroll/Smoke break as locked teasers.
- [ ] **A8.** `npm test` (food tests pass) + `npm run typecheck` + `npx expo export --platform web`. Commit: `feat(food): data, order provider, flow scaffold, entry point`.

---

## Milestone FD-B — Restaurants list + menu + order builder

- [ ] **B1.** `components/food/RestaurantCard.tsx` — rounded surface card: `expo-image` banner, name, cuisine, `★ rating`, "· {etaMins} min · {usd(deliveryFee)} delivery" meta. Press → `router.push('/food/'+id)`, spring press + light haptic (web-guarded).
- [ ] **B2.** `app/food/index.tsx` — SafeAreaView (cream), back button (chevron → `router.back()`), header "Order in", scrollable list of `RestaurantCard` over `RESTAURANTS`. Moti stagger entrance. Clears the order on mount (fresh flow).
- [ ] **B3.** `components/food/MenuItemRow.tsx` — row: thumb (`expo-image`), name + description (muted, truncated) + `usd(price)`; a qty stepper / "Add" button bound to `useFoodOrder()`. Shows current qty if in order.
- [ ] **B4.** `app/food/[id].tsx` — `getRestaurant(id)`; on mount `setRestaurant(r)`. Header (banner image, name, cuisine, rating/eta). Menu list of `MenuItemRow`. A sticky bottom **order bar**: "View order · {count} items · {usd(total)}" → `router.push('/food/track')` (only enabled when count>0). Back button. Missing restaurant → friendly empty + back.
- [ ] **B5.** typecheck + web export + commit: `feat(food): restaurants list + menu + order builder`.

---

## Milestone FD-C — Courier map + arrival intercept

- [ ] **C1.** `components/food/CourierMap.tsx` — a stylized map (no real tiles): a soft backdrop with abstract street/block shapes; an SVG (`react-native-svg`) **route path** (a gentle curve) from a restaurant pin (top) to a home pin (bottom); an animated **courier marker** (🛵 or a dot in a pill) that interpolates ALONG the path as a `progress` shared value 0→1 (compute point along the path; a simple multi-point polyline with Reanimated interpolation is fine). Props: `{ progress }` (0..1 Reanimated shared value or number). Web-safe.
- [ ] **C2.** `components/food/CelebrationReveal.tsx` — extract the reveal language (emblem 🌱 spring-in + glow + confetti burst + `CountUp` + headline + body + a `PillButton`). Props: `{ amount, title, body, buttonLabel, onClose }`. Reuse the confetti/CountUp approach from `InterceptOverlay` (you may import shared bits or re-create the small confetti; keep it web-safe). (Optional: refactor `InterceptOverlay` to use this — only if low-risk; otherwise leave InterceptOverlay as-is and just build CelebrationReveal for food.)
- [ ] **C3.** `app/food/track.tsx` — drives the ritual:
  - On mount, capture the order from `useFoodOrder()` (items + total). If empty, redirect back.
  - Animate a `progress` value 0→1 over ~7s (Reanimated `withTiming`); render `CourierMap progress=...`.
  - **Status beats** synced to progress thresholds: e.g. [0,.15)="Order placed", [.15,.4)="Restaurant is preparing your food", [.4,.6)="Courier picked up your order", [.6,.92)="On the way to you", [.92,1)="Arriving now". Show the active status + an ETA countdown (etaMins→0) + a thin progress bar. (Extract `statusForProgress(p): string` as a pure function and unit-test it.)
  - On progress complete: call `const saved = intercept(orderItems)` (NadaProvider) — capture BEFORE clearing the order — then `clear()` the food order, then show `CelebrationReveal amount={saved}` with food copy ("Cravings handled.", "You wanted it, you tracked it, you kept the cash. No tip required."). `onClose` → `router.dismissAll()` then navigate to You (or `router.replace('/(tabs)/you')`).
  - Success haptic on reveal (web-guarded).
- [ ] **C4.** `lib/food.ts` (or a `lib/courier.ts`) export `statusForProgress(p)` + `lib/courier.test.ts` unit test (boundaries). 
- [ ] **C5.** typecheck + tests + web export + commit: `feat(food): courier map + status beats + arrival intercept`.

---

## Milestone FD-D — Verify + finish
- [ ] **D1.** `npm test` (all pass incl. food + courier), `npm run typecheck` clean, `npx expo export --platform web` succeeds.
- [ ] **D2.** Manual: controller verifies the full food ritual in Expo web preview (You → Food delivery → restaurant → add items → View order → courier map animates with status beats → intercept reveal → You totals include the food order).
- [ ] **D3.** Update `README.md` "How it works" to mention the food ritual + `lib/food.ts`. Commit: `docs: note food delivery ritual`.

## Self-review notes
- Reuses `intercept` → food orders log to the same You stats (totalSaved/streak/saves). No change to the savings reducer.
- Capture `saved` before clearing the order (same load-bearing ordering as the shopping cart).
- `react-native-svg` works on RN web — keep the map web-safe (no native-only APIs); verify via web export.
- Order state is flow-scoped (FoodOrderProvider), separate from the shopping CartProvider.
