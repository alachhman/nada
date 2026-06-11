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
