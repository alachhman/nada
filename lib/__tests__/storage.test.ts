/**
 * Pure-reducer tests for recordIntercept — weight pipeline (EA-3).
 * Fixtures follow the style of lib/storage.test.ts.
 */
import { describe, it, expect } from "vitest";
import { recordIntercept } from "@/lib/storage";
import { INITIAL_STATE } from "@/lib/types";
import type { CartItem, SaveEntry } from "@/lib/types";

// Cart items with weightLb snapshotted at add-to-cart time
const weightedCart: CartItem[] = [
  { id: "a", name: "Retro Runner", price: 129, image: "", qty: 2, weightLb: 1.5 },
  { id: "b", name: "Hoodie", price: 74, image: "", qty: 1, weightLb: 3.2 },
];

describe("recordIntercept — weightLb", () => {
  it("stores weightLb = sum(weightLb × qty) rounded to 1 decimal", () => {
    // 2 × 1.5 + 1 × 3.2 = 6.2
    const next = recordIntercept(INITIAL_STATE, weightedCart, "2026-06-11");
    expect(next.saves[0].weightLb).toBe(6.2);
  });

  it("records weightLb correctly when a line has qty > 1", () => {
    const cart: CartItem[] = [
      { id: "x", name: "Dumbbell Set", price: 200, image: "", qty: 3, weightLb: 4.0 },
    ];
    // 3 × 4.0 = 12.0
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-11");
    expect(next.saves[0].weightLb).toBe(12);
  });

  it("stores weightLb = 0 when cart items have no weightLb (all undefined)", () => {
    const noWeightCart: CartItem[] = [
      { id: "a", name: "Thing", price: 50, image: "", qty: 2 },
    ];
    const next = recordIntercept(INITIAL_STATE, noWeightCart, "2026-06-11");
    expect(next.saves[0].weightLb).toBe(0);
  });

  it("old-shape SaveEntry without weightLb loads and merges safely", () => {
    // Simulate a state that was persisted before the weightLb field existed
    const legacyState = {
      ...INITIAL_STATE,
      saves: [
        // old shape: no weightLb
        { items: ["Sneakers"], amount: 99, timestamp: 1000 } as SaveEntry,
      ],
    };
    // A new intercept must not break
    const next = recordIntercept(legacyState, weightedCart, "2026-06-11");
    expect(next.saves).toHaveLength(2);
    // new entry has weightLb
    expect(next.saves[0].weightLb).toBe(6.2);
    // legacy entry is untouched (weightLb absent / undefined)
    expect(next.saves[1].weightLb).toBeUndefined();
  });

  it("rounds fractional weight to 1 decimal", () => {
    const cart: CartItem[] = [
      { id: "c", name: "Fancy Lamp", price: 150, image: "", qty: 1, weightLb: 2.35 },
      { id: "d", name: "Vase", price: 80, image: "", qty: 1, weightLb: 1.08 },
    ];
    // 2.35 + 1.08 = 3.43 → rounds to 3.4
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-11");
    expect(next.saves[0].weightLb).toBe(3.4);
  });
});
