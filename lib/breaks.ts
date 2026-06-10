import { isSameDay, isYesterday } from "@/lib/format";

export interface BreakState {
  breaksTaken: number;
  secondsAway: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export const INITIAL_BREAK_STATE: BreakState = {
  breaksTaken: 0,
  secondsAway: 0,
  streak: 0,
  lastActiveDate: null,
};

function nextStreak(state: BreakState, today: string): number {
  if (!state.lastActiveDate) return 1;
  if (isSameDay(state.lastActiveDate, today)) return state.streak;
  if (isYesterday(state.lastActiveDate, today)) return state.streak + 1;
  return 1;
}

/** Pure: record a break of `seconds` duration on `today` (YYYY-MM-DD). */
export function recordBreak(
  state: BreakState,
  seconds: number,
  today: string,
): BreakState {
  return {
    breaksTaken: state.breaksTaken + 1,
    secondsAway: state.secondsAway + Math.max(0, Math.round(seconds)),
    streak: nextStreak(state, today),
    lastActiveDate: today,
  };
}
