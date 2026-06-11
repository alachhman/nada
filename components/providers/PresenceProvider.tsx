import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRESENCE_ENABLED } from "@/lib/flags";
import {
  buildEvent,
  type PresenceEvent,
  type PresenceRitual,
} from "@/lib/presence";

const STORAGE_KEY = "nada_presence_v1";

interface PresenceCtx {
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (on: boolean) => void;
  events: PresenceEvent[];
  todayStats: { count: number; total: number } | null;
  post: (ritual: PresenceRitual, amount?: number) => void;
}

const Ctx = createContext<PresenceCtx | null>(null);

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<PresenceEvent[]>([]);
  const [todayStats, setTodayStats] = useState<{ count: number; total: number } | null>(null);

  // Ref that mirrors `live` so post() never closes over a stale value.
  const liveRef = useRef(false);

  const live = enabled && PRESENCE_ENABLED;

  // Keep liveRef in sync.
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // Hydrate from AsyncStorage on mount; parse failures → default (enabled: false).
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as { enabled?: boolean };
          if (typeof stored.enabled === "boolean") {
            setEnabledState(stored.enabled);
          }
        }
      } catch {
        /* ignore — fall back to default */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persist after hydration so we never overwrite stored state on mount.
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled })).catch(() => {});
  }, [enabled, hydrated]);

  // Live feed effect: subscribe when live, clean up when not.
  useEffect(() => {
    if (!live) {
      setEvents([]);
      setTodayStats(null);
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;

    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        const supabase = getSupabase();

        // Initial fetch of recent events.
        const { data: eventsData } = await supabase
          .from("presence_events")
          .select("id, created_at, ritual, amount, region")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!cancelled && eventsData) {
          setEvents(eventsData as PresenceEvent[]);
        }

        // Today's aggregate stats.
        const { data: statsData } = await supabase.rpc("today_stats");
        if (!cancelled && statsData && statsData.length > 0) {
          const { cnt, total } = statsData[0];
          setTodayStats({ count: Number(cnt), total: Number(total) });
        }

        // Realtime subscription for new inserts.
        // `channel` typed as `any` — supabase-js realtime generics are tricky; one-line comment covers it.
        channel = supabase
          .channel("presence-feed")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "presence_events" },
            (payload: { new: Record<string, unknown> }) => {
              if (cancelled) return;
              // Cast through unknown — realtime payload shape matches PresenceEvent at runtime.
              const newEvent = payload.new as unknown as PresenceEvent;
              setEvents((prev) => [newEvent, ...prev].slice(0, 50));
              setTodayStats((prev) =>
                prev
                  ? {
                      count: prev.count + 1,
                      total: prev.total + (typeof newEvent.amount === "number" ? newEvent.amount : 0),
                    }
                  : prev,
              );
            },
          )
          .subscribe();
      } catch {
        /* backend down — quiet ticker, no errors surfaced */
      }
    })();

    return () => {
      cancelled = true;
      if (channel) {
        try {
          channel.unsubscribe();
        } catch {
          /* ignore cleanup errors */
        }
      }
    };
  }, [live]);

  function setEnabled(on: boolean) {
    setEnabledState(on);
  }

  function post(ritual: PresenceRitual, amount?: number): void {
    // Fire-and-forget. Use ref to avoid stale closures.
    if (!liveRef.current) return;
    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        await getSupabase()
          .from("presence_events")
          .insert(buildEvent(ritual, amount, deviceTimeZone()));
      } catch {
        console.warn("presence post failed (ignored)");
      }
    })();
  }

  const ctx: PresenceCtx = {
    enabled,
    hydrated,
    setEnabled,
    events,
    todayStats,
    post,
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function usePresence(): PresenceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePresence must be used within PresenceProvider");
  return ctx;
}
