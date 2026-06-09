import { describe, it, expect, beforeEach, vi } from "vitest";

const mem = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (k: string) => (mem.has(k) ? mem.get(k)! : null)),
    setItem: vi.fn(async (k: string, v: string) => { mem.set(k, v); }),
    removeItem: vi.fn(async (k: string) => { mem.delete(k); }),
  },
}));

import { loadState, saveState, resetState, STORAGE_KEY } from "@/lib/storage";
import { INITIAL_STATE } from "@/lib/types";

beforeEach(() => mem.clear());

describe("persistence (AsyncStorage)", () => {
  it("returns INITIAL_STATE when nothing stored", async () => {
    expect(await loadState()).toEqual(INITIAL_STATE);
  });
  it("round-trips a saved state", async () => {
    const s = { ...INITIAL_STATE, totalSaved: 203, interceptCount: 1 };
    await saveState(s);
    expect(await loadState()).toEqual(s);
  });
  it("returns INITIAL_STATE on corrupt JSON", async () => {
    mem.set(STORAGE_KEY, "{not json");
    expect(await loadState()).toEqual(INITIAL_STATE);
  });
  it("resetState clears", async () => {
    await saveState({ ...INITIAL_STATE, totalSaved: 999 });
    await resetState();
    expect(await loadState()).toEqual(INITIAL_STATE);
  });
});
