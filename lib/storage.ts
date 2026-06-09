import { INITIAL_STATE, type CartItem, type NadaState } from "@/lib/types";
import { isSameDay, isYesterday } from "@/lib/format";

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function nextStreak(state: NadaState, today: string): number {
  if (!state.lastActiveDate) return 1;
  if (isSameDay(state.lastActiveDate, today)) return state.streak;
  if (isYesterday(state.lastActiveDate, today)) return state.streak + 1;
  return 1;
}

/** Pure reducer: apply an intercept of `cart` on `today` (YYYY-MM-DD). */
export function recordIntercept(
  state: NadaState,
  cart: CartItem[],
  today: string,
  nowMs: number = Date.now(),
): NadaState {
  const amount = cartTotal(cart);
  return {
    totalSaved: state.totalSaved + amount,
    interceptCount: state.interceptCount + 1,
    streak: nextStreak(state, today),
    lastActiveDate: today,
    saves: [
      { items: cart.map((c) => c.name), amount, timestamp: nowMs },
      ...state.saves,
    ].slice(0, 50),
  };
}

export { INITIAL_STATE };

export const STORAGE_KEY = "nada_state_v1";

export function loadState(): NadaState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: NadaState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
