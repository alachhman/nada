import { describe, it, expect } from "vitest";
import { recordIntercept } from "@/lib/storage";
import { INITIAL_STATE } from "@/lib/types";
import type { CartItem } from "@/lib/types";

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
});
