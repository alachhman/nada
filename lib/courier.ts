export type CourierStatus =
  | "placed"
  | "preparing"
  | "picked_up"
  | "on_the_way"
  | "arriving";

/**
 * Map a 0..1 progress value to a courier status beat.
 * Thresholds:
 *   [0, .15)   -> placed
 *   [.15, .4)  -> preparing
 *   [.4, .6)   -> picked_up
 *   [.6, .92)  -> on_the_way
 *   [.92, 1]   -> arriving
 * Values are clamped to the 0..1 range.
 */
export function statusForProgress(p: number): CourierStatus {
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
  if (clamped < 0.15) return "placed";
  if (clamped < 0.4) return "preparing";
  if (clamped < 0.6) return "picked_up";
  if (clamped < 0.92) return "on_the_way";
  return "arriving";
}

/** Human-readable label for a courier status. */
export function statusLabel(s: CourierStatus): string {
  switch (s) {
    case "placed":
      return "Order placed";
    case "preparing":
      return "Restaurant is preparing your food";
    case "picked_up":
      return "Courier picked up your order";
    case "on_the_way":
      return "On the way to you";
    case "arriving":
      return "Arriving now";
  }
}
