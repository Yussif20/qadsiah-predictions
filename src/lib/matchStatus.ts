import type { EffectiveMatchStatus, Match } from "@/types";
import { PREDICTIONS_OPEN_BEFORE_MS } from "@/lib/constants";

/**
 * "locked" is never stored — a match whose kickoff time has passed is locked
 * by the clock (and by Firestore rules) until the admin enters the result.
 */
export function effectiveMatchStatus(match: Match, nowMs: number): EffectiveMatchStatus {
  if (match.status === "completed") return "completed";
  return nowMs < match.matchDate.toMillis() ? "upcoming" : "locked";
}

/** The instant predictions open: PREDICTIONS_OPEN_BEFORE_MS before kickoff. */
export function predictionsOpenAtMs(match: Match): number {
  return match.matchDate.toMillis() - PREDICTIONS_OPEN_BEFORE_MS;
}

/**
 * Whether predictions are currently accepted: only inside the window
 * [kickoff − PREDICTIONS_OPEN_BEFORE_MS, kickoff) of an upcoming match. This
 * mirrors the Firestore `matchOpen` rule, which is the real enforcement — the
 * UI gate is cosmetic.
 */
export function predictionsOpen(match: Match, nowMs: number): boolean {
  return (
    match.status === "upcoming" &&
    nowMs >= predictionsOpenAtMs(match) &&
    nowMs < match.matchDate.toMillis()
  );
}
