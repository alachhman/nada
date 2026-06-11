import { describe, expect, it } from "vitest";
import { AISLE_CATS, aisleIndicesFor, PAGE_SIZE } from "@/lib/catalogAisle";
import { TOTAL_GENERATED } from "@/lib/catalogGen";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All indices for a category (unfiltered pass undefined, filtered pass name). */
function allIndices(catName: string | undefined): number[] {
  const out: number[] = [];
  for (let page = 0; ; page++) {
    const chunk = aisleIndicesFor(catName, page);
    if (chunk.length === 0) break;
    out.push(...chunk);
    // Safety: never loop more than total/PAGE_SIZE + 2 times
    if (page > Math.ceil(TOTAL_GENERATED / PAGE_SIZE) + 2) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Unfiltered (no category)
// ---------------------------------------------------------------------------

describe("aisleIndicesFor — unfiltered", () => {
  it("page 0 returns indices 0..23", () => {
    const p0 = aisleIndicesFor(undefined, 0);
    expect(p0).toHaveLength(PAGE_SIZE);
    expect(p0[0]).toBe(0);
    expect(p0[PAGE_SIZE - 1]).toBe(PAGE_SIZE - 1);
  });

  it("page 1 returns indices 24..47", () => {
    const p1 = aisleIndicesFor(undefined, 1);
    expect(p1).toHaveLength(PAGE_SIZE);
    expect(p1[0]).toBe(PAGE_SIZE);
    expect(p1[PAGE_SIZE - 1]).toBe(PAGE_SIZE * 2 - 1);
  });

  it("page 0 and page 1 are disjoint", () => {
    const p0 = new Set(aisleIndicesFor(undefined, 0));
    const p1 = aisleIndicesFor(undefined, 1);
    expect(p1.every((i) => !p0.has(i))).toBe(true);
  });

  it("page 0 and page 1 are contiguous (p0 max + 1 === p1 min)", () => {
    const p0 = aisleIndicesFor(undefined, 0);
    const p1 = aisleIndicesFor(undefined, 1);
    expect(p0[p0.length - 1] + 1).toBe(p1[0]);
  });

  it("all returned indices are < TOTAL_GENERATED", () => {
    // Spot check several pages across the full range
    for (const page of [0, 1, 50, 100, 207, 208]) {
      const indices = aisleIndicesFor(undefined, page);
      for (const idx of indices) {
        expect(idx).toBeLessThan(TOTAL_GENERATED);
      }
    }
  });

  it("returns [] for page >= ceil(TOTAL_GENERATED / PAGE_SIZE)", () => {
    const lastFullPage = Math.ceil(TOTAL_GENERATED / PAGE_SIZE);
    expect(aisleIndicesFor(undefined, lastFullPage)).toEqual([]);
    expect(aisleIndicesFor(undefined, lastFullPage + 5)).toEqual([]);
  });

  it("walking all pages covers all 5000 indices exactly once", () => {
    const all = allIndices(undefined);
    expect(all).toHaveLength(TOTAL_GENERATED);
    expect(new Set(all).size).toBe(TOTAL_GENERATED);
    expect(Math.min(...all)).toBe(0);
    expect(Math.max(...all)).toBe(TOTAL_GENERATED - 1);
  });
});

// ---------------------------------------------------------------------------
// Filtered (by category)
// ---------------------------------------------------------------------------

describe("aisleIndicesFor — filtered", () => {
  for (const cat of AISLE_CATS) {
    const catIndex = AISLE_CATS.indexOf(cat);
    const catTotal = TOTAL_GENERATED / 5; // 1000 per category

    it(`${cat}: every returned index satisfies index % 5 === ${catIndex}`, () => {
      const p0 = aisleIndicesFor(cat, 0);
      const p1 = aisleIndicesFor(cat, 1);
      for (const idx of [...p0, ...p1]) {
        expect(idx % 5).toBe(catIndex);
      }
    });

    it(`${cat}: page 0 and page 1 are disjoint`, () => {
      const p0 = new Set(aisleIndicesFor(cat, 0));
      const p1 = aisleIndicesFor(cat, 1);
      expect(p1.every((i) => !p0.has(i))).toBe(true);
    });

    it(`${cat}: page 0 and page 1 are contiguous within the category stride`, () => {
      const p0 = aisleIndicesFor(cat, 0);
      const p1 = aisleIndicesFor(cat, 1);
      expect(p0).toHaveLength(PAGE_SIZE);
      expect(p1).toHaveLength(PAGE_SIZE);
      // Contiguous in category-space: last of p0 + 5 === first of p1
      expect(p0[p0.length - 1] + 5).toBe(p1[0]);
    });

    it(`${cat}: all returned indices are < TOTAL_GENERATED`, () => {
      const p0 = aisleIndicesFor(cat, 0);
      const p1 = aisleIndicesFor(cat, 1);
      for (const idx of [...p0, ...p1]) {
        expect(idx).toBeLessThan(TOTAL_GENERATED);
      }
    });

    it(`${cat}: returns [] for page >= ceil(${catTotal} / PAGE_SIZE)`, () => {
      const lastPage = Math.ceil(catTotal / PAGE_SIZE);
      expect(aisleIndicesFor(cat, lastPage)).toEqual([]);
      expect(aisleIndicesFor(cat, lastPage + 3)).toEqual([]);
    });

    it(`${cat}: walking all pages covers exactly ${catTotal} indices`, () => {
      const all = allIndices(cat);
      expect(all).toHaveLength(catTotal);
      expect(new Set(all).size).toBe(catTotal);
      expect(all.every((i) => i % 5 === catIndex)).toBe(true);
      expect(all.every((i) => i < TOTAL_GENERATED)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("aisleIndicesFor — edge cases", () => {
  it("unknown category name behaves as unfiltered", () => {
    // AISLE_CATS.indexOf returns -1, so it falls through to sequential mode
    const result = aisleIndicesFor("NotACategory", 0);
    expect(result).toEqual(aisleIndicesFor(undefined, 0));
  });

  it("PAGE_SIZE is 24", () => {
    expect(PAGE_SIZE).toBe(24);
  });
});
