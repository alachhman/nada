import { describe, it, expect } from "vitest";
import { nothingStageFor, itemsKeptOut, NOTHING_STAGES } from "@/lib/nothing";
import type { SaveEntry } from "@/lib/types";

const MS_2MIN = 2 * 60 * 1000;
const MS_1H = 60 * 60 * 1000;
const MS_24H = 24 * 60 * 60 * 1000;

describe("nothingStageFor — stage boundaries", () => {
  it("elapsed 0 → stage 0", () => {
    const s = nothingStageFor(0);
    expect(s.index).toBe(0);
    expect(s.label).toBe(NOTHING_STAGES[0].label);
    expect(s.sublabel).toBe(NOTHING_STAGES[0].sublabel);
    expect(s.total).toBe(4);
  });

  it("elapsed 2min - 1ms → still stage 0", () => {
    expect(nothingStageFor(MS_2MIN - 1).index).toBe(0);
  });

  it("elapsed exactly 2min → stage 1", () => {
    expect(nothingStageFor(MS_2MIN).index).toBe(1);
  });

  it("elapsed 1h - 1ms → still stage 1", () => {
    expect(nothingStageFor(MS_1H - 1).index).toBe(1);
  });

  it("elapsed exactly 1h → stage 2", () => {
    expect(nothingStageFor(MS_1H).index).toBe(2);
  });

  it("elapsed 24h - 1ms → still stage 2", () => {
    expect(nothingStageFor(MS_24H - 1).index).toBe(2);
  });

  it("elapsed exactly 24h → stage 3", () => {
    const s = nothingStageFor(MS_24H);
    expect(s.index).toBe(3);
    expect(s.label).toBe(NOTHING_STAGES[3].label);
  });

  it("elapsed beyond 24h → still stage 3", () => {
    expect(nothingStageFor(MS_24H * 3).index).toBe(3);
  });
});

describe("nothingStageFor — progress", () => {
  it("elapsed 0 → progress 0", () => {
    expect(nothingStageFor(0).progress).toBe(0);
  });

  it("elapsed 12h → progress 0.5", () => {
    expect(nothingStageFor(MS_24H / 2).progress).toBeCloseTo(0.5);
  });

  it("elapsed 24h → progress 1", () => {
    expect(nothingStageFor(MS_24H).progress).toBe(1);
  });

  it("elapsed beyond 24h → progress clamped to 1", () => {
    expect(nothingStageFor(MS_24H * 10).progress).toBe(1);
  });

  it("negative elapsed → stage 0, progress 0", () => {
    const s = nothingStageFor(-9999);
    expect(s.index).toBe(0);
    expect(s.progress).toBe(0);
  });
});

describe("itemsKeptOut", () => {
  it("returns 0 for empty saves", () => {
    expect(itemsKeptOut([])).toBe(0);
  });

  it("uses itemCount when present", () => {
    const saves: SaveEntry[] = [
      { items: ["Hoodie", "Cap"], amount: 100, timestamp: 1, itemCount: 5 },
    ];
    expect(itemsKeptOut(saves)).toBe(5);
  });

  it("falls back to items.length for legacy entries without itemCount", () => {
    const saves: SaveEntry[] = [
      { items: ["Hoodie", "Cap", "Shoes"], amount: 100, timestamp: 1 },
    ];
    expect(itemsKeptOut(saves)).toBe(3);
  });

  it("mixes new entries (itemCount) and legacy entries (items.length)", () => {
    const saves: SaveEntry[] = [
      // new entry: itemCount=4 (qty > 1 on some lines)
      { items: ["Hoodie", "Cap"], amount: 200, timestamp: 2, itemCount: 4 },
      // legacy entry: no itemCount, 2 items
      { items: ["Sneakers", "Belt"], amount: 150, timestamp: 1 },
    ];
    expect(itemsKeptOut(saves)).toBe(6); // 4 + 2
  });

  it("sums across multiple new entries", () => {
    const saves: SaveEntry[] = [
      { items: ["A"], amount: 50, timestamp: 3, itemCount: 3 },
      { items: ["B"], amount: 70, timestamp: 2, itemCount: 1 },
      { items: ["C", "D"], amount: 90, timestamp: 1, itemCount: 2 },
    ];
    expect(itemsKeptOut(saves)).toBe(6);
  });
});
