import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, resetState, STORAGE_KEY } from "@/lib/storage";
import { INITIAL_STATE } from "@/lib/types";

beforeEach(() => localStorage.clear());

describe("persistence", () => {
  it("returns INITIAL_STATE when nothing is stored", () => {
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it("round-trips a saved state", () => {
    const s = { ...INITIAL_STATE, totalSaved: 203, interceptCount: 1 };
    saveState(s);
    expect(loadState()).toEqual(s);
  });

  it("returns INITIAL_STATE when stored JSON is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it("resetState clears storage back to initial", () => {
    saveState({ ...INITIAL_STATE, totalSaved: 999 });
    resetState();
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});
