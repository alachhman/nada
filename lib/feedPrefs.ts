export type PostType = "social" | "affirmation" | "tinywin" | "news" | "calm";
export type PhotoTheme = "nature" | "animals" | "cozy" | "food" | "art" | "skies";

export interface FeedPrefs {
  layout: "classic" | "immersive";
  postTypes: Record<PostType, boolean>;
  photoThemes: Record<PhotoTheme, boolean>;
  cameraRoll: boolean;
}

export const DEFAULT_FEED_PREFS: FeedPrefs = {
  layout: "classic",
  postTypes: {
    social: true,
    affirmation: true,
    tinywin: true,
    news: true,
    calm: true,
  },
  photoThemes: {
    nature: true,
    animals: true,
    cozy: true,
    food: false,
    art: false,
    skies: true,
  },
  cameraRoll: false,
};

/** Return new prefs with layout changed. */
export function setLayout(
  prefs: FeedPrefs,
  layout: FeedPrefs["layout"],
): FeedPrefs {
  return { ...prefs, layout };
}

/** Return new prefs with postType `t` toggled. */
export function togglePostType(prefs: FeedPrefs, t: PostType): FeedPrefs {
  return {
    ...prefs,
    postTypes: { ...prefs.postTypes, [t]: !prefs.postTypes[t] },
  };
}

/** Return new prefs with photoTheme `t` toggled. */
export function togglePhotoTheme(prefs: FeedPrefs, t: PhotoTheme): FeedPrefs {
  return {
    ...prefs,
    photoThemes: { ...prefs.photoThemes, [t]: !prefs.photoThemes[t] },
  };
}

/** Return new prefs with cameraRoll set to `on`. */
export function setCameraRoll(prefs: FeedPrefs, on: boolean): FeedPrefs {
  return { ...prefs, cameraRoll: on };
}
