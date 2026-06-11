import { describe, expect, it } from "vitest";
import {
  ALLOWED_REGIONS,
  OTHERS_LINE_THRESHOLD,
  REGION_BY_TIMEZONE,
  buildEvent,
  formatEvent,
  regionFromTimeZone,
  relativeTime,
  type PresenceEvent,
} from "@/lib/presence";

const ev = (over: Partial<PresenceEvent>): PresenceEvent => ({
  id: 1,
  created_at: new Date(1_700_000_000_000).toISOString(),
  ritual: "shop",
  amount: 84,
  region: "Chicago",
  ...over,
});

describe("regionFromTimeZone", () => {
  it("maps known US zones", () => {
    expect(regionFromTimeZone("America/New_York")).toBe("New York");
    expect(regionFromTimeZone("America/Chicago")).toBe("Chicago");
    expect(regionFromTimeZone("America/Los_Angeles")).toBe("Los Angeles");
    expect(regionFromTimeZone("Pacific/Honolulu")).toBe("Honolulu");
  });
  it("maps major world zones", () => {
    expect(regionFromTimeZone("Europe/London")).toBe("London");
    expect(regionFromTimeZone("Asia/Tokyo")).toBe("Tokyo");
    expect(regionFromTimeZone("Australia/Sydney")).toBe("Sydney");
  });
  it("falls back to somewhere for unknown/empty", () => {
    expect(regionFromTimeZone("Mars/Olympus_Mons")).toBe("somewhere");
    expect(regionFromTimeZone("")).toBe("somewhere");
  });
  it("every map value is in the allowlist (server FK mirror)", () => {
    for (const v of Object.values(REGION_BY_TIMEZONE)) {
      expect(ALLOWED_REGIONS).toContain(v);
    }
    expect(ALLOWED_REGIONS).toContain("somewhere");
  });
});

describe("buildEvent", () => {
  it("rounds money rituals to whole dollars and clamps", () => {
    expect(buildEvent("shop", 84.6, "America/Chicago")).toEqual({
      ritual: "shop",
      amount: 85,
      region: "Chicago",
    });
    expect(buildEvent("food", -5, "America/Chicago").amount).toBe(0);
    expect(buildEvent("shop", 99999, "America/Chicago").amount).toBe(10000);
  });
  it("sends null amount for scroll/break even if one is passed", () => {
    expect(buildEvent("scroll", undefined, "Europe/London").amount).toBeNull();
    expect(buildEvent("break", 12, "Europe/London").amount).toBeNull();
  });
});

describe("formatEvent", () => {
  it("formats each ritual", () => {
    expect(formatEvent(ev({ ritual: "shop", amount: 84 }))).toBe(
      "someone in Chicago just intercepted $84",
    );
    expect(formatEvent(ev({ ritual: "food", amount: 25 }))).toBe(
      "someone in Chicago just intercepted $25",
    );
    expect(formatEvent(ev({ ritual: "scroll", amount: null }))).toBe(
      "someone in Chicago just reclaimed their feed",
    );
    expect(formatEvent(ev({ ritual: "break", amount: null }))).toBe(
      "someone in Chicago just took a real break",
    );
  });
  it("survives a money ritual with null amount (defensive)", () => {
    expect(formatEvent(ev({ ritual: "shop", amount: null }))).toBe(
      "someone in Chicago just intercepted an order",
    );
  });
});

describe("relativeTime", () => {
  const now = 1_700_000_000_000;
  const at = (msAgo: number) => new Date(now - msAgo).toISOString();
  it("buckets correctly", () => {
    expect(relativeTime(at(10_000), now)).toBe("just now");
    expect(relativeTime(at(5 * 60_000), now)).toBe("5m ago");
    expect(relativeTime(at(3 * 3_600_000), now)).toBe("3h ago");
    expect(relativeTime(at(30 * 3_600_000), now)).toBe("1d ago");
  });
});

describe("constants", () => {
  it("threshold is sane", () => {
    expect(OTHERS_LINE_THRESHOLD).toBeGreaterThan(0);
  });
});
