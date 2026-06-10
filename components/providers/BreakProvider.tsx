import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  INITIAL_BREAK_STATE,
  recordBreak as recordBreakPure,
  type BreakState,
} from "@/lib/breaks";
import { isoDay } from "@/lib/format";

const STORAGE_KEY = "nada_break_v1";

interface BreakCtx {
  state: BreakState;
  hydrated: boolean;
  recordBreak: (seconds: number) => void;
  reset: () => void;
}

const Ctx = createContext<BreakCtx | null>(null);

export function BreakProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BreakState>(INITIAL_BREAK_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState({ ...INITIAL_BREAK_STATE, ...JSON.parse(raw) });
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

  const recordBreak = (seconds: number) => {
    setState((prev) => recordBreakPure(prev, seconds, isoDay(new Date())));
  };

  const reset = () => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(INITIAL_BREAK_STATE);
  };

  return (
    <Ctx.Provider value={{ state, hydrated, recordBreak, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBreaks(): BreakCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBreaks must be used within BreakProvider");
  return ctx;
}
