# Endless Aisle + Dodge-Metrics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [2026-06-11-endless-aisle-design.md](../specs/2026-06-11-endless-aisle-design.md)
> Steps use checkbox syntax. nada conventions are binding (tokens+StyleSheet, Reveal not
> Moti mounts, no non-worklet calls in worklets, integer prices for usd(), Vitest for pure
> logic, AsyncStorage merge-over-default).

**Goal:** ~5,000 deterministic generated products with three typed dodge-metrics (weight /
work-hours / witty line), surfaced through an endless-aisle grid, category browsing, search,
detail, cart, and the intercept celebration.

**Architecture:** pure generator `lib/catalogGen.ts` (`productAt(index)`, ids `gen-<i>`),
pure helpers `lib/dodge.ts`, required `weightLb`+`dodgeLine` on `Product` (curated 22
migrated by hand), optional `weightLb` on `SaveEntry` (merge-safe), UI layered on existing
shop components. No backend, no storage, no randomness.

**Branch:** `feat/endless-aisle` off master.

---

### Task EA-1: Dodge types + helpers + curated migration (TDD)

**Files:** Modify `lib/types.ts`, `lib/catalog.ts`; Create `lib/dodge.ts`, `lib/__tests__/dodge.test.ts`

- [ ] Branch: `git checkout -b feat/endless-aisle`
- [ ] Write failing tests `lib/__tests__/dodge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { WORK_WAGE, hoursOfWork, formatWeight, cartWeight } from "@/lib/dodge";
import { CATALOG } from "@/lib/catalog";

describe("hoursOfWork", () => {
  it("divides by the honest wage constant, 1 decimal", () => {
    expect(WORK_WAGE).toBe(25);
    expect(hoursOfWork(129)).toBe(5.2);
    expect(hoursOfWork(25)).toBe(1);
    expect(hoursOfWork(0)).toBe(0);
  });
});

describe("formatWeight", () => {
  it("1 decimal under 10, whole at 10+", () => {
    expect(formatWeight(3.2)).toBe("3.2 lb");
    expect(formatWeight(11.4)).toBe("11 lb");
    expect(formatWeight(0.4)).toBe("0.4 lb");
  });
});

describe("cartWeight", () => {
  it("sums weight × qty to 1 decimal", () => {
    const items = [
      { id: "a", qty: 2, product: { weightLb: 1.5 } },
      { id: "b", qty: 1, product: { weightLb: 3.2 } },
    ] as never;
    expect(cartWeight(items)).toBe(6.2);
  });
});

describe("curated catalog migration", () => {
  it("every curated product has weightLb and a non-empty dodgeLine", () => {
    for (const p of CATALOG) {
      expect(p.weightLb).toBeGreaterThan(0);
      expect(p.dodgeLine.length).toBeGreaterThan(5);
    }
  });
});
```

(FIRST read `lib/types.ts` CartItem — if CartItem stores a product reference vs bare id+qty,
adapt `cartWeight`'s signature to the real shape; the test above assumes `{qty, product}`.
If CartItem is `{id, qty}` only, `cartWeight(items, lookup = getProduct)` resolves via catalog.)

- [ ] Run → fail. Implement:
  - `lib/types.ts`: `Product` gains required `weightLb: number; dodgeLine: string;`
  - `lib/dodge.ts`: the four exports (round with `Math.round(x*10)/10`).
  - `lib/catalog.ts`: hand-add plausible `weightLb` + a witty quantified `dodgeLine` to all
    22 products (e.g. sneakers `weightLb: 2.1, dodgeLine: "1 shoebox of floor space, forever"`;
    dumbbells `weightLb: 38, dodgeLine: "38 lb you'd carry exactly twice"`). Keep the lore voice.
- [ ] Gates `npx tsc --noEmit && npm test` (typecheck will also flag any Product literal
  elsewhere missing the new fields — fix all). Commit `feat(aisle): dodge metrics — types, helpers, curated migration`.

### Task EA-2: Procedural generator (TDD)

**Files:** Create `lib/catalogGen.ts`, `lib/__tests__/catalogGen.test.ts`; Modify `lib/catalog.ts` (getProduct routing)

- [ ] Failing tests first:

```ts
import { describe, expect, it } from "vitest";
import { TOTAL_GENERATED, productAt } from "@/lib/catalogGen";
import { getProduct } from "@/lib/catalog";

const CATS = ["Apparel", "Home", "Tech", "Kitchen", "Fitness"];
const BANDS: Record<string, [number, number]> = {
  Apparel: [18, 220], Home: [12, 320], Tech: [15, 450], Kitchen: [9, 260], Fitness: [12, 300],
};
const WEIGHTS: Record<string, [number, number]> = {
  Apparel: [0.2, 4], Home: [0.5, 18], Tech: [0.1, 12], Kitchen: [0.5, 15], Fitness: [0.5, 50],
};

describe("productAt", () => {
  it("is deterministic", () => {
    expect(productAt(7)).toEqual(productAt(7));
    expect(productAt(4321)).toEqual(productAt(4321));
  });
  it("has stable gen ids and round-trips through getProduct", () => {
    expect(productAt(42).id).toBe("gen-42");
    expect(getProduct("gen-42")).toEqual(productAt(42));
    expect(getProduct("gen-abc")).toBeUndefined();
    expect(getProduct("gen-999999999")).toBeDefined(); // any index works
  });
  it("first 1000 names are unique", () => {
    const names = new Set(Array.from({ length: 1000 }, (_, i) => productAt(i).name));
    expect(names.size).toBe(1000);
  });
  it("fields are well-formed across a sample", () => {
    for (let i = 0; i < 5000; i += 23) {
      const p = productAt(i);
      expect(CATS).toContain(p.category);
      const [lo, hi] = BANDS[p.category];
      expect(p.price).toBeGreaterThanOrEqual(lo);
      expect(p.price).toBeLessThanOrEqual(hi);
      expect(Number.isInteger(p.price)).toBe(true);
      const [wlo, whi] = WEIGHTS[p.category];
      expect(p.weightLb).toBeGreaterThanOrEqual(wlo);
      expect(p.weightLb).toBeLessThanOrEqual(whi);
      expect([3.5, 4, 4.5, 5]).toContain(p.rating);
      expect(p.reviewCount).toBeGreaterThanOrEqual(30);
      expect(p.reviewCount).toBeLessThanOrEqual(9000);
      expect(p.reviews.length).toBeGreaterThanOrEqual(1);
      expect(p.dodgeLine.length).toBeGreaterThan(5);
      expect(p.image).toMatch(/^https:\/\/images\.unsplash\.com\//);
    }
  });
  it("TOTAL_GENERATED is 5000", () => expect(TOTAL_GENERATED).toBe(5000));
});
```

- [ ] Implement `lib/catalogGen.ts`:
  - Hash: `function h(seed: number, salt: number): number` — deterministic integer hash
    (e.g. mulberry32 single step), used for every choice. NO Math.random/Date.
  - Per-category part banks (this is bounded creative writing — write them fully):
    - nouns ~20/category, adjectives ~22/category, materials/styles ~10/category →
      20×22×10 = 4,400 combos per category; vary pick order by index so the first 1,000
      global names are unique (test enforces).
    - price band + weight band per category (constants above).
    - dodge-line templates ~6/category with a number slot filled from the hash, e.g.
      Home: `${n} dust-collecting days per year`, Tech: `${n} cable management crises`,
      Apparel: `1 hanger permanently occupied`, Kitchen: `1 cabinet tetris piece`,
      Fitness: `${n} guilt reps you don't owe anyone`.
    - review pools ~10/category — ~3 in the never-arrived lore voice, rest ambient
      realism; sample 1–2 with author names from a small pool.
    - image pools: reuse the existing curated Unsplash photo IDs per category (read
      `lib/catalog.ts`) plus enough additional KNOWN-good generic unbranded Unsplash IDs
      to reach ~12–18 per category. Only use photo IDs that already exist in this repo
      (catalog + `lib/feed.ts` PHOTO_POOLS) — do NOT invent Unsplash IDs.
  - `productAt(index)`: category = `CATS[index % 5]`; all other choices from `h(index, salt)`.
  - `TOTAL_GENERATED = 5000`.
  - `lib/catalog.ts` `getProduct`: `if (id.startsWith("gen-"))` → parse int (NaN-guard) → `productAt`.
- [ ] Gates + commit `feat(aisle): deterministic 5k-product generator`.

### Task EA-3: Savings pipeline (TDD)

**Files:** Modify `lib/types.ts` (SaveEntry), `lib/storage.ts`, `lib/nothing.ts` or `lib/storage.ts` (weightKeptOut), tests in existing storage/nothing test files

- [ ] Failing tests (extend `lib/__tests__/storage.test.ts` — read it first, follow its fixtures):
  - recordIntercept stores `weightLb` = sum(weightLb × qty), 1 decimal.
  - old-shape SaveEntry without weightLb still loads/merges (mirror the itemCount tests).
  - `weightKeptOut(saves)` sums `weightLb ?? 0`.
- [ ] Implement: `SaveEntry.weightLb?: number`; recordIntercept computes via `cartWeight`;
  `weightKeptOut` exported beside `itemsKeptOut`.
- [ ] Gates + commit `feat(aisle): weight through the savings pipeline`.

### Task EA-4: Dodge UI (cards, detail, cart, intercept)

**Files:** Modify `components/shop/ProductCard.tsx`, `app/product/[id].tsx`, `app/(tabs)/cart.tsx`, `components/intercept/InterceptOverlay.tsx`

- [ ] ProductCard: small muted weight chip (`formatWeight(p.weightLb)`) beside price. Match card styles.
- [ ] Product detail: "what you'd be dodging" block under price — three muted lines:
  `⚖ ${formatWeight(weightLb)} of future clutter` · `≈ ${hoursOfWork(price)} hrs of work at $${WORK_WAGE}/hr` · dodgeLine. Tokens + existing detail styles; Reveal if siblings use it.
- [ ] Cart: under the money total row add muted "total clutter: ${formatWeight(cartWeight(items))}".
- [ ] InterceptOverlay: optional `weightLb?: number` prop; the existing itemCount line becomes
  "N things · M lb kept out of your house" when both present (itemCount-only keeps old copy;
  read the file, DON'T touch worklets). Cart passes `cartWeight` captured at checkout
  (capture BEFORE the cart clears, same as amount/itemCount).
- [ ] Gates + web-preview spot-check + commit `feat(aisle): dodge metrics across card, detail, cart, intercept`.

### Task EA-5: Endless aisle + category browsing + search

**Files:** Modify `app/(tabs)/index.tsx`, `app/(tabs)/search.tsx`; Create `app/aisle.tsx` (or extend the existing see-all route — READ `app/(tabs)/index.tsx` first to see where "See all" goes today and follow that pattern)

- [ ] **Endless aisle section** on shop home, below existing rails: header "the endless aisle"
  + sub "5,000 things you don't need", 2-column grid of `productAt` cards, paged ~24 at a
  time via accumulating state + `onEndReached` (pattern-match the scroll feed's pagination:
  `app/scroll/index.tsx` `nextContentIndexRef`). IMPORTANT: the shop home is likely a
  ScrollView — nested FlatLists don't virtualize there. Either (a) convert the home to a
  single FlatList with existing sections as ListHeaderComponent (preferred if home is
  simple), or (b) the aisle section is a "preview grid" of 24 + a "keep browsing →" link
  to the full-screen aisle route. Pick whichever the existing structure makes cleaner —
  state your choice in the report.
- [ ] **Aisle route** (`app/aisle.tsx`, optional `category` param): full-screen paged
  2-col FlatList over generated products (filtered by category when given — page by
  scanning indices `i % 5 === catIndex`). Category chips on shop home / "See all" link here.
- [ ] **Search**: extend the existing search to also scan `productAt(0..1999)` name/category
  includes(query, case-insensitive), cap 50 combined results, curated first. Keep it synchronous.
- [ ] Gates + commit `feat(aisle): endless aisle grid, category browsing, generated search`.

### Task EA-6: Verify + review + merge

- [ ] `npx tsc --noEmit && npm test && npx expo export --platform web`.
- [ ] Web preview e2e: aisle scrolls + paginates smoothly; category filter; search finds a
  generated product; gen product detail shows dodge stack; add gen product to cart →
  clutter row; checkout → "N things · M lb" line; saves feed → nothing-tracker still works
  for a gen-product save (getProduct round-trip).
- [ ] Code-review agent over the branch diff; fix Criticals/Importants; re-run gates.
- [ ] README one-liner. Merge `--no-ff` to master, push, confirm CI green.

## Self-review notes
- Spec §1 → EA-2/EA-5; §2 → EA-1/EA-2; §3 → EA-3; §4 → EA-4/EA-5; §6 → tests embedded per task.
- Type consistency: `weightLb`/`dodgeLine` on Product (required), `weightLb?` on SaveEntry
  (optional), helpers `hoursOfWork/formatWeight/cartWeight/weightKeptOut`, `productAt/TOTAL_GENERATED`.
- Open implementation choices intentionally delegated with decision rules: cartWeight signature
  (depends on CartItem shape), aisle-on-home virtualization strategy, see-all routing reuse.
