import type { WinnerTier } from "@/types";

export interface ScorePair {
  scoreHome: number;
  scoreAway: number;
}

export interface PredictionLike {
  id: string;
  predictedScoreHome: number;
  predictedScoreAway: number;
}

export interface WinnersResult {
  /** "exact" when at least one prediction is exact, else null. */
  tier: WinnerTier | null;
  winnerIds: Set<string>;
  /** goalError per prediction id — persisted so the admin table can show it. */
  errors: Map<string, number>;
}

/** Sum of absolute goal differences between a prediction and the actual score. */
export function goalError(predicted: ScorePair, actual: ScorePair): number {
  return (
    Math.abs(predicted.scoreHome - actual.scoreHome) +
    Math.abs(predicted.scoreAway - actual.scoreAway)
  );
}

/**
 * Winners = everyone who predicted the exact score (goal error 0). If nobody
 * is exact, the match simply has no winners. `errors` is still filled for
 * every prediction so the admin table can show each entry's goal error.
 */
export function computeWinners(predictions: PredictionLike[], actual: ScorePair): WinnersResult {
  const errors = new Map<string, number>();
  for (const p of predictions) {
    errors.set(
      p.id,
      goalError(
        { scoreHome: p.predictedScoreHome, scoreAway: p.predictedScoreAway },
        actual
      )
    );
  }

  const winnerIds = new Set(
    predictions.filter((p) => errors.get(p.id) === 0).map((p) => p.id)
  );
  return {
    tier: winnerIds.size > 0 ? "exact" : null,
    winnerIds,
    errors,
  };
}
