import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "nada_premium_v1";

interface PremiumStored {
  isPremium: boolean;
}

const DEFAULT_STORED: PremiumStored = { isPremium: false };

interface PremiumCtx {
  isPremium: boolean;
  hydrated: boolean;
  setPremium: (v: boolean) => void;
  restore: () => void;
  reset: () => void;
}

const Ctx = createContext<PremiumCtx | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(DEFAULT_STORED.isPremium);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const merged: PremiumStored = { ...DEFAULT_STORED, ...JSON.parse(raw) };
          setIsPremium(merged.isPremium);
        }
      } catch {
        /* ignore — fall back to default (not premium) */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist after hydration so we never overwrite stored state on mount
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isPremium } satisfies PremiumStored),
    ).catch(() => {});
  }, [isPremium, hydrated]);

  // TODO(revenuecat): replace local flag with `Purchases` entitlement; setPremium becomes purchase()/restorePurchases().
  const setPremium = (v: boolean) => {
    setIsPremium(v);
  };

  // restore() = re-read storage (placeholder for RevenueCat restorePurchases()).
  const restore = () => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const merged: PremiumStored = raw
          ? { ...DEFAULT_STORED, ...JSON.parse(raw) }
          : DEFAULT_STORED;
        setIsPremium(merged.isPremium);
      } catch {
        /* ignore */
      }
    })();
  };

  const reset = () => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setIsPremium(false);
  };

  return (
    <Ctx.Provider value={{ isPremium, hydrated, setPremium, restore, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
