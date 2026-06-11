/**
 * football-data.org client (free tier: 10 req/min, admin-only usage).
 *
 * Routed through a same-origin /football-api proxy: the Netlify function in
 * production, the Vite dev proxy locally — both inject X-Auth-Token
 * server-side so the key never reaches the browser bundle.
 */

import type { Stage } from "@/types";

const BASE_URL = "/football-api/v4";

/** FIFA World Cup competition ID per football-data.org's lookup table. */
export const WC_COMPETITION_ID = 2000;

export type FdStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

export interface FdMatch {
  id: number;
  utcDate: string;
  status: FdStatus;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: { id: number | null; name: string | null; shortName: string | null; crest: string | null };
  awayTeam: { id: number | null; name: string | null; shortName: string | null; crest: string | null };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
  venue: string | null;
}

// ─── Rate limiter ───
// Serialized queue so concurrent callers can't race past the 10/min cap.
let lastRequestTime = 0;
let queue: Promise<unknown> = Promise.resolve();
const MIN_REQUEST_INTERVAL = 6500;

async function claimSlot(): Promise<void> {
  const waitForTurn = queue.then(async () => {
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL) {
      await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
    }
    lastRequestTime = Date.now();
  });
  queue = waitForTurn.catch(() => {});
  await waitForTurn;
}

async function rateLimitedFetch<T>(endpoint: string): Promise<T> {
  await claimSlot();
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (res.status === 429) {
    throw new Error("rate-limit");
  }
  if (res.status === 403) {
    throw new Error("forbidden");
  }
  if (!res.ok) {
    throw new Error(`api-error-${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public functions ───

export function isSaudiTeam(name: string | null | undefined): boolean {
  return !!name && name.toLowerCase().includes("saudi");
}

/** All World Cup matches, soonest first. Callers filter (e.g. Saudi-only). */
export async function getWorldCupMatches(): Promise<FdMatch[]> {
  const data = await rateLimitedFetch<{ matches: FdMatch[] }>(
    `/competitions/${WC_COMPETITION_ID}/matches`
  );
  return data.matches.sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  );
}

/** Single match by football-data.org ID — used for score sync. */
export async function getApiMatch(apiMatchId: number): Promise<FdMatch> {
  return rateLimitedFetch<FdMatch>(`/matches/${apiMatchId}`);
}

// ─── Mapping helpers ───

/** WC 2026 has 48 teams, so the bracket starts at a Round of 32. */
export function mapApiStage(apiStage: string): Stage {
  const stageMap: Record<string, Stage> = {
    GROUP_STAGE: "group",
    LAST_32: "round32",
    ROUND_OF_32: "round32",
    PLAYOFF_ROUND: "round32",
    LAST_16: "round16",
    ROUND_OF_16: "round16",
    QUARTER_FINALS: "quarter",
    SEMI_FINALS: "semi",
    THIRD_PLACE: "third",
    FINAL: "final",
  };
  return stageMap[apiStage] ?? "group";
}
