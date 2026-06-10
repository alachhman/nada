import { describe, it, expect } from "vitest";
import { buildWeeklySummary } from "@/lib/insights";

describe("buildWeeklySummary", () => {
  it("formats spend with no cents and a thousands separator", () => {
    const s = buildWeeklySummary({
      totalSaved: 1250,
      cravingsHandled: 4,
      secondsReclaimed: 600,
    });
    expect(s.spend).toBe("you didn't spend $1,250");
  });

  it("pluralizes cravings (>1)", () => {
    const s = buildWeeklySummary({
      totalSaved: 0,
      cravingsHandled: 3,
      secondsReclaimed: 0,
    });
    expect(s.cravings).toBe("3 cravings handled");
  });

  it("uses singular 'craving' for exactly 1", () => {
    const s = buildWeeklySummary({
      totalSaved: 0,
      cravingsHandled: 1,
      secondsReclaimed: 0,
    });
    expect(s.cravings).toBe("1 craving handled");
  });

  it("uses plural for 0 cravings", () => {
    const s = buildWeeklySummary({
      totalSaved: 0,
      cravingsHandled: 0,
      secondsReclaimed: 0,
    });
    expect(s.cravings).toBe("0 cravings handled");
  });

  it("formats reclaimed time via formatDuration", () => {
    const s = buildWeeklySummary({
      totalSaved: 0,
      cravingsHandled: 0,
      secondsReclaimed: 5400,
    });
    expect(s.reclaimed).toBe("1h 30m reclaimed");
  });

  it("rounds and floors negative craving counts to 0", () => {
    const s = buildWeeklySummary({
      totalSaved: 0,
      cravingsHandled: -2,
      secondsReclaimed: 0,
    });
    expect(s.cravings).toBe("0 cravings handled");
  });
});
