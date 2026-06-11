import { describe, expect, it } from "vitest";
import { WORK_WAGE, hoursOfWork, formatWeight, cartWeight } from "@/lib/dodge";
import { CATALOG } from "@/lib/catalog";
import type { CartItem } from "@/lib/types";

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
    // CartItem is {id, name, price, image, qty} — lookup resolves weightLb by id
    const items: CartItem[] = [
      { id: "a", name: "Thing A", price: 10, image: "", qty: 2 },
      { id: "b", name: "Thing B", price: 10, image: "", qty: 1 },
    ];
    const lookup = (id: string): number | undefined =>
      id === "a" ? 1.5 : id === "b" ? 3.2 : undefined;
    expect(cartWeight(items, lookup)).toBe(6.2);
  });

  it("items with no weight entry contribute 0", () => {
    const items: CartItem[] = [
      { id: "x", name: "Mystery", price: 5, image: "", qty: 3 },
    ];
    expect(cartWeight(items, () => undefined)).toBe(0);
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
