import type { CartItem } from "@/lib/types";

/** Honest minimum wage used for "hours of your life" computation. */
export const WORK_WAGE = 25;

/**
 * How many hours at WORK_WAGE does this price represent, rounded to 1 decimal.
 */
export function hoursOfWork(price: number): number {
  return Math.round((price / WORK_WAGE) * 10) / 10;
}

/**
 * Human-readable weight string.
 * Under 10 lb: one decimal ("3.2 lb").
 * 10 lb and above: whole number ("11 lb").
 */
export function formatWeight(lb: number): string {
  if (lb >= 10) {
    return `${Math.round(lb)} lb`;
  }
  return `${Math.round(lb * 10) / 10} lb`;
}

/**
 * Sum of weightLb × qty across all cart items, rounded to 1 decimal.
 * CartItem doesn't embed product data, so a lookup function resolves weightLb by id.
 * Items whose id resolves to undefined contribute 0.
 */
export function cartWeight(
  items: CartItem[],
  lookup: (id: string) => number | undefined,
): number {
  const total = items.reduce((sum, item) => {
    const w = lookup(item.id) ?? 0;
    return sum + w * item.qty;
  }, 0);
  return Math.round(total * 10) / 10;
}
