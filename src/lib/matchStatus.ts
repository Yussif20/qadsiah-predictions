import type { EffectiveMatchStatus, Match } from "@/types";

/**
 * "locked" is never stored — a match whose kickoff time has passed is locked
 * by the clock (and by Firestore rules) until the admin enters the result.
 */
export function effectiveMatchStatus(match: Match, nowMs: number): EffectiveMatchStatus {
  if (match.status === "completed") return "completed";
  return nowMs < match.matchDate.toMillis() ? "upcoming" : "locked";
}
