import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/duration";

describe("formatDuration", () => {
  it("returns '<1 min' for 30 seconds", () => {
    expect(formatDuration(30)).toBe("<1 min");
  });

  it("returns '2 min' for 90 seconds (rounds 1.5 → 2)", () => {
    expect(formatDuration(90)).toBe("2 min");
  });

  it("returns '10 min' for 600 seconds", () => {
    expect(formatDuration(600)).toBe("10 min");
  });

  it("returns '1h' for exactly 3600 seconds", () => {
    expect(formatDuration(3600)).toBe("1h");
  });

  it("returns '1h 30m' for 5400 seconds", () => {
    expect(formatDuration(5400)).toBe("1h 30m");
  });

  it("returns '<1 min' for 0 seconds", () => {
    expect(formatDuration(0)).toBe("<1 min");
  });

  it("returns '<1 min' for 59 seconds (still under a minute)", () => {
    expect(formatDuration(59)).toBe("<1 min");
  });

  it("returns '2h 5m' for 7500 seconds", () => {
    expect(formatDuration(7500)).toBe("2h 5m");
  });
});
