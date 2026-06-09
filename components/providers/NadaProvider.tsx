"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { INITIAL_STATE, type CartItem, type NadaState } from "@/lib/types";
import { loadState, saveState, recordIntercept, resetState } from "@/lib/storage";
import { isoDay } from "@/lib/format";

interface NadaCtx {
  state: NadaState;
  hydrated: boolean;
  intercept: (cart: CartItem[]) => number; // returns amount saved (synchronous)
  reset: () => void;
}

const Ctx = createContext<NadaCtx | null>(null);

export function NadaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NadaState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist whenever state changes, but only after hydration so we don't
  // overwrite stored state with INITIAL_STATE on first mount.
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const intercept = (cart: CartItem[]) => {
    const today = isoDay(new Date());
    const amount = cart.reduce((s, i) => s + i.price * i.qty, 0);
    setState((prev) => recordIntercept(prev, cart, today));
    return amount;
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
