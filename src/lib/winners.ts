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
  /** null when there were no predictions at all. */
  tier: WinnerTier | null;
  minError: number | null;
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
 * Winners = everyone with the exact score (error 0). If nobody is exact,
 * fall back to all predictions tied at the smallest goal error.
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

  if (predictions.length === 0) {
    return { tier: null, minError: null, winnerIds: new Set(), errors };
  }

  const minError = Math.min(...errors.values());
  const winnerIds = new Set(
    predictions.filter((p) => errors.get(p.id) === minError).map((p) => p.id)
  );
  return {
    tier: minError === 0 ? "exact" : "closest",
    minError,
    winnerIds,
    errors,
  };
}
