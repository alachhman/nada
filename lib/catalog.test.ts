import { describe, it, expect } from "vitest";
import { CATALOG, getProduct } from "@/lib/catalog";

describe("catalog", () => {
  it("has at least 18 products", () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(18);
  });
  it("every product has a unique id", () => {
    const ids = new Set(CATALOG.map((p) => p.id));
    expect(ids.size).toBe(CATALOG.length);
  });
  it("every product has a positive price and an http image", () => {
    for (const p of CATALOG) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.image).toMatch(/^https?:\/\//);
    }
  });
  it("getProduct finds by id and returns undefined for misses", () => {
    expect(getProduct(CATALOG[0].id)?.id).toBe(CATALOG[0].id);
    expect(getProduct("nope")).toBeUndefined();
  });
});
