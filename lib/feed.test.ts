import { describe, it, expect } from "vitest";
import { generateFeed, type FeedItem } from "@/lib/feed";

describe("generateFeed", () => {
  it("returns exactly the requested count", () => {
    expect(generateFeed(0, 20).length).toBe(20);
  });

  it("returns the exact count for different sizes", () => {
    expect(generateFeed(0, 1).length).toBe(1);
    expect(generateFeed(0, 5).length).toBe(5);
    expect(generateFeed(100, 30).length).toBe(30);
  });

  it("has unique IDs within a single batch", () => {
    const batch = generateFeed(0, 20);
    const ids = batch.map((i) => i.id);
    expect(new Set(ids).size).toBe(20);
  });

  it("has unique IDs across two consecutive batches", () => {
    const batch1 = generateFeed(0, 20);
    const batch2 = generateFeed(20, 20);
    const allIds = [...batch1, ...batch2].map((i) => i.id);
    expect(new Set(allIds).size).toBe(40);
  });

  it("all calm/social image URLs (when present) match https://", () => {
    const batch = generateFeed(0, 100);
    for (const item of batch) {
      if (item.kind === "calm") {
        expect(item.image).toMatch(/^https?:\/\//);
      }
      if (item.kind === "social" && item.image) {
        expect(item.image).toMatch(/^https?:\/\//);
      }
    }
  });

  it("a batch of 20 contains at least 3 distinct kinds", () => {
    const batch = generateFeed(0, 20);
    const kinds = new Set(batch.map((i) => i.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });

  it("contains at least 1 nada item per 16 items", () => {
    const batch = generateFeed(0, 16);
    const nadaCount = batch.filter((i) => i.kind === "nada").length;
    expect(nadaCount).toBeGreaterThanOrEqual(1);
  });

  it("nada items appear at globalIndex % 8 === 7", () => {
    const batch = generateFeed(0, 40);
    batch.forEach((item, i) => {
      if (i % 8 === 7) {
        expect(item.kind).toBe("nada");
      }
    });
  });

  it("is deterministic — same call produces same result", () => {
    const a = generateFeed(5, 10);
    const b = generateFeed(5, 10);
    expect(a).toEqual(b);
  });

  it("IDs follow the pattern item-{startIndex + i}", () => {
    const batch = generateFeed(10, 5);
    batch.forEach((item, i) => {
      expect(item.id).toBe(`item-${10 + i}`);
    });
  });

  it("social items have required fields", () => {
    const batch = generateFeed(0, 100);
    const social = batch.filter((i): i is FeedItem & { kind: "social" } => i.kind === "social");
    expect(social.length).toBeGreaterThan(0);
    for (const item of social) {
      expect(typeof item.author).toBe("string");
      expect(typeof item.handle).toBe("string");
      expect(typeof item.avatarColor).toBe("string");
      expect(typeof item.text).toBe("string");
      expect(typeof item.likes).toBe("number");
      expect(typeof item.comments).toBe("number");
    }
  });
});
