import { describe, it, expect } from "vitest";
import { RESTAURANTS, getRestaurant } from "@/lib/food";

describe("food data", () => {
  it("has at least 4 restaurants", () => {
    expect(RESTAURANTS.length).toBeGreaterThanOrEqual(4);
  });

  it("every restaurant has a unique id", () => {
    const ids = new Set(RESTAURANTS.map((r) => r.id));
    expect(ids.size).toBe(RESTAURANTS.length);
  });

  it("every restaurant has at least 3 menu items", () => {
    for (const r of RESTAURANTS) {
      expect(r.menu.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every menu item across all restaurants has a unique id", () => {
    const allItems = RESTAURANTS.flatMap((r) => r.menu);
    const ids = new Set(allItems.map((m) => m.id));
    expect(ids.size).toBe(allItems.length);
  });

  it("every menu item has price > 0 and an https image", () => {
    for (const r of RESTAURANTS) {
      for (const m of r.menu) {
        expect(m.price).toBeGreaterThan(0);
        expect(m.image).toMatch(/^https?:\/\//);
      }
    }
  });

  it("every restaurant image is an http url", () => {
    for (const r of RESTAURANTS) {
      expect(r.image).toMatch(/^https?:\/\//);
    }
  });

  it("getRestaurant finds by id and returns undefined for misses", () => {
    const first = RESTAURANTS[0];
    expect(getRestaurant(first.id)?.id).toBe(first.id);
    expect(getRestaurant("nope-does-not-exist")).toBeUndefined();
  });
});
