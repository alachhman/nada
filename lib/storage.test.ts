import { describe, it, expect } from "vitest";
import { recordIntercept } from "@/lib/storage";
import { INITIAL_STATE } from "@/lib/types";
import type { CartItem, SaveEntry } from "@/lib/types";

const cart: CartItem[] = [
  { id: "a", name: "Retro Runner", price: 129, image: "", qty: 1 },
  { id: "b", name: "Hoodie", price: 74, image: "", qty: 1 },
];

describe("recordIntercept", () => {
  it("adds cart total to totalSaved and increments interceptCount", () => {
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-08");
    expect(next.totalSaved).toBe(203);
    expect(next.interceptCount).toBe(1);
  });

  it("uses item qty in the saved total", () => {
    const next = recordIntercept(
      INITIAL_STATE,
      [{ id: "a", name: "Retro Runner", price: 100, image: "", qty: 3 }],
      "2026-06-08",
    );
    expect(next.totalSaved).toBe(300);
  });

  it("prepends a save entry with item names and amount", () => {
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-08");
    expect(next.saves).toHaveLength(1);
    expect(next.saves[0].items).toEqual(["Retro Runner", "Hoodie"]);
    expect(next.saves[0].amount).toBe(203);
  });

  it("starts the streak at 1 from a fresh state", () => {
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-08");
    expect(next.streak).toBe(1);
    expect(next.lastActiveDate).toBe("2026-06-08");
  });

  it("increments the streak when last active was yesterday", () => {
    const day1 = recordIntercept(INITIAL_STATE, cart, "2026-06-07");
    const day2 = recordIntercept(day1, cart, "2026-06-08");
    expect(day2.streak).toBe(2);
  });

  it("does not change the streak for a second intercept the same day", () => {
    const first = recordIntercept(INITIAL_STATE, cart, "2026-06-08");
    const second = recordIntercept(first, cart, "2026-06-08");
    expect(second.streak).toBe(1);
    expect(second.interceptCount).toBe(2);
  });

  it("resets the streak to 1 after a gap of more than a day", () => {
    const day1 = recordIntercept(INITIAL_STATE, cart, "2026-06-05");
    const later = recordIntercept(day1, cart, "2026-06-08");
    expect(later.streak).toBe(1);
  });

  it("caps saves at 50 entries with most recent first", () => {
    let state = INITIAL_STATE;
    for (let i = 0; i < 55; i++) {
      state = recordIntercept(state, cart, "2026-06-08");
    }
    expect(state.saves).toHaveLength(50);
    expect(state.saves[0].amount).toBe(203);
  });

  it("uses the injected timestamp for the save entry", () => {
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-08", 1234567890);
    expect(next.saves[0].timestamp).toBe(1234567890);
  });

  it("records itemCount as the sum of cart qty", () => {
    const next = recordIntercept(INITIAL_STATE, cart, "2026-06-08");
    // cart has qty:1 + qty:1 → 2
    expect(next.saves[0].itemCount).toBe(2);
  });

  it("records itemCount correctly when a line has qty > 1", () => {
    const multiCart: CartItem[] = [
      { id: "a", name: "Hoodie", price: 74, image: "", qty: 3 },
      { id: "b", name: "Cap", price: 30, image: "", qty: 1 },
    ];
    const next = recordIntercept(INITIAL_STATE, multiCart, "2026-06-08");
    expect(next.saves[0].itemCount).toBe(4);
  });
});

describe("recordIntercept — weightLb", () => {
  // Cart items with weightLb snapshotted at add-to-cart time
  const weightedCart: CartItem[] = [
    { id: "a", name: "Retro Runner", price: 129, image: "", qty: 2, weightLb: 1.5 },
    { id: "b", name: "Hoodie", price: 74, image: "", qty: 1, weightLb: 3.2 },
  ];

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
