import { describe, expect, it } from "vitest";
import type { Match } from "@/types";
import { effectiveMatchStatus, predictionsOpen, predictionsOpenAtMs } from "./matchStatus";
import { PREDICTIONS_OPEN_BEFORE_MS } from "./constants";

const HOUR = 60 * 60 * 1000;
const KICKOFF = 10_000_000_000; // arbitrary fixed epoch ms

/** Minimal Match stub — these helpers only read `status` and `matchDate`. */
const match = (status: Match["status"], kickoffMs = KICKOFF) =>
  ({ status, matchDate: { toMillis: () => kickoffMs } }) as Match;

describe("effectiveMatchStatus", () => {
  it("is upcoming before kickoff and locked after, regardless of the open window", () => {
    expect(effectiveMatchStatus(match("upcoming"), KICKOFF - 5 * HOUR)).toBe("upcoming");
    expect(effectiveMatchStatus(match("upcoming"), KICKOFF + HOUR)).toBe("locked");
    expect(effectiveMatchStatus(match("completed"), KICKOFF + HOUR)).toBe("completed");
  });
});

describe("predictionsOpenAtMs", () => {
  it("is PREDICTIONS_OPEN_BEFORE_MS before kickoff", () => {
    expect(predictionsOpenAtMs(match("upcoming"))).toBe(KICKOFF - PREDICTIONS_OPEN_BEFORE_MS);
  });
});

describe("predictionsOpen", () => {
  it("is closed before the window opens", () => {
    expect(predictionsOpen(match("upcoming"), KICKOFF - PREDICTIONS_OPEN_BEFORE_MS - 1)).toBe(false);
  });

  it("opens exactly at the window boundary", () => {
    expect(predictionsOpen(match("upcoming"), KICKOFF - PREDICTIONS_OPEN_BEFORE_MS)).toBe(true);
  });

  it("is open inside the window", () => {
    expect(predictionsOpen(match("upcoming"), KICKOFF - HOUR)).toBe(true);
  });

  it("closes at kickoff", () => {
    expect(predictionsOpen(match("upcoming"), KICKOFF)).toBe(false);
    expect(predictionsOpen(match("upcoming"), KICKOFF + 1)).toBe(false);
  });

  it("is never open for a completed match, even inside the time window", () => {
    expect(predictionsOpen(match("completed"), KICKOFF - HOUR)).toBe(false);
  });
});
