/**
 * lib/catalogAisle.ts
 *
 * Shared helpers for the endless-aisle feature.
 * Extracted from app/aisle.tsx so that non-route modules (index.tsx, tests)
 * can import them without creating route-to-route import cycles.
 */

import { TOTAL_GENERATED } from "@/lib/catalogGen";

// ---------------------------------------------------------------------------
// Category constants
// ---------------------------------------------------------------------------

export const AISLE_CATS = ["Apparel", "Home", "Tech", "Kitchen", "Fitness"] as const;
export type AisleCat = (typeof AISLE_CATS)[number];

export const PAGE_SIZE = 24;

// ---------------------------------------------------------------------------
// Pure pagination helper
// ---------------------------------------------------------------------------

/**
 * Return the next PAGE_SIZE global product indices for the given page,
 * optionally filtered to a single category.
 *
 * Without filter: indices are sequential (0, 1, 2, …).
 * With filter:    walk multiples of 5 starting at catIndex + catOffset * 5.
 *
 * Returns [] when there are no more items (end of catalog).
 */
export function aisleIndicesFor(
  catName: string | undefined,
  page: number,
): number[] {
  const catIndex = catName
    ? AISLE_CATS.indexOf(catName as AisleCat)
    : -1;

  const out: number[] = [];

  if (catIndex < 0) {
    // No filter — plain sequential indices
    const start = page * PAGE_SIZE;
    for (let i = start; i < start + PAGE_SIZE && i < TOTAL_GENERATED; i++) {
      out.push(i);
    }
  } else {
    // Filtered: indices where index % 5 === catIndex
    // Capacity per category = TOTAL_GENERATED / 5 = 1000
    const catStart = page * PAGE_SIZE; // nth product within the category
    for (let k = catStart; k < catStart + PAGE_SIZE && k < TOTAL_GENERATED / 5; k++) {
      out.push(k * 5 + catIndex);
    }
  }

  return out;
}
