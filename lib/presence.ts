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
 *  generated FROM this list — they must stay in sync. */
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
    amount: money ? Math.min(10000, Math.max(0, Math.round(amount as number))) : null,
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
