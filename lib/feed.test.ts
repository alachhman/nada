import { describe, it, expect } from "vitest";
import { generateFeed, injectPhotos, type FeedItem } from "@/lib/feed";
import {
  DEFAULT_FEED_PREFS,
  togglePostType,
  togglePhotoTheme,
  type FeedPrefs,
} from "@/lib/feedPrefs";
import { PHOTO_POOLS } from "@/lib/feed";
import type { CameraPhoto } from "@/lib/cameraRoll";

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

  it("places nada at correct global positions for a non-zero-start batch", () => {
    const batch = generateFeed(20, 16);
    batch.forEach((item, i) => {
      const g = 20 + i;
      if (g % 8 === 7) expect(item.kind).toBe("nada");
      else expect(item.kind).not.toBe("nada");
    });
  });

  it("two consecutive social cards in a batch of 20 are not identical text", () => {
    const batch = generateFeed(0, 20);
    const social = batch.filter(
      (i): i is FeedItem & { kind: "social" } => i.kind === "social",
    );
    // Collect adjacent pairs
    for (let i = 0; i < social.length - 1; i++) {
      expect(social[i].text).not.toBe(social[i + 1].text);
    }
  });
});

describe("generateFeed — prefs-aware behaviour", () => {
  it("with social and news disabled: batch of 24 has no social or news items", () => {
    let prefs = togglePostType(DEFAULT_FEED_PREFS, "social");
    prefs = togglePostType(prefs, "news");
    const batch = generateFeed(0, 24, prefs);
    for (const item of batch) {
      expect(item.kind).not.toBe("social");
      expect(item.kind).not.toBe("news");
    }
  });

  it("with only animals theme enabled: every calm item's image is from the animals pool", () => {
    // Disable all themes, then enable only animals
    let prefs: FeedPrefs = {
      ...DEFAULT_FEED_PREFS,
      photoThemes: {
        nature: false,
        animals: true,
        cozy: false,
        food: false,
        art: false,
        skies: false,
      },
    };
    const batch = generateFeed(0, 48, prefs);
    const calmItems = batch.filter((i): i is FeedItem & { kind: "calm" } => i.kind === "calm");
    expect(calmItems.length).toBeGreaterThan(0);
    const animalImages = new Set(PHOTO_POOLS.animals.map((p) => p.image));
    for (const item of calmItems) {
      expect(animalImages.has(item.image)).toBe(true);
    }
  });

  it("with ALL postTypes disabled: generateFeed returns only calm (+ nada) items and never empty", () => {
    const prefs: FeedPrefs = {
      ...DEFAULT_FEED_PREFS,
      postTypes: {
        social: false,
        affirmation: false,
        tinywin: false,
        news: false,
        calm: false,
      },
    };
    const batch = generateFeed(0, 24, prefs);
    expect(batch.length).toBe(24);
    for (const item of batch) {
      expect(["calm", "nada"]).toContain(item.kind);
    }
    const calmItems = batch.filter((i) => i.kind === "calm");
    expect(calmItems.length).toBeGreaterThan(0);
  });

  it("default-prefs batch of 24 still has ≥3 distinct kinds and ≥1 nada", () => {
    const batch = generateFeed(0, 24);
    const kinds = new Set(batch.map((i) => i.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(3);
    const nadaCount = batch.filter((i) => i.kind === "nada").length;
    expect(nadaCount).toBeGreaterThanOrEqual(1);
  });

  it("ids are unique across generateFeed(0,24) and generateFeed(24,24)", () => {
    const batch1 = generateFeed(0, 24);
    const batch2 = generateFeed(24, 24);
    const allIds = [...batch1, ...batch2].map((i) => i.id);
    expect(new Set(allIds).size).toBe(48);
  });

  it("existing 2-arg calls still work (prefs defaults)", () => {
    const twoArg = generateFeed(0, 16);
    const threeArg = generateFeed(0, 16, DEFAULT_FEED_PREFS);
    expect(twoArg).toEqual(threeArg);
  });

  it("disabling a single type removes it from a large batch", () => {
    const prefs = togglePostType(DEFAULT_FEED_PREFS, "affirmation");
    const batch = generateFeed(0, 80, prefs);
    for (const item of batch) {
      expect(item.kind).not.toBe("affirmation");
    }
  });

  it("nada interstitials always appear at globalIndex % 8 === 7 regardless of prefs", () => {
    const prefs: FeedPrefs = {
      ...DEFAULT_FEED_PREFS,
      postTypes: {
        social: false,
        affirmation: false,
        tinywin: false,
        news: false,
        calm: false,
      },
    };
    const batch = generateFeed(0, 40, prefs);
    batch.forEach((item, i) => {
      if (i % 8 === 7) {
        expect(item.kind).toBe("nada");
      }
    });
  });

  it("is deterministic with prefs — same prefs+startIndex always gives same result", () => {
    const prefs = togglePostType(DEFAULT_FEED_PREFS, "news");
    const a = generateFeed(0, 24, prefs);
    const b = generateFeed(0, 24, prefs);
    expect(a).toEqual(b);
  });

  it("non-zero start with prefs is also deterministic", () => {
    const prefs = togglePostType(DEFAULT_FEED_PREFS, "social");
    const a = generateFeed(48, 24, prefs);
    const b = generateFeed(48, 24, prefs);
    expect(a).toEqual(b);
  });

  it("batches with prefs are consistent: start+count abuts correctly", () => {
    const prefs = togglePostType(DEFAULT_FEED_PREFS, "news");
    const combined = generateFeed(0, 48, prefs);
    const batch1 = generateFeed(0, 24, prefs);
    const batch2 = generateFeed(24, 24, prefs);
    expect([...batch1, ...batch2]).toEqual(combined);
  });
});

describe("injectPhotos", () => {
  const makePhoto = (n: number): CameraPhoto => ({ id: `p${n}`, uri: `file:///photo/${n}.jpg` });
  const baseItems = generateFeed(0, 20);

  it("with empty photos returns items unchanged", () => {
    expect(injectPhotos(baseItems, [])).toEqual(baseItems);
  });

  it("with empty items returns empty array", () => {
    expect(injectPhotos([], [makePhoto(0)])).toEqual([]);
  });

  it("inserts a photo item at every everyN-th output position", () => {
    const photos = [makePhoto(0), makePhoto(1)];
    const result = injectPhotos(baseItems, photos, 10);
    // Output positions 10 and 20 should be photo items (the 11th and 21st items)
    expect(result[10].kind).toBe("photo");
    expect(result[20].kind).toBe("photo");
    // Total length = original + number of injections
    const photoCount = result.filter((i) => i.kind === "photo").length;
    expect(photoCount).toBe(2);
  });

  it("injected photo items carry the expected uri and caption", () => {
    const photos = [makePhoto(7)];
    const result = injectPhotos(baseItems, photos, 5);
    const photoItems = result.filter((i): i is FeedItem & { kind: "photo" } => i.kind === "photo");
    expect(photoItems.length).toBeGreaterThan(0);
    for (const p of photoItems) {
      expect(p.uri).toBe("file:///photo/7.jpg");
      expect(p.caption).toBe("from your camera roll");
    }
  });

  it("injected photo ids are unique and follow cam-<n> pattern", () => {
    const photos = [makePhoto(0), makePhoto(1), makePhoto(2)];
    const result = injectPhotos(generateFeed(0, 50), photos, 10);
    const photoItems = result.filter((i): i is FeedItem & { kind: "photo" } => i.kind === "photo");
    const ids = photoItems.map((p) => p.id);
    expect(ids).toEqual([...ids].sort()); // cam-0, cam-1, cam-2, cam-3, cam-4
    ids.forEach((id, i) => expect(id).toBe(`cam-${i}`));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cycles through photos when there are more slots than photos", () => {
    const photos = [makePhoto(0), makePhoto(1)];
    const result = injectPhotos(generateFeed(0, 60), photos, 10);
    const photoItems = result.filter((i): i is FeedItem & { kind: "photo" } => i.kind === "photo");
    // 60 base items → 6 injections; photos cycle 0,1,0,1,0,1
    expect(photoItems.length).toBe(6);
    expect(photoItems[0].uri).toBe("file:///photo/0.jpg");
    expect(photoItems[1].uri).toBe("file:///photo/1.jpg");
    expect(photoItems[2].uri).toBe("file:///photo/0.jpg");
    expect(photoItems[3].uri).toBe("file:///photo/1.jpg");
  });

  it("first item in the output is never a photo item (content comes first)", () => {
    const photos = [makePhoto(0)];
    const result = injectPhotos(generateFeed(0, 5), photos, 10);
    expect(result[0].kind).not.toBe("photo");
  });

  it("non-photo items from the original feed are preserved in order", () => {
    const photos = [makePhoto(0)];
    const result = injectPhotos(baseItems, photos, 10);
    const nonPhoto = result.filter((i) => i.kind !== "photo");
    expect(nonPhoto).toEqual(baseItems);
  });
});
