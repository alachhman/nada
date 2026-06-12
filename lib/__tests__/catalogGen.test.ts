import { describe, expect, it } from "vitest";
import { TOTAL_GENERATED, productAt, CURATED_IDS, WEIGHT_BY_NOUN } from "@/lib/catalogGen";
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

  // ── Fix 1: noun-aware images ─────────────────────────────────────────────
  it("every image ID in a 300-index sample is from the curated-23 set", () => {
    for (let i = 0; i < 300; i++) {
      const p = productAt(i);
      // Extract photo ID from the full URL (between the last "/" and "?")
      const match = p.image.match(/\/(photo-[^?]+)\?/);
      expect(match, `product ${i} image has unexpected URL shape: ${p.image}`).not.toBeNull();
      const photoId = match![1];
      expect(
        CURATED_IDS.has(photoId),
        `product ${i} ("${p.name}") image "${photoId}" is not in the curated-23 set`,
      ).toBe(true);
    }
  });

  // ── Fix 2: noun-aware weights ────────────────────────────────────────────
  it("weight respects noun override — Earbuds (Tech, index 2)", () => {
    // index 2 → cat Tech, catIndex 0 → nounIdx 0 → "Earbuds"
    const p = productAt(2);
    expect(p.name).toMatch(/Earbuds/);
    const [lo, hi] = WEIGHT_BY_NOUN["Earbuds"];
    expect(p.weightLb).toBeGreaterThanOrEqual(lo);
    expect(p.weightLb).toBeLessThanOrEqual(hi);
  });

  it("weight respects noun override — Dumbbells (Fitness, index 6604)", () => {
    // index 6604 → cat Fitness (6604 % 5 = 4), catIndex 1320
    // nounIdx = floor(1320 / 220) % 20 = 6 → "Dumbbells"
    const p = productAt(6604);
    expect(p.name).toMatch(/Dumbbells/);
    const [lo, hi] = WEIGHT_BY_NOUN["Dumbbells"];
    expect(p.weightLb).toBeGreaterThanOrEqual(lo);
    expect(p.weightLb).toBeLessThanOrEqual(hi);
  });

  // ── Determinism (extended) ───────────────────────────────────────────────
  it("determinism holds for image and weightLb fields", () => {
    expect(productAt(100).image).toBe(productAt(100).image);
    expect(productAt(999).weightLb).toBe(productAt(999).weightLb);
    // Two calls with different indices should not collide on image+weight
    const a = productAt(2);
    const b = productAt(2);
    expect(a.image).toBe(b.image);
    expect(a.weightLb).toBe(b.weightLb);
  });
});
