# R6 — Anonymous Co-Presence Feed ("others are saying no")

> Executes recommendation R6 from
> [2026-06-10-research-informed-recommendations.md](2026-06-10-research-informed-recommendations.md).
> The research identified anonymous co-presence ("someone in Ohio just intercepted $84") as the
> proven engagement engine of the Korean originals. This is nada's **first backend**.
> Approved direction: **Supabase · opt-in · anonymous · You-hub ticker + intercept line · flag-dark OTA**.

## Goals

- A live, real (never seeded, never faked) stream of intercept/ritual events across all users.
- Opt-in only: nothing leaves the device unless the user enables sharing. Trust story stays intact.
- No accounts, no device IDs, no IP retention, no free text. Nothing to moderate, nothing to track.
- Ships dark behind a flag (like monetization) so it can ride an OTA update and flip with v1.1.

## Non-goals

- Chat or reactions (future smoke-break room builds on this infra later).
- Historical feeds (only the last 24 h is readable, ~8 events rendered).
- Seeded/fictional events — violates the honesty charter. Empty is empty.

## 1. Backend (Supabase)

New Supabase project (free tier), provisioned via the session's Supabase tooling.

```sql
create table public.presence_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  ritual      text not null check (ritual in ('shop','food','scroll','break')),
  amount      integer check (amount is null or (amount between 0 and 10000)), -- whole USD; null for scroll/break
  region      text not null
);
```

- **Region allowlist**: `region` is validated against a fixed table `presence_regions(name text primary key)`
  (~60 entries: US states + a handful of countries + `somewhere`) via FK. No free text can ever
  reach another user's screen.
- **RLS** (anon key):
  - `INSERT` allowed on `presence_events` (column checks + FK are the guard).
  - `SELECT` allowed **only** on a view `recent_presence` = last 24 h, newest first, limit 50.
    Base table select is denied to anon. No update/delete for anon at all.
- **Rate limiting**: BEFORE INSERT trigger rejects an insert when total inserts in the last
  minute exceed 120 globally or 30 for the same region (coarse + anonymous by design — there is
  no per-user identity to key on; this is abuse damping, not perfect protection).
- **Aggregates**: SQL function `today_stats() returns (count bigint, total bigint)` —
  today's event count and summed amount in one round trip (security definer, reads base table).
- **Realtime** enabled on `presence_events` inserts for the live ticker.

## 2. Client

### `lib/flags.ts`
- Add `export const PRESENCE_ENABLED = false;` — same pattern as `MONETIZATION_ENABLED`.
  All presence UI and network code is gated on it. Flip in the v1.1 cycle after the privacy
  label update is approved.

### `lib/presence.ts` (pure logic, Vitest-tested)
- `regionFromTimeZone(tz: string): string` — static map from IANA timezone → region word
  (`America/New_York` → "New York", `America/Chicago` → "Chicago"… unknown → `"somewhere"`).
  Must cover all US timezones + major world zones; every output exists in the server allowlist.
- `buildEvent(ritual, amount?): PresenceEventInsert` — rounds to whole dollars, clamps 0–10000,
  omits amount for scroll/break, attaches region.
- `formatEvent(e): string` — "someone in Ohio just intercepted $84" / scroll: "someone in Texas
  just reclaimed their feed" / break: "someone in London just took a real break".
- `relativeTime(createdAt, now): string` — "just now", "2m ago", "1h ago".
- `OTHERS_LINE_THRESHOLD = 25` — minimum today-count before the intercept line shows.

### `lib/supabase.ts`
- Lazy singleton: `getSupabase()` creates the client on first call only. URL + anon key are
  compile-time constants (anon key is public by design; RLS is the security boundary).
- `@supabase/supabase-js` is pure JS — no native module, OTA-safe, web-safe.

### `components/providers/PresenceProvider.tsx`
- Existing provider pattern: AsyncStorage key `nada_presence_v1` `{ enabled: boolean }`,
  hydrate → persist-gated-on-hydrated, merge-over-default, hook throws outside provider.
- Exposes `{ enabled, setEnabled, events, todayStats, post }`.
- When `enabled && PRESENCE_ENABLED`: fetch `recent_presence` + `today_stats()`, subscribe to
  Realtime inserts (prepend, cap list at 50). When disabled: **no Supabase client is ever
  created** — zero connections, true "nothing leaves the device".
- `post(ritual, amount?)`: fire-and-forget insert; all failures swallowed (one `console.warn`).
  The ritual NEVER blocks on or surfaces network state (charter: never degrade the ritual).
- Unsubscribe on unmount/disable. App-foreground refetch is a nice-to-have, not required.

### Post call sites (all gated on `enabled && PRESENCE_ENABLED`)
- Shop intercept + food intercept (where `recordIntercept` fires): `post(ritual, amount)`.
- Doomscroll session end: `post('scroll')`. Smoke-break completion: `post('break')`.

## 3. UI

### You-hub ticker card (between StatPills and SavesFeed)
- Opted out: quiet invitation card — "others are saying no right now · join anonymously" with
  the toggle and a one-line disclosure ("shares only: ritual, rounded amount, your region word").
- Opted in: header "right now", last ~8 events, each `formatEvent` + `relativeTime`, new events
  enter with `Reveal`. Honest empty state: "it's quiet right now — saves from others will show
  here." Toggle stays accessible on the card.
- Card hidden entirely when `PRESENCE_ENABLED` is false.

### Intercept celebration line (`InterceptOverlay`)
- New optional prop `othersToday?: number`. When provided and ≥ `OTHERS_LINE_THRESHOLD`:
  "you and 213 others said no today" rendered as a muted line; otherwise existing copy unchanged.
- Stats are read from provider state on the JS thread before the overlay opens — **no worklet
  may call into presence code** (Hermes SIGABRT gotcha).

### why-page (`app/why.tsx`)
- New short section documenting exactly what opt-in sharing sends (the four fields), that it is
  off by default, and that there are no IDs.

## 4. Privacy & store consequences

- Default OFF. Payload = ritual + rounded amount + region word (+ server timestamp). No IDs, no
  IP retention (disable/trim Supabase request logging where possible), nothing linkable.
- `PRIVACY.md` updated alongside the feature (worded as "if you opt in…").
- **ASC privacy label** must change at the next submission: add Usage Data → anonymized, not
  linked to identity, not used for tracking. Sequence: ship this feature **dark** via OTA now →
  v1.1 review cycle flips `PRESENCE_ENABLED` + updates the label together. Never enabled in a
  binary whose published label still says "Data Not Collected".

## 5. Error handling

- All network paths: try/catch, silent no-op, never user-facing errors inside rituals.
- Realtime drop: list simply stops updating; next mount refetches. No reconnect spinner.
- Server rejects (rate limit, validation): client treats as success-silent (fire-and-forget).
- Web: fully supported (supabase-js works on web); no Platform guards needed beyond existing ones.

## 6. Testing & verification

- **Vitest**: region map coverage (every output ∈ allowlist copy; spot-check major zones),
  buildEvent rounding/clamping/omission, formatEvent per ritual, relativeTime boundaries,
  provider reducer (hydrate/merge/toggle) if testable without RN.
- **Supabase smoke tests** (via MCP SQL): valid insert OK; bad ritual/amount/region rejected;
  anon cannot update/delete/select base table; `recent_presence` returns only <24 h;
  `today_stats()` correct; rate-limit trigger fires.
- **Web preview**: toggle on → ticker live (manual insert via SQL appears in UI); toggle off →
  no network. Intercept line renders at threshold. Typecheck + tests + web export green.
