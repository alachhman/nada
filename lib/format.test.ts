import { describe, it, expect } from "vitest";
import { usd, isSameDay, isYesterday } from "@/lib/format";

describe("usd", () => {
  it("formats whole dollars with no cents", () => {
    expect(usd(203)).toBe("$203");
  });
  it("rounds cents to whole dollars", () => {
    expect(usd(129.99)).toBe("$130");
  });
  it("adds thousands separators", () => {
    expect(usd(1250)).toBe("$1,250");
  });
});

describe("isSameDay", () => {
  it("true for same calendar day", () => {
    expect(isSameDay("2026-06-08", "2026-06-08")).toBe(true);
  });
  it("false for different days", () => {
    expect(isSameDay("2026-06-08", "2026-06-07")).toBe(false);
  });
});

describe("isYesterday", () => {
  it("true when prev is the day before today", () => {
    expect(isYesterday("2026-06-07", "2026-06-08")).toBe(true);
  });
  it("false when prev is two days before", () => {
    expect(isYesterday("2026-06-06", "2026-06-08")).toBe(false);
  });
  it("false when prev is the same day", () => {
    expect(isYesterday("2026-06-08", "2026-06-08")).toBe(false);
  });
});
