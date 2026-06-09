import { describe, it, expect } from "vitest";
import {
  addReclaimed,
  INITIAL_SCROLL_STATE,
  type ScrollState,
} from "@/lib/scroll";

const TODAY = "2026-06-09";
const YESTERDAY = "2026-06-08";
const TWO_DAYS_AGO = "2026-06-07";

describe("addReclaimed", () => {
  it("accumulates seconds across two adds", () => {
    const s1 = addReclaimed(INITIAL_SCROLL_STATE, 300, TODAY);
    const s2 = addReclaimed(s1, 200, TODAY);
    expect(s2.secondsReclaimed).toBe(500);
  });

  it("clamps negative seconds to 0", () => {
    const s = addReclaimed(INITIAL_SCROLL_STATE, -100, TODAY);
    expect(s.secondsReclaimed).toBe(0);
  });

  it("rounds fractional seconds", () => {
    const s = addReclaimed(INITIAL_SCROLL_STATE, 90.7, TODAY);
    expect(s.secondsReclaimed).toBe(91);
  });

  describe("streak logic", () => {
    it("starts at 1 on fresh state", () => {
      const s = addReclaimed(INITIAL_SCROLL_STATE, 100, TODAY);
      expect(s.streak).toBe(1);
    });

    it("keeps streak unchanged on same day, but still accumulates seconds", () => {
      const s1 = addReclaimed(INITIAL_SCROLL_STATE, 100, TODAY);
      const s2 = addReclaimed(s1, 200, TODAY);
      expect(s2.streak).toBe(1);
      expect(s2.secondsReclaimed).toBe(300);
    });

    it("increments streak when last active was yesterday", () => {
      const s1: ScrollState = {
        secondsReclaimed: 100,
        streak: 3,
        lastActiveDate: YESTERDAY,
      };
      const s2 = addReclaimed(s1, 100, TODAY);
      expect(s2.streak).toBe(4);
    });

    it("resets streak to 1 after a gap of more than one day", () => {
      const s1: ScrollState = {
        secondsReclaimed: 100,
        streak: 5,
        lastActiveDate: TWO_DAYS_AGO,
      };
      const s2 = addReclaimed(s1, 100, TODAY);
      expect(s2.streak).toBe(1);
    });
  });

  it("sets lastActiveDate to today", () => {
    const s = addReclaimed(INITIAL_SCROLL_STATE, 100, TODAY);
    expect(s.lastActiveDate).toBe(TODAY);
  });
});
