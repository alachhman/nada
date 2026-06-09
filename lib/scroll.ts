import { isSameDay, isYesterday } from "@/lib/format";

export interface ScrollState {
  secondsReclaimed: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export const INITIAL_SCROLL_STATE: ScrollState = {
  secondsReclaimed: 0,
  streak: 0,
  lastActiveDate: null,
};

function nextStreak(state: ScrollState, today: string): number {
  if (!state.lastActiveDate) return 1;
  if (isSameDay(state.lastActiveDate, today)) return state.streak;
  if (isYesterday(state.lastActiveDate, today)) return state.streak + 1;
  return 1;
}

/** Pure: add `seconds` of reclaimed scroll time on `today` (YYYY-MM-DD). */
export function addReclaimed(
  state: ScrollState,
  seconds: number,
  today: string,
): ScrollState {
  return {
    secondsReclaimed: state.secondsReclaimed + Math.max(0, Math.round(seconds)),
    streak: nextStreak(state, today),
    lastActiveDate: today,
  };
}
