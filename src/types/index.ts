import type { Timestamp } from "firebase/firestore";

export type Stage =
  | "group"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "third"
  | "final";

/** Stored status. "locked" is never stored — it is derived from the clock. */
export type MatchStatus = "upcoming" | "completed";

/** What the UI shows: upcoming (open), locked (kicked off, no result yet), completed. */
export type EffectiveMatchStatus = "upcoming" | "locked" | "completed";

export type WinnerTier = "exact" | "closest";

export interface TeamInfo {
  /** English display name. */
  name: string;
  /** Arabic display name. */
  nameAr: string;
  /** flagcdn.com code, e.g. "sa", "mx", "gb-eng". */
  flag: string;
  /**
   * football-data.org crest image URL — takes display priority over `flag`.
   * Set on API import for teams missing from TEAM_MAPPINGS, so every team
   * gets a correct image even without a hand-mapped ISO code.
   */
  crest?: string | null;
}

export interface WheelSpin {
  predictionId: string;
  name: string;
  /** Client-side ms timestamp — serverTimestamp() is not allowed inside arrays. */
  spunAtMs: number;
}

export interface PrizeWinner {
  predictionId: string;
  name: string;
  phoneMasked: string;
}

/**
 * Generic two-team fixture; `home`/`away` is just the fixture order (the
 * tournament is on neutral ground, so no home/away labels appear in the UI).
 * The venue's main event is Saudi matches, but the admin can add any World
 * Cup game (e.g. for testing or screening a final).
 */
export interface Match {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  stage: Stage;
  matchDate: Timestamp;
  status: MatchStatus;
  actualScoreHome: number | null;
  actualScoreAway: number | null;
  /** Tier of this match's winners — "exact", or "closest" when nobody was exact. */
  winnerTier: WinnerTier | null;
  winnersCount: number;
  prizeWinner: PrizeWinner | null;
  /** Every wheel spin including re-spins, for transparency. */
  wheelSpins: WheelSpin[];
  /** football-data.org match ID when imported from the API — enables score sync. */
  apiMatchId: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Document ID = `{matchId}_{sha256(normalizedPhone)}`. */
export interface Prediction {
  id: string;
  matchId: string;
  name: string;
  /** e.g. "050•••••67" — full phone never stored here (public collection). */
  phoneMasked: string;
  predictedScoreHome: number;
  predictedScoreAway: number;
  isWinner: boolean;
  winnerTier: WinnerTier | null;
  /** |Δhome| + |Δaway| vs the actual score; null until the result is in. */
  goalError: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Admin-only collection holding the full phone. Doc ID mirrors the prediction ID. */
export interface Contact {
  id: string;
  matchId: string;
  name: string;
  /** Normalized international format: "+9665XXXXXXXX". */
  phone: string;
  createdAt: Timestamp;
}
