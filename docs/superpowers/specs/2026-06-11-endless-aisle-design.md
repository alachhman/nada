# Endless Aisle + Dodge-Metrics — Design

> Research-informed by the Korean fake-delivery app's listing UI (creator screenshots,
> 2026-06-11 field trip — see conversation context): every menu item carries a second
> "cost" (🔥 kcal) and the fake-checkout celebrates it ("you saved 1,800 kcal!").
> nada's analog, approved by the user: **all three dodge metrics, dynamic per product
> type, plus a catalog of thousands of browsable products.**

## Goals

1. **Thousands of products** (~5,000+) browsable via an infinitely-scrolling "endless
   aisle", category grids, and search — with zero storage cost and stable identity.
2. **Dodge-metrics on every product** — quantified things you dodge by not buying:
   - **Weight** (summable backbone): realistic per-product shipping weight in lb.
   - **Hours of your life**: `price ÷ $25/hr`, computed at render, honestly labeled.
   - **Witty dodge line**: category-templated quantified gag.
3. Two-currency intercept payoff: "$X saved · N lb of stuff kept out of your house."

## Non-goals

- Illustrated product art (separate future effort; images stay Unsplash).
- Per-user wage settings (constant $25/hr with honest label; revisit later).
- Backend/search-index anything — all client-side and deterministic.

## 1. Procedural catalog — `lib/catalogGen.ts`

- **`productAt(index: number): Product`** — pure, deterministic (same index → same
  product forever). Seeded arithmetic from the index only (mulberry-style hash is fine;
  NO Math.random).
- Composition per category from part banks: adjective × material/style × noun, e.g.
  Apparel("Heavyweight" × "Linen" × "Overshirt"), Home("Walnut" × "Arc" × "Floor Lamp").
  Part banks sized so 5 categories × combinations ≥ 5,000 distinct names before repeats;
  name collisions across the space are acceptable beyond the first ~5,000 but adjacent
  indices must never collide.
- Fields generated: `id: "gen-<index>"`, name, category (cycled through the 5 real
  categories: Apparel/Home/Tech/Kitchen/Fitness), price (category-banded, integer —
  the `usd()` whole-dollar rule), rating (3.5–5 in .5 steps), reviewCount (30–9,000,
  skewed low), image (per-category Unsplash pool, ~15–20 vetted unbranded IDs each,
  cycled by index), 1–2 reviews sampled from per-category pools (~25% in the
  never-arrived lore voice, rest ambient realism), and the dodge block (below).
- **`TOTAL_GENERATED = 5000`** exported constant (UI paginates within it; generator
  itself works for any index).
- `getProduct(id)` (existing, `lib/catalog.ts`) extended: `gen-` prefix → parse index →
  `productAt`. Curated lookups unchanged. Unknown → undefined.
- The 22 curated products remain the "featured" tier on the shop home rails.

## 2. Dodge-metrics — types + data

- `Product` (lib/types.ts) gains **required** `weightLb: number` and `dodgeLine: string`
  (curated items get hand-written values; generator emits both). Required keeps UI
  simple — this is a compile-time-enforced migration of the 22 curated items.
- Weight: category-banded realism (Apparel 0.4–4 lb, Home 1–18 lb, Tech 0.2–12 lb,
  Kitchen 1–15 lb, Fitness 1–50 lb), one decimal.
- **`lib/dodge.ts`** (pure, tested):
  - `WORK_WAGE = 25` and `hoursOfWork(price): number` (1 decimal).
  - `formatWeight(lb): string` ("3.2 lb", "11 lb" when ≥10 — 0 decimals).
  - `cartWeight(items: CartItem[]): number` (sum weightLb × qty; items whose product
    lacks weight — impossible after migration — contribute 0).
  - Dodge-line generation lives in catalogGen's part banks (category-templated, e.g.
    Home: "N dust-collecting days per year", Apparel: "1 hanger permanently occupied",
    Tech: "N cable management crises", Kitchen: "1 cabinet tetris piece", Fitness:
    "N guilt reps you don't owe anyone").

## 3. Savings pipeline

- `SaveEntry` gains optional `weightLb?: number` (back-compat: old entries lack it,
  same pattern as `itemCount`).
- `recordIntercept` also records the cart's summed weight (1 decimal).
- `itemsKeptOut`-style helper `weightKeptOut(saves): number` for You-hub/nothing-tracker
  totals (entries without weight contribute 0).

## 4. UI surfaces

- **Shop home**: new "endless aisle" section below the existing rails — 2-column grid
  of generated products, FlatList `onEndReached` pagination (page ~24), header copy
  "5,000 things you don't need". Existing curated rails untouched.
- **Category browsing**: the category chips / "See all" surfaces page through generated
  products of that category (plus curated members first). Implementation follows the
  existing routing pattern (extend the existing see-all/category screen if present,
  else add `app/shop/aisle.tsx` with a `category` param).
- **ProductCard**: adds a small muted weight chip ("3.2 lb"). No layout rework.
- **Product detail**: dodge stack under the price — weight line, "≈ N hrs of work at
  $25/hr", witty dodge line. Calm, muted, one block.
- **Cart**: subtotal row "total clutter: N lb" under the money total.
- **InterceptOverlay**: the existing items-kept-out line becomes two-currency:
  "N things · M lb kept out of your house" (new optional `weightLb` prop, same
  plumbing as `itemCount`; absent → old copy unchanged).
- **Search**: scans curated + the first 2,000 generated products by case-insensitive
  name/category match, capped at 50 results (generation at search time is cheap and
  synchronous; 2,000 keeps it instant).

## 5. Error handling / constraints

- Generator is pure logic — no I/O, no Date.now/Math.random (determinism + testability).
- Images: pools are finite; distant products may share photos — accepted tradeoff
  (same approach as the feed's PHOTO_POOLS).
- Performance: FlatList with stable keys (`gen-<i>`), `getItemLayout` optional;
  generation is O(1) per item — no precomputed 5,000-item array held in memory beyond
  what the list renders (use paged accumulation like the scroll feed).
- All Reanimated gotchas apply: no generator/format calls inside worklets.

## 6. Testing

- Vitest, TDD: determinism (`productAt(7)` twice → deep-equal), id round-trip
  (`getProduct("gen-7")`), name uniqueness across first 1,000 indices, price/weight
  inside category bands for a 200-index sample, integer prices, rating/reviewCount
  ranges, dodge fields present + dodgeLine non-empty, image URL from the right category
  pool, `hoursOfWork`/`formatWeight`/`cartWeight` exact cases, `recordIntercept`
  weight summing incl. qty>1 + old-shape merge safety, `weightKeptOut` mixed entries.
- Web preview: endless aisle scrolls and paginates; category grid; search hits
  generated items; detail dodge stack; cart clutter row; intercept two-currency line.
