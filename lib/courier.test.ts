import { describe, it, expect } from "vitest";
import { statusForProgress, statusLabel, type CourierStatus } from "@/lib/courier";

describe("statusForProgress", () => {
  it("maps boundary values to the correct status", () => {
    expect(statusForProgress(0)).toBe("placed");
    expect(statusForProgress(0.14)).toBe("placed");
    expect(statusForProgress(0.15)).toBe("preparing");
    expect(statusForProgress(0.39)).toBe("preparing");
    expect(statusForProgress(0.4)).toBe("picked_up");
    expect(statusForProgress(0.59)).toBe("picked_up");
    expect(statusForProgress(0.6)).toBe("on_the_way");
    expect(statusForProgress(0.91)).toBe("on_the_way");
    expect(statusForProgress(0.92)).toBe("arriving");
    expect(statusForProgress(1)).toBe("arriving");
  });

  it("clamps out-of-range values", () => {
    expect(statusForProgress(-0.5)).toBe("placed");
    expect(statusForProgress(2)).toBe("arriving");
  });
});

describe("statusLabel", () => {
  it("maps each status to its human label", () => {
    const expected: Record<CourierStatus, string> = {
      placed: "Order placed",
      preparing: "Restaurant is preparing your food",
      picked_up: "Courier picked up your order",
      on_the_way: "On the way to you",
      arriving: "Arriving now",
    };
    (Object.keys(expected) as CourierStatus[]).forEach((s) => {
      expect(statusLabel(s)).toBe(expected[s]);
    });
  });
});
