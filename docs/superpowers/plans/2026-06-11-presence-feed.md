# R6 Anonymous Co-Presence Feed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.
> Spec: [2026-06-11-presence-feed-design.md](../specs/2026-06-11-presence-feed-design.md)

**Goal:** A flag-dark, opt-in, fully anonymous live feed of ritual events ("someone in Chicago just intercepted $84") backed by nada's first backend (Supabase), surfaced as a You-hub ticker + an intercept-celebration line.

**Architecture:** One Supabase table guarded by RLS (anon may insert; anon may select only rows <24h old, which also powers Realtime). Client = pure-logic `lib/presence.ts` (tested), a lazy Supabase singleton, a `PresenceProvider` following the existing AsyncStorage provider pattern, and two small UI surfaces. Everything is gated on `PRESENCE_ENABLED=false` so it ships dark via OTA and flips with the v1.1 review cycle (privacy-label change).

**Tech Stack:** Expo SDK 56 / RN 0.85 / TypeScript, `@supabase/supabase-js` (pure JS — OTA-safe), Vitest, Supabase Postgres + Realtime.

**nada conventions (binding):** tokens + StyleSheet (no Tailwind); `Reveal` for entrances (never Moti mount hooks); web-guarded haptics; **never call non-worklet fns inside Reanimated worklets**; AsyncStorage merge-over-default; ritual flows never block on network.

**Repo state note:** `master` currently has v1.0 as submitted to App Review. All work lands on a feature branch `feat/presence-feed`; merging to master is safe (release to users only happens via explicit `eas update` / store builds).

---

### Task 1: Flag + dependency

**Files:**
- Modify: `lib/flags.ts`
- Modify: `package.json` (via npm)

- [ ] **Step 1: Branch**

```bash
git checkout -b feat/presence-feed
```

- [ ] **Step 2: Add the dark flag** — append to `lib/flags.ts`:

```ts
/** Master switch for the anonymous co-presence feed. Keep FALSE until the v1.1
 *  review cycle updates the App Privacy label (the published label says
 *  "Data Not Collected"; opt-in presence sharing adds anonymized Usage Data). */
export const PRESENCE_ENABLED = false;
```

- [ ] **Step 3: Install the client**

```bash
npm install @supabase/supabase-js
```

Expected: installs v2.x, no peer warnings that matter (RN/Expo-safe, pure JS).

- [ ] **Step 4: Gates**

```bash
npx tsc --noEmit && npm test
```

Expected: both pass (no behavior changed yet).

- [ ] **Step 5: Commit**

```bash
git add lib/flags.ts package.json package-lock.json
git commit -m "feat(presence): PRESENCE_ENABLED dark flag + supabase-js dep"
```

---

### Task 2: `lib/presence.ts` pure logic (TDD)

**Files:**
- Create: `lib/presence.ts`
- Test: `lib/__tests__/presence.test.ts`

- [ ] **Step 1: Write the failing tests** — create `lib/__tests__/presence.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  ALLOWED_REGIONS,
  OTHERS_LINE_THRESHOLD,
  REGION_BY_TIMEZONE,
  buildEvent,
  formatEvent,
  regionFromTimeZone,
  relativeTime,
  type PresenceEvent,
} from "@/lib/presence";

const ev = (over: Partial<PresenceEvent>): PresenceEvent => ({
  id: 1,
  created_at: new Date(1_700_000_000_000).toISOString(),
  ritual: "shop",
  amount: 84,
  region: "Chicago",
  ...over,
});

describe("regionFromTimeZone", () => {
  it("maps known US zones", () => {
    expect(regionFromTimeZone("America/New_York")).toBe("New York");
    expect(regionFromTimeZone("America/Chicago")).toBe("Chicago");
    expect(regionFromTimeZone("America/Los_Angeles")).toBe("Los Angeles");
    expect(regionFromTimeZone("Pacific/Honolulu")).toBe("Honolulu");
  });
  it("maps major world zones", () => {
    expect(regionFromTimeZone("Europe/London")).toBe("London");
    expect(regionFromTimeZone("Asia/Tokyo")).toBe("Tokyo");
    expect(regionFromTimeZone("Australia/Sydney")).toBe("Sydney");
  });
  it("falls back to somewhere for unknown/empty", () => {
    expect(regionFromTimeZone("Mars/Olympus_Mons")).toBe("somewhere");
    expect(regionFromTimeZone("")).toBe("somewhere");
  });
  it("every map value is in the allowlist (server FK mirror)", () => {
    for (const v of Object.values(REGION_BY_TIMEZONE)) {
      expect(ALLOWED_REGIONS).toContain(v);
    }
    expect(ALLOWED_REGIONS).toContain("somewhere");
  });
});

describe("buildEvent", () => {
  it("rounds money rituals to whole dollars and clamps", () => {
    expect(buildEvent("shop", 84.6, "America/Chicago")).toEqual({
      ritual: "shop",
      amount: 85,
      region: "Chicago",
    });
    expect(buildEvent("food", -5, "America/Chicago").amount).toBe(0);
    expect(buildEvent("shop", 99999, "America/Chicago").amount).toBe(10000);
  });
  it("sends null amount for scroll/break even if one is passed", () => {
    expect(buildEvent("scroll", undefined, "Europe/London").amount).toBeNull();
    expect(buildEvent("break", 12, "Europe/London").amount).toBeNull();
  });
});

describe("formatEvent", () => {
  it("formats each ritual", () => {
    expect(formatEvent(ev({ ritual: "shop", amount: 84 }))).toBe(
      "someone in Chicago just intercepted $84",
    );
    expect(formatEvent(ev({ ritual: "food", amount: 25 }))).toBe(
      "someone in Chicago just intercepted $25",
    );
    expect(formatEvent(ev({ ritual: "scroll", amount: null }))).toBe(
      "someone in Chicago just reclaimed their feed",
    );
    expect(formatEvent(ev({ ritual: "break", amount: null }))).toBe(
      "someone in Chicago just took a real break",
    );
  });
  it("survives a money ritual with null amount (defensive)", () => {
    expect(formatEvent(ev({ ritual: "shop", amount: null }))).toBe(
      "someone in Chicago just intercepted an order",
    );
  });
});

describe("relativeTime", () => {
  const now = 1_700_000_000_000;
  const at = (msAgo: number) => new Date(now - msAgo).toISOString();
  it("buckets correctly", () => {
    expect(relativeTime(at(10_000), now)).toBe("just now");
    expect(relativeTime(at(5 * 60_000), now)).toBe("5m ago");
    expect(relativeTime(at(3 * 3_600_000), now)).toBe("3h ago");
    expect(relativeTime(at(30 * 3_600_000), now)).toBe("1d ago");
  });
});

describe("constants", () => {
  it("threshold is sane", () => {
    expect(OTHERS_LINE_THRESHOLD).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run lib/__tests__/presence.test.ts
```

Expected: FAIL — cannot resolve `@/lib/presence`.

- [ ] **Step 3: Implement** — create `lib/presence.ts`:

```ts
import { usd } from "@/lib/format";

export type PresenceRitual = "shop" | "food" | "scroll" | "break";

export interface PresenceEventInsert {
  ritual: PresenceRitual;
  amount: number | null; // whole USD; null for scroll/break
  region: string;
}

export interface PresenceEvent extends PresenceEventInsert {
  id: number;
  created_at: string; // ISO timestamp from the server
}

/** Minimum "others said no today" count before the intercept line shows. */
export const OTHERS_LINE_THRESHOLD = 25;

/** IANA timezone → public region word. Coarse on purpose: the timezone is the
 *  ONLY locality signal we use (no geo-IP, no GPS). Unknown → "somewhere". */
export const REGION_BY_TIMEZONE: Record<string, string> = {
  // US
  "America/New_York": "New York",
  "America/Detroit": "Detroit",
  "America/Chicago": "Chicago",
  "America/Denver": "Denver",
  "America/Boise": "Boise",
  "America/Phoenix": "Phoenix",
  "America/Los_Angeles": "Los Angeles",
  "America/Anchorage": "Anchorage",
  "Pacific/Honolulu": "Honolulu",
  "America/Indiana/Indianapolis": "Indiana",
  "America/Kentucky/Louisville": "Kentucky",
  // Canada + Mexico
  "America/Toronto": "Toronto",
  "America/Vancouver": "Vancouver",
  "America/Edmonton": "Edmonton",
  "America/Winnipeg": "Winnipeg",
  "America/Halifax": "Halifax",
  "America/Mexico_City": "Mexico City",
  // South America
  "America/Sao_Paulo": "Sao Paulo",
  "America/Argentina/Buenos_Aires": "Buenos Aires",
  "America/Bogota": "Bogota",
  "America/Santiago": "Santiago",
  "America/Lima": "Lima",
  // Europe
  "Europe/London": "London",
  "Europe/Dublin": "Dublin",
  "Europe/Paris": "Paris",
  "Europe/Berlin": "Berlin",
  "Europe/Madrid": "Madrid",
  "Europe/Rome": "Rome",
  "Europe/Amsterdam": "Amsterdam",
  "Europe/Brussels": "Brussels",
  "Europe/Vienna": "Vienna",
  "Europe/Zurich": "Zurich",
  "Europe/Stockholm": "Stockholm",
  "Europe/Oslo": "Oslo",
  "Europe/Copenhagen": "Copenhagen",
  "Europe/Helsinki": "Helsinki",
  "Europe/Warsaw": "Warsaw",
  "Europe/Prague": "Prague",
  "Europe/Lisbon": "Lisbon",
  "Europe/Athens": "Athens",
  "Europe/Istanbul": "Istanbul",
  "Europe/Kyiv": "Kyiv",
  // Middle East + Africa
  "Asia/Dubai": "Dubai",
  "Asia/Tel_Aviv": "Tel Aviv",
  "Asia/Riyadh": "Riyadh",
  "Africa/Johannesburg": "Johannesburg",
  "Africa/Lagos": "Lagos",
  "Africa/Nairobi": "Nairobi",
  "Africa/Cairo": "Cairo",
  "Africa/Casablanca": "Casablanca",
  // Asia
  "Asia/Tokyo": "Tokyo",
  "Asia/Seoul": "Seoul",
  "Asia/Shanghai": "Shanghai",
  "Asia/Hong_Kong": "Hong Kong",
  "Asia/Taipei": "Taipei",
  "Asia/Singapore": "Singapore",
  "Asia/Bangkok": "Bangkok",
  "Asia/Jakarta": "Jakarta",
  "Asia/Manila": "Manila",
  "Asia/Kolkata": "India",
  // Oceania
  "Australia/Sydney": "Sydney",
  "Australia/Melbourne": "Melbourne",
  "Australia/Brisbane": "Brisbane",
  "Australia/Perth": "Perth",
  "Pacific/Auckland": "Auckland",
};

/** Every value a client may ever send. The server's presence_regions table is
 *  generated FROM this list (Task 3) — they must stay in sync. */
export const ALLOWED_REGIONS: readonly string[] = [
  ...Array.from(new Set(Object.values(REGION_BY_TIMEZONE))),
  "somewhere",
];

export function regionFromTimeZone(tz: string): string {
  return REGION_BY_TIMEZONE[tz] ?? "somewhere";
}

const MONEY_RITUALS: ReadonlySet<PresenceRitual> = new Set(["shop", "food"]);

export function buildEvent(
  ritual: PresenceRitual,
  amount: number | undefined,
  tz: string,
): PresenceEventInsert {
  const money = MONEY_RITUALS.has(ritual) && typeof amount === "number";
  return {
    ritual,
    amount: money ? Math.min(10000, Math.max(0, Math.round(amount))) : null,
    region: regionFromTimeZone(tz),
  };
}

export function formatEvent(e: PresenceEvent): string {
  const who = `someone in ${e.region}`;
  switch (e.ritual) {
    case "shop":
    case "food":
      return e.amount == null
        ? `${who} just intercepted an order`
        : `${who} just intercepted ${usd(e.amount)}`;
    case "scroll":
      return `${who} just reclaimed their feed`;
    case "break":
      return `${who} just took a real break`;
  }
}

export function relativeTime(createdAt: string, nowMs: number): string {
  const elapsed = Math.max(0, nowMs - new Date(createdAt).getTime());
  if (elapsed < 60_000) return "just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return "1d ago";
}
```

(Verify `usd` exists in `lib/format.ts` with that name before using; it does — it formats whole dollars.)

- [ ] **Step 4: Run tests**

```bash
npx vitest run lib/__tests__/presence.test.ts && npx tsc --noEmit
```

Expected: PASS, clean typecheck.

- [ ] **Step 5: Commit**

```bash
git add lib/presence.ts lib/__tests__/presence.test.ts
git commit -m "feat(presence): pure logic — region map, event build/format, relative time (TDD)"
```

---

### Task 3: Supabase backend provisioning ⚠️ ORCHESTRATOR-INLINE

> This task is executed by the **orchestrator in the main session** (it needs the
> session's Supabase MCP tools + cost confirmation), NOT by a subagent.

**Produces:** a Supabase project URL + anon key, recorded for Task 4.

- [ ] **Step 1: Create project** — via Supabase MCP: `list_organizations` → `get_cost(project)` → `confirm_cost` → `create_project` (name `nada-presence`, region `us-east-1`). Wait for ACTIVE_HEALTHY via `get_project`.

- [ ] **Step 2: Generate the regions INSERT from the client source of truth**

```bash
npx tsx -e "
import { ALLOWED_REGIONS } from './lib/presence';
console.log(ALLOWED_REGIONS.map(r => \`('\${r.replace(/'/g, \"''\")}')\`).join(',\n'));
"
```

(If `tsx` is unavailable, `npm i -D tsx` first. Output feeds the migration below.)

- [ ] **Step 3: Apply migration** — via MCP `apply_migration`, name `presence_init`:

```sql
create table public.presence_regions (
  name text primary key
);
insert into public.presence_regions (name) values
  -- <paste generated rows from Step 2>
  ('somewhere');

create table public.presence_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  ritual      text not null check (ritual in ('shop','food','scroll','break')),
  amount      integer check (amount is null or (amount between 0 and 10000)),
  region      text not null references public.presence_regions(name)
);
create index presence_events_created_at_idx on public.presence_events (created_at desc);

alter table public.presence_regions enable row level security;
alter table public.presence_events  enable row level security;

-- anon can insert events (schema checks + FK are the guard)
create policy presence_insert on public.presence_events
  for insert to anon, authenticated with check (true);

-- anon can read ONLY the last 24h (also what makes Realtime deliver inserts)
create policy presence_select_recent on public.presence_events
  for select to anon, authenticated
  using (created_at > now() - interval '24 hours');

-- coarse anonymous rate damping: global 120/min, per-region 30/min
create or replace function public.presence_rate_guard()
returns trigger language plpgsql security definer as $$
begin
  if (select count(*) from public.presence_events
      where created_at > now() - interval '1 minute') >= 120 then
    raise exception 'rate limited';
  end if;
  if (select count(*) from public.presence_events
      where created_at > now() - interval '1 minute'
        and region = new.region) >= 30 then
    raise exception 'rate limited';
  end if;
  return new;
end $$;
create trigger presence_rate_guard before insert on public.presence_events
  for each row execute function public.presence_rate_guard();

-- one-round-trip aggregates for the "you and N others" line
create or replace function public.today_stats()
returns table (cnt bigint, total bigint) language sql security definer stable as $$
  select count(*), coalesce(sum(amount), 0)::bigint
  from public.presence_events
  where created_at >= date_trunc('day', now());
$$;

-- realtime
alter publication supabase_realtime add table public.presence_events;
```

**Spec deviation (approved in plan):** the spec's `recent_presence` view is replaced by the
time-scoped SELECT policy — same 24h guarantee, and required anyway for Realtime to deliver
rows to anon subscribers. Client queries the base table with `order/limit`.

- [ ] **Step 4: Smoke tests** — via MCP `execute_sql` (service role), verify:

```sql
-- valid insert OK
insert into presence_events (ritual, amount, region) values ('shop', 84, 'Chicago');
-- each of these must ERROR:
insert into presence_events (ritual, amount, region) values ('steal', 84, 'Chicago');
insert into presence_events (ritual, amount, region) values ('shop', -1, 'Chicago');
insert into presence_events (ritual, amount, region) values ('shop', 84, 'Narnia');
-- aggregates work
select * from today_stats();
```

Then with the **anon key over REST** (curl): `GET /rest/v1/presence_events?select=*` returns only <24h rows; `PATCH`/`DELETE` return 0 rows affected/denied.

- [ ] **Step 5: Record outputs** — note project URL (`https://<ref>.supabase.co`) and anon key (via MCP `get_publishable_keys`) in the task notes for Task 4. Run MCP `get_advisors(security)` and resolve anything critical.

---

### Task 4: Lazy Supabase client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Implement** — create `lib/supabase.ts` (substitute the two constants from Task 3 Step 5):

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Public by design — RLS is the security boundary (insert + 24h select only). */
const SUPABASE_URL = "<https://REF.supabase.co — from Task 3>";
const SUPABASE_ANON_KEY = "<anon key — from Task 3>";

let client: SupabaseClient | null = null;

/** Lazy singleton: no connection is ever opened unless presence is enabled. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
```

- [ ] **Step 2: Gates + commit**

```bash
npx tsc --noEmit && npm test
git add lib/supabase.ts
git commit -m "feat(presence): lazy supabase client singleton"
```

---

### Task 5: PresenceProvider

**Files:**
- Create: `components/providers/PresenceProvider.tsx`
- Modify: `app/_layout.tsx` (nest inside `FeedPrefsProvider`)

- [ ] **Step 1: Implement provider** — create `components/providers/PresenceProvider.tsx`
(pattern-match `FeedPrefsProvider.tsx`: hydrate → persist-gated-on-hydrated, hook throws outside provider):

```tsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRESENCE_ENABLED } from "@/lib/flags";
import {
  buildEvent,
  type PresenceEvent,
  type PresenceRitual,
} from "@/lib/presence";

const STORAGE_KEY = "nada_presence_v1";
const MAX_EVENTS = 50;

interface TodayStats {
  count: number;
  total: number;
}

interface PresenceCtx {
  /** User opt-in (persisted). UI should also gate on PRESENCE_ENABLED. */
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (on: boolean) => void;
  events: PresenceEvent[];
  todayStats: TodayStats | null;
  /** Fire-and-forget; silent no-op when disabled or offline. */
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
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const live = enabled && PRESENCE_ENABLED;
  const liveRef = useRef(live);
  liveRef.current = live;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as { enabled?: boolean };
          setEnabledState(stored.enabled === true);
        }
      } catch {
        /* defaults */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled })).catch(() => {});
  }, [enabled, hydrated]);

  // Connect only while live: fetch recent + stats, subscribe to inserts.
  useEffect(() => {
    if (!live) {
      setEvents([]);
      setTodayStats(null);
      return;
    }
    let cancelled = false;
    let channel: ReturnType<
      Awaited<ReturnType<typeof import("@/lib/supabase")>["getSupabase"]>["channel"]
    > | null = null;

    (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        const supabase = getSupabase();

        const { data } = await supabase
          .from("presence_events")
          .select("id, created_at, ritual, amount, region")
          .order("created_at", { ascending: false })
          .limit(MAX_EVENTS);
        if (!cancelled && data) setEvents(data as PresenceEvent[]);

        const { data: stats } = await supabase.rpc("today_stats");
        if (!cancelled && stats?.[0]) {
          setTodayStats({ count: Number(stats[0].cnt), total: Number(stats[0].total) });
        }

        channel = supabase
          .channel("presence-feed")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "presence_events" },
            (payload) => {
              if (cancelled) return;
              const e = payload.new as PresenceEvent;
              setEvents((prev) => [e, ...prev].slice(0, MAX_EVENTS));
              setTodayStats((prev) =>
                prev
                  ? { count: prev.count + 1, total: prev.total + (e.amount ?? 0) }
                  : prev,
              );
            },
          )
          .subscribe();
      } catch {
        /* offline / backend down — the ticker just stays quiet */
      }
    })();

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, [live]);

  const post = (ritual: PresenceRitual, amount?: number) => {
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
  };

  return (
    <Ctx.Provider
      value={{ enabled, hydrated, setEnabled: setEnabledState, events, todayStats, post }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePresence(): PresenceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePresence must be used within PresenceProvider");
  return ctx;
}
```

(If the `channel` type gymnastics fight the compiler, type it `any` locally with a one-line
comment — the dynamic import indirection exists so disabled users never even load supabase-js.)

- [ ] **Step 2: Mount in the tree** — in `app/_layout.tsx`, import and nest `PresenceProvider`
directly inside `FeedPrefsProvider` (wrapping `<Stack …/>`), matching the existing nesting style.

- [ ] **Step 3: Gates + commit**

```bash
npx tsc --noEmit && npm test
git add components/providers/PresenceProvider.tsx app/_layout.tsx
git commit -m "feat(presence): PresenceProvider — opt-in state, live feed, fire-and-forget post"
```

---

### Task 6: You-hub ticker card

**Files:**
- Create: `components/you/PresenceTicker.tsx`
- Modify: `app/(tabs)/you.tsx` (insert between `<StatPills …/>` block and the `ReclaimedBlock`/saves area — visually between stats and SavesFeed)

- [ ] **Step 1: Implement the card** — create `components/you/PresenceTicker.tsx`.
Style with `tokens` from `@/lib/theme` (surface card, `radius.lg`, `shadow.card`, `space.*`),
match the visual language of `SavesFeed.tsx`/`ReclaimedBlock.tsx` (read them first):

```tsx
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PRESENCE_ENABLED } from "@/lib/flags";
import { formatEvent, relativeTime } from "@/lib/presence";
import { usePresence } from "@/components/providers/PresenceProvider";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";

const SHOWN = 8;

export function PresenceTicker() {
  const { enabled, setEnabled, events } = usePresence();
  const [now, setNow] = useState(() => Date.now());

  // Refresh relative times once a minute while mounted.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!PRESENCE_ENABLED) return null;

  return (
    <Reveal>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>right now</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ true: tokens.colors.positive }}
          />
        </View>
        {!enabled ? (
          <Pressable onPress={() => setEnabled(true)}>
            <Text style={styles.invite}>
              others are saying no right now — join anonymously
            </Text>
            <Text style={styles.disclosure}>
              shares only: ritual, rounded amount, your region word. no ids, ever.
            </Text>
          </Pressable>
        ) : events.length === 0 ? (
          <Text style={styles.empty}>
            it’s quiet right now — saves from others will show here
          </Text>
        ) : (
          events.slice(0, SHOWN).map((e) => (
            <Reveal key={e.id}>
              <View style={styles.row}>
                <Text style={styles.event}>{formatEvent(e)}</Text>
                <Text style={styles.time}>{relativeTime(e.created_at, now)}</Text>
              </View>
            </Reveal>
          ))
        )}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    gap: tokens.space.sm,
    ...tokens.shadow.card,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 13, fontWeight: "700", color: tokens.colors.muted, letterSpacing: 1 },
  invite: { fontSize: 15, color: tokens.colors.ink, fontWeight: "600" },
  disclosure: { fontSize: 12, color: tokens.colors.muted, marginTop: tokens.space.xs },
  empty: { fontSize: 14, color: tokens.colors.muted },
  row: { flexDirection: "row", justifyContent: "space-between", gap: tokens.space.sm },
  event: { fontSize: 14, color: tokens.colors.ink, flexShrink: 1 },
  time: { fontSize: 12, color: tokens.colors.muted },
});
```

Adapt exact font sizes/casing to neighboring You-hub cards after reading them — consistency
beats this listing. Keep haptics out (a Switch toggle doesn't need them) or web-guard if added.

- [ ] **Step 2: Insert into the You hub** — in `app/(tabs)/you.tsx`, import `PresenceTicker`
and render it after the `StatPills` row (inside the same scroll/stagger structure its siblings
use — match how `ReclaimedBlock` is wrapped).

- [ ] **Step 3: Verify dark-flag invisibility** — with `PRESENCE_ENABLED=false` the You hub must
be pixel-identical to before. Web preview: `npm run web`, open You tab, confirm no new card.

- [ ] **Step 4: Gates + commit**

```bash
npx tsc --noEmit && npm test
git add components/you/PresenceTicker.tsx "app/(tabs)/you.tsx"
git commit -m "feat(presence): you-hub live ticker card (dark behind flag)"
```

---

### Task 7: Intercept line + post() wiring

**Files:**
- Modify: `components/intercept/InterceptOverlay.tsx` (add optional `othersToday` prop)
- Modify: `app/(tabs)/cart.tsx` (shop call site)
- Modify: `app/food/track.tsx:106` area (food call site)
- Modify: scroll + break completion call sites (locate via grep below)

- [ ] **Step 1: Overlay prop** — in `InterceptOverlay.tsx`, extend the props:

```ts
interface InterceptOverlayProps {
  amount: number;
  itemCount?: number;
  othersToday?: number;   // co-presence: today's community count (already thresholded by caller)
  processingMs?: number;
  onClose: () => void;
}
```

In the "done" phase render, beneath the existing reassurance/itemCount copy, add:

```tsx
{othersToday != null && (
  <Text style={styles.othersLine}>
    you and {othersToday.toLocaleString()} others said no today
  </Text>
)}
```

with a muted style consistent with the adjacent lines (e.g. `{ color: tokens.colors.muted, fontSize: 13 }`).
**Do not touch any worklet/useAnimatedReaction code in this file** — the value is plain JS state.

- [ ] **Step 2: Shop call site** — in `app/(tabs)/cart.tsx`: `const { post, todayStats, enabled } = usePresence();`
where `intercept(...)` fires and the overlay state is set, add:

```ts
post("shop", amount);
```

and pass to the overlay:

```tsx
othersToday={
  enabled && PRESENCE_ENABLED && todayStats && todayStats.count >= OTHERS_LINE_THRESHOLD
    ? todayStats.count
    : undefined
}
```

(import `OTHERS_LINE_THRESHOLD` from `@/lib/presence`, `PRESENCE_ENABLED` from `@/lib/flags`).

- [ ] **Step 3: Food call site** — in `app/food/track.tsx` right after
`const amount = intercept(capturedRef.current.items);` add `post("food", amount);`
(hook call at component top level). The food celebration uses its own UI — if it renders
`InterceptOverlay`, pass `othersToday` the same way; otherwise leave its UI untouched.

- [ ] **Step 4: Scroll + break call sites** — locate session-commit points:

```bash
grep -rn "reclaimed\|sessionMs\|recordBreak\|breaksTaken" components/providers/ScrollProvider.tsx components/providers/BreakProvider.tsx app/scroll/ app/break/ | grep -v test
```

At the screen-level moment a scroll session ends (where ScrollProvider's add/commit fn is called
from `app/scroll/`) add `post("scroll")`; where a break completes (BreakProvider commit called
from `app/break/`) add `post("break")`. Both via `usePresence()` in the screen component —
**never call `post` inside a worklet**; if the commit happens in a gesture/animation callback,
route through `runOnJS`.

- [ ] **Step 5: Gates + commit**

```bash
npx tsc --noEmit && npm test
git add components/intercept/InterceptOverlay.tsx "app/(tabs)/cart.tsx" app/food/track.tsx app/scroll/ app/break/
git commit -m "feat(presence): intercept others-line + post() at all four ritual commit points"
```

---

### Task 8: Honest disclosure docs

**Files:**
- Modify: `app/why.tsx`
- Modify: `PRIVACY.md`
- Modify: `README.md`

- [ ] **Step 1: why-page section** — add a short section to `app/why.tsx` after the no-ads/no-tracking
promise, matching its calm tone and existing styles:

> **the "right now" feed.** if you opt in (it's off by default), your saves appear to others as
> exactly four anonymous facts: the ritual, the rounded amount, your region word (from your
> timezone — never GPS, never your address), and a timestamp. no ids, no accounts, nothing that
> can be traced back to you. turn it off any time and nothing leaves your phone.

- [ ] **Step 2: PRIVACY.md** — add a matching "Optional anonymous presence sharing" section, worded
"if you opt in…", listing the four fields, stating default-off, no identifiers, no IP retention,
and that the app's privacy label will reflect this from the version where the feature is enabled.

- [ ] **Step 3: README** — one line under features: live anonymous co-presence ticker (opt-in, flag-dark until v1.1).

- [ ] **Step 4: Commit**

```bash
git add app/why.tsx PRIVACY.md README.md
git commit -m "docs(presence): honest disclosure — why page, privacy, readme"
```

---

### Task 9: Verification, review, merge

- [ ] **Step 1: Full gates**

```bash
npx tsc --noEmit && npm test && npx expo export --platform web
```

Expected: all green (web export proves supabase-js doesn't break the web bundle).

- [ ] **Step 2: Live end-to-end (web preview, flag temporarily ON)** — flip `PRESENCE_ENABLED=true`
locally (do NOT commit), `npm run web`:
  1. You tab → ticker card shows invitation; toggle on → honest empty state.
  2. Orchestrator inserts a row via MCP `execute_sql` (`insert into presence_events (ritual, amount, region) values ('shop', 84, 'Chicago');`) → event appears live in the ticker without reload.
  3. Run a shop intercept in the app → event lands in the DB (verify via SQL) and the overlay shows the others-line only if count ≥ 25 (insert 25 rows via SQL to cross the threshold once).
  4. Toggle off → ticker clears; intercept again → no new DB row.
  5. Revert the flag flip: `git checkout lib/flags.ts`.

- [ ] **Step 3: Code review** — dispatch code-reviewer agent over the branch diff; fix Critical/Important findings; re-run gates.

- [ ] **Step 4: Merge + push**

```bash
git checkout master && git merge --no-ff feat/presence-feed -m "feat: anonymous co-presence feed (R6) — flag-dark" && git push
```

CI must pass (typecheck, vitest, web export).

---

## Self-review notes

- Spec §1 backend → Task 3 (view replaced by time-scoped select policy — documented deviation, required for Realtime). Spec §2 client → Tasks 2/4/5. Spec §3 UI → Tasks 6/7. Spec §4 privacy → Task 8 + flag in Task 1. Spec §5 error handling → provider try/catch + fire-and-forget (Task 5/7). Spec §6 testing → Tasks 2 (vitest), 3 (SQL smoke), 9 (e2e/web).
- Type names consistent: `PresenceEvent(Insert)`, `PresenceRitual`, `usePresence`, `post`, `todayStats {count,total}` (SQL returns `cnt/total`, mapped in provider).
- Supabase URL/key are provisioning outputs of Task 3, not placeholders — Task 4 explicitly consumes them.
