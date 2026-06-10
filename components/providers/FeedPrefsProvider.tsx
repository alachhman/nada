import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const STORAGE_KEY = "nada_feedprefs_v1";

interface FeedPrefsCtx {
  prefs: FeedPrefs;
  hydrated: boolean;
  setLayout: (layout: FeedPrefs["layout"]) => void;
  togglePostType: (t: PostType) => void;
  togglePhotoTheme: (t: PhotoTheme) => void;
  setCameraRoll: (on: boolean) => void;
  reset: () => void;
}

const Ctx = createContext<FeedPrefsCtx | null>(null);

export function FeedPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<FeedPrefs>(DEFAULT_FEED_PREFS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount; merge over DEFAULT_FEED_PREFS so new
  // fields added in the future are forward-safe.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as Partial<FeedPrefs>;
          setPrefs({
            ...DEFAULT_FEED_PREFS,
            ...stored,
            postTypes: { ...DEFAULT_FEED_PREFS.postTypes, ...(stored.postTypes ?? {}) },
            photoThemes: { ...DEFAULT_FEED_PREFS.photoThemes, ...(stored.photoThemes ?? {}) },
          });
        }
      } catch {
        /* ignore — fall back to defaults */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist after hydration so we never overwrite stored state on mount
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, hydrated]);

  const ctx: FeedPrefsCtx = {
    prefs,
    hydrated,
    setLayout: (layout) => setPrefs((prev) => setLayout(prev, layout)),
    togglePostType: (t) => setPrefs((prev) => togglePostType(prev, t)),
    togglePhotoTheme: (t) => setPrefs((prev) => togglePhotoTheme(prev, t)),
    setCameraRoll: (on) => setPrefs((prev) => setCameraRoll(prev, on)),
    reset: () => {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      setPrefs(DEFAULT_FEED_PREFS);
    },
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useFeedPrefs(): FeedPrefsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeedPrefs must be used within FeedPrefsProvider");
  return ctx;
}
