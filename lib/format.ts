const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Format a USD amount with no cents, e.g. 1250 -> "$1,250". */
export function usd(amount: number): string {
  return usdFormatter.format(Math.round(amount));
}

/** ISO date (YYYY-MM-DD) for a Date in local time. */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True if two YYYY-MM-DD date strings are the same day. */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** True if `prev` (YYYY-MM-DD) is exactly one calendar day before `today`. */
export function isYesterday(prev: string, today: string): boolean {
  const t = new Date(today + "T00:00:00");
  t.setDate(t.getDate() - 1);
  return isoDay(t) === prev;
}
