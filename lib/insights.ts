import { usd } from "@/lib/format";
import { formatDuration } from "@/lib/duration";

export interface WeeklySummaryInput {
  /** Total money intercepted (from NadaState.totalSaved). */
  totalSaved: number;
  /** Number of cravings handled / intercepts (from NadaState.interceptCount). */
  cravingsHandled: number;
  /** Seconds of scroll time reclaimed (from ScrollState.secondsReclaimed). */
  secondsReclaimed: number;
}

export interface WeeklySummaryLines {
  /** e.g. "you didn't spend $128" */
  spend: string;
  /** e.g. "3 cravings handled" / "1 craving handled" */
  cravings: string;
  /** e.g. "12 min reclaimed" */
  reclaimed: string;
}

/**
 * Pure: build the human-readable lines for the nada+ weekly report from
 * already-tracked state. No new data is collected — this only derives copy.
 * Pluralizes "craving(s)" correctly.
 */
export function buildWeeklySummary(input: WeeklySummaryInput): WeeklySummaryLines {
  const n = Math.max(0, Math.round(input.cravingsHandled));
  return {
    spend: `you didn't spend ${usd(input.totalSaved)}`,
    cravings: `${n} ${n === 1 ? "craving" : "cravings"} handled`,
    reclaimed: `${formatDuration(input.secondsReclaimed)} reclaimed`,
  };
}
