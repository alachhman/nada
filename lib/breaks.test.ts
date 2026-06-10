import { describe, it, expect } from "vitest";
import {
  recordBreak,
  INITIAL_BREAK_STATE,
  type BreakState,
} from "@/lib/breaks";

const TODAY = "2026-06-10";
const YESTERDAY = "2026-06-09";
const TWO_DAYS_AGO = "2026-06-08";

describe("recordBreak", () => {
  it("increments breaksTaken by 1 per call", () => {
    const s1 = recordBreak(INITIAL_BREAK_STATE, 60, TODAY);
    expect(s1.breaksTaken).toBe(1);
    const s2 = recordBreak(s1, 60, TODAY);
    expect(s2.breaksTaken).toBe(2);
  });

  it("accumulates secondsAway across two calls", () => {
    const s1 = recordBreak(INITIAL_BREAK_STATE, 180, TODAY);
    const s2 = recordBreak(s1, 120, TODAY);
    expect(s2.secondsAway).toBe(300);
  });

  it("clamps negative seconds to 0", () => {
    const s = recordBreak(INITIAL_BREAK_STATE, -90, TODAY);
    expect(s.secondsAway).toBe(0);
    expect(s.breaksTaken).toBe(1);
  });

  it("rounds fractional seconds", () => {
    const s = recordBreak(INITIAL_BREAK_STATE, 60.7, TODAY);
    expect(s.secondsAway).toBe(61);
  });

  it("sets lastActiveDate to today", () => {
    const s = recordBreak(INITIAL_BREAK_STATE, 60, TODAY);
    expect(s.lastActiveDate).toBe(TODAY);
  });

  describe("streak logic", () => {
    it("starts at 1 on fresh state", () => {
      const s = recordBreak(INITIAL_BREAK_STATE, 60, TODAY);
      expect(s.streak).toBe(1);
    });

    it("keeps streak unchanged on same day, but still accumulates seconds", () => {
      const s1 = recordBreak(INITIAL_BREAK_STATE, 60, TODAY);
      const s2 = recordBreak(s1, 120, TODAY);
      expect(s2.streak).toBe(1);
      expect(s2.secondsAway).toBe(180);
    });

    it("increments streak when last active was yesterday", () => {
      const s1: BreakState = {
        breaksTaken: 2,
        secondsAway: 360,
        streak: 3,
        lastActiveDate: YESTERDAY,
      };
      const s2 = recordBreak(s1, 60, TODAY);
      expect(s2.streak).toBe(4);
    });

    it("resets streak to 1 after a gap of more than one day", () => {
      const s1: BreakState = {
        breaksTaken: 5,
        secondsAway: 900,
        streak: 5,
        lastActiveDate: TWO_DAYS_AGO,
      };
      const s2 = recordBreak(s1, 60, TODAY);
      expect(s2.streak).toBe(1);
    });
  });
});
