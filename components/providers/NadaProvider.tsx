"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_STATE, type CartItem, type NadaState } from "@/lib/types";
import { loadState, saveState, recordIntercept, resetState } from "@/lib/storage";
import { isoDay } from "@/lib/format";

interface NadaCtx {
  state: NadaState;
  hydrated: boolean;
  intercept: (cart: CartItem[]) => number; // returns amount saved
  reset: () => void;
}

const Ctx = createContext<NadaCtx | null>(null);

export function NadaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NadaState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const intercept = (cart: CartItem[]) => {
    const today = isoDay(new Date());
    const next = recordIntercept(state, cart, today);
    setState(next);
    saveState(next);
    return next.totalSaved - state.totalSaved;
  };

  const reset = () => {
    resetState();
    setState(INITIAL_STATE);
  };

  return (
    <Ctx.Provider value={{ state, hydrated, intercept, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNada(): NadaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNada must be used within NadaProvider");
  return ctx;
}
