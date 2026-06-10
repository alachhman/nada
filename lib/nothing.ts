import type { SaveEntry } from "@/lib/types";

export interface NothingStage {
  label: string;
  sublabel: string;
}

export const NOTHING_STAGES: NothingStage[] = [
  {
    label: "Order intercepted",
    sublabel: "Our warehouse is carefully packing nothing.",
  },
  {
    label: "Your nothing has shipped",
    sublabel: "It weighs nothing. The courier is thrilled.",
  },
  {
    label: "Your money is staying home",
    sublabel: "Out for non-delivery.",
  },
  {
    label: "Delivered: nothing",
    sublabel: "Enjoy. Your money never left.",
  },
];

export interface NothingStatus {
  index: number;
  total: number;
  label: string;
  sublabel: string;
  progress: number;
}

const MS_2MIN = 2 * 60 * 1000;
const MS_1H = 60 * 60 * 1000;
const MS_24H = 24 * 60 * 60 * 1000;

/**
 * Derive the nothing-tracker status for a given elapsed time in milliseconds
 * since the intercept was recorded.
 *
 * Stage thresholds:
 *   index 0: elapsed < 2 min
 *   index 1: elapsed < 1 h
 *   index 2: elapsed < 24 h
 *   index 3: elapsed ≥ 24 h
 *
 * progress = clamp(elapsed / 24h, 0, 1).
 * Negative elapsed → stage 0, progress 0.
 */
export function nothingStageFor(elapsedMs: number): NothingStatus {
  const elapsed = elapsedMs < 0 ? 0 : elapsedMs;
  const progress = Math.min(elapsed / MS_24H, 1);

  let index: number;
  if (elapsed < MS_2MIN) {
    index = 0;
  } else if (elapsed < MS_1H) {
    index = 1;
  } else if (elapsed < MS_24H) {
    index = 2;
  } else {
    index = 3;
  }

  const stage = NOTHING_STAGES[index];
  return {
    index,
    total: NOTHING_STAGES.length,
    label: stage.label,
    sublabel: stage.sublabel,
    progress,
  };
}

/**
 * Total items kept out of the house across all saves.
 * Uses itemCount when present (new entries) and falls back to items.length
 * for legacy entries that predate the itemCount field.
 */
export function itemsKeptOut(saves: SaveEntry[]): number {
  return saves.reduce(
    (sum, save) => sum + (save.itemCount ?? save.items.length),
    0,
  );
}
