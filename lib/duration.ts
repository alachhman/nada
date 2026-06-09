/**
 * Format a duration in total seconds to a human-readable string.
 * < 60s    → "<1 min"
 * < 3600s  → "${round(s/60)} min"  (0 also → "<1 min")
 * >= 3600s → "${h}h ${m}m" or "${h}h" when m===0
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return "<1 min";
  if (totalSeconds < 3600) {
    const mins = Math.round(totalSeconds / 60);
    if (mins === 0) return "<1 min";
    return `${mins} min`;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
