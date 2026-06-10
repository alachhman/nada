import { describe, it, expect } from "vitest";
import {
  DEFAULT_FEED_PREFS,
  setLayout,
  togglePostType,
  togglePhotoTheme,
  setCameraRoll,
  type FeedPrefs,
  type PostType,
  type PhotoTheme,
} from "@/lib/feedPrefs";

describe("DEFAULT_FEED_PREFS", () => {
  it("has layout classic", () => {
    expect(DEFAULT_FEED_PREFS.layout).toBe("classic");
  });

  it("has all postTypes enabled", () => {
    const types: PostType[] = ["social", "affirmation", "tinywin", "news", "calm"];
    for (const t of types) {
      expect(DEFAULT_FEED_PREFS.postTypes[t]).toBe(true);
    }
  });

  it("has nature, animals, cozy, skies enabled; food, art disabled", () => {
    expect(DEFAULT_FEED_PREFS.photoThemes.nature).toBe(true);
    expect(DEFAULT_FEED_PREFS.photoThemes.animals).toBe(true);
    expect(DEFAULT_FEED_PREFS.photoThemes.cozy).toBe(true);
    expect(DEFAULT_FEED_PREFS.photoThemes.skies).toBe(true);
    expect(DEFAULT_FEED_PREFS.photoThemes.food).toBe(false);
    expect(DEFAULT_FEED_PREFS.photoThemes.art).toBe(false);
  });

  it("has cameraRoll false", () => {
    expect(DEFAULT_FEED_PREFS.cameraRoll).toBe(false);
  });

  it("has all required PostType keys", () => {
    const keys: PostType[] = ["social", "affirmation", "tinywin", "news", "calm"];
    expect(Object.keys(DEFAULT_FEED_PREFS.postTypes).sort()).toEqual(keys.sort());
  });

  it("has all required PhotoTheme keys", () => {
    const keys: PhotoTheme[] = ["nature", "animals", "cozy", "food", "art", "skies"];
    expect(Object.keys(DEFAULT_FEED_PREFS.photoThemes).sort()).toEqual(keys.sort());
  });
});

describe("setLayout", () => {
  it("changes layout to immersive", () => {
    const result = setLayout(DEFAULT_FEED_PREFS, "immersive");
    expect(result.layout).toBe("immersive");
  });

  it("changes layout back to classic", () => {
    const immersive = setLayout(DEFAULT_FEED_PREFS, "immersive");
    const result = setLayout(immersive, "classic");
    expect(result.layout).toBe("classic");
  });

  it("returns a new object (immutable)", () => {
    const result = setLayout(DEFAULT_FEED_PREFS, "immersive");
    expect(result).not.toBe(DEFAULT_FEED_PREFS);
    expect(DEFAULT_FEED_PREFS.layout).toBe("classic");
  });

  it("does not mutate postTypes or photoThemes", () => {
    const result = setLayout(DEFAULT_FEED_PREFS, "immersive");
    expect(result.postTypes).toEqual(DEFAULT_FEED_PREFS.postTypes);
    expect(result.photoThemes).toEqual(DEFAULT_FEED_PREFS.photoThemes);
  });
});

describe("togglePostType", () => {
  it("disables an enabled postType", () => {
    const result = togglePostType(DEFAULT_FEED_PREFS, "social");
    expect(result.postTypes.social).toBe(false);
  });

  it("enables a disabled postType", () => {
    const withSocialOff = togglePostType(DEFAULT_FEED_PREFS, "social");
    const result = togglePostType(withSocialOff, "social");
    expect(result.postTypes.social).toBe(true);
  });

  it("returns a new object (immutable)", () => {
    const result = togglePostType(DEFAULT_FEED_PREFS, "news");
    expect(result).not.toBe(DEFAULT_FEED_PREFS);
    expect(result.postTypes).not.toBe(DEFAULT_FEED_PREFS.postTypes);
    expect(DEFAULT_FEED_PREFS.postTypes.news).toBe(true);
  });

  it("only changes the targeted postType", () => {
    const result = togglePostType(DEFAULT_FEED_PREFS, "news");
    const others: PostType[] = ["social", "affirmation", "tinywin", "calm"];
    for (const t of others) {
      expect(result.postTypes[t]).toBe(DEFAULT_FEED_PREFS.postTypes[t]);
    }
  });

  it("allows toggling the last enabled postType off", () => {
    // Start with only calm on, then toggle it off — permitted at this layer
    const prefs: FeedPrefs = {
      ...DEFAULT_FEED_PREFS,
      postTypes: { social: false, affirmation: false, tinywin: false, news: false, calm: true },
    };
    const result = togglePostType(prefs, "calm");
    expect(result.postTypes.calm).toBe(false);
    // never-empty guarantee is enforced in generateFeed, not here
  });

  it("toggles each postType independently", () => {
    const types: PostType[] = ["social", "affirmation", "tinywin", "news", "calm"];
    for (const t of types) {
      const toggled = togglePostType(DEFAULT_FEED_PREFS, t);
      expect(toggled.postTypes[t]).toBe(false);
      const restored = togglePostType(toggled, t);
      expect(restored.postTypes[t]).toBe(true);
    }
  });
});

describe("togglePhotoTheme", () => {
  it("disables an enabled theme", () => {
    const result = togglePhotoTheme(DEFAULT_FEED_PREFS, "nature");
    expect(result.photoThemes.nature).toBe(false);
  });

  it("enables a disabled theme", () => {
    const result = togglePhotoTheme(DEFAULT_FEED_PREFS, "food");
    expect(result.photoThemes.food).toBe(true);
  });

  it("returns a new object (immutable)", () => {
    const result = togglePhotoTheme(DEFAULT_FEED_PREFS, "art");
    expect(result).not.toBe(DEFAULT_FEED_PREFS);
    expect(result.photoThemes).not.toBe(DEFAULT_FEED_PREFS.photoThemes);
    expect(DEFAULT_FEED_PREFS.photoThemes.art).toBe(false);
  });

  it("only changes the targeted theme", () => {
    const result = togglePhotoTheme(DEFAULT_FEED_PREFS, "skies");
    const others: PhotoTheme[] = ["nature", "animals", "cozy", "food", "art"];
    for (const t of others) {
      expect(result.photoThemes[t]).toBe(DEFAULT_FEED_PREFS.photoThemes[t]);
    }
  });

  it("toggles each theme independently", () => {
    const themes: PhotoTheme[] = ["nature", "animals", "cozy", "food", "art", "skies"];
    for (const t of themes) {
      const toggled = togglePhotoTheme(DEFAULT_FEED_PREFS, t);
      expect(toggled.photoThemes[t]).toBe(!DEFAULT_FEED_PREFS.photoThemes[t]);
      const restored = togglePhotoTheme(toggled, t);
      expect(restored.photoThemes[t]).toBe(DEFAULT_FEED_PREFS.photoThemes[t]);
    }
  });
});

describe("setCameraRoll", () => {
  it("enables cameraRoll", () => {
    const result = setCameraRoll(DEFAULT_FEED_PREFS, true);
    expect(result.cameraRoll).toBe(true);
  });

  it("disables cameraRoll", () => {
    const withOn = setCameraRoll(DEFAULT_FEED_PREFS, true);
    const result = setCameraRoll(withOn, false);
    expect(result.cameraRoll).toBe(false);
  });

  it("returns a new object (immutable)", () => {
    const result = setCameraRoll(DEFAULT_FEED_PREFS, true);
    expect(result).not.toBe(DEFAULT_FEED_PREFS);
    expect(DEFAULT_FEED_PREFS.cameraRoll).toBe(false);
  });

  it("does not change layout or postTypes or photoThemes", () => {
    const result = setCameraRoll(DEFAULT_FEED_PREFS, true);
    expect(result.layout).toBe(DEFAULT_FEED_PREFS.layout);
    expect(result.postTypes).toEqual(DEFAULT_FEED_PREFS.postTypes);
    expect(result.photoThemes).toEqual(DEFAULT_FEED_PREFS.photoThemes);
  });
});
