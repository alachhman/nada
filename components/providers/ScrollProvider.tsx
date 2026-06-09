import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  INITIAL_SCROLL_STATE,
  addReclaimed as addReclaimedPure,
  type ScrollState,
} from "@/lib/scroll";
import { isoDay } from "@/lib/format";

const STORAGE_KEY = "nada_scroll_v1";

interface ScrollCtx {
  state: ScrollState;
  hydrated: boolean;
  addReclaimed: (seconds: number) => void;
  reset: () => void;
}

const Ctx = createContext<ScrollCtx | null>(null);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScrollState>(INITIAL_SCROLL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState({ ...INITIAL_SCROLL_STATE, ...JSON.parse(raw) });
        }
      } catch {
        /* ignore — fall back to initial state */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist after hydration so we never overwrite stored state on mount
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const addReclaimed = (seconds: number) => {
    setState((prev) => addReclaimedPure(prev, seconds, isoDay(new Date())));
  };

  const reset = () => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(INITIAL_SCROLL_STATE);
  };

  return (
    <Ctx.Provider value={{ state, hydrated, addReclaimed, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScroll(): ScrollCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useScroll must be used within ScrollProvider");
  return ctx;
}
