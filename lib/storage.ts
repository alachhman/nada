import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_STATE, type CartItem, type NadaState } from "@/lib/types";
import { isSameDay, isYesterday } from "@/lib/format";

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartWeightLb(cart: CartItem[]): number {
  const total = cart.reduce((sum, item) => sum + (item.weightLb ?? 0) * item.qty, 0);
  return Math.round(total * 10) / 10;
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
      {
        items: cart.map((c) => c.name),
        amount,
        timestamp: nowMs,
        itemCount: cart.reduce((s, i) => s + i.qty, 0),
        weightLb: cartWeightLb(cart),
      },
      ...state.saves,
    ].slice(0, 50),
  };
}

export { INITIAL_STATE };

export const STORAGE_KEY = "nada_state_v1";

export async function loadState(): Promise<NadaState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

export async function saveState(state: NadaState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export async function resetState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
