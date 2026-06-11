import { useEffect, useState } from "react";
import { getMatchWinners } from "@/lib/firestore";
import type { Prediction } from "@/types";

/** Winners of a completed match (readable publicly once completed). */
export function useMatchWinners(matchId: string, enabled = true) {
  const [winners, setWinners] = useState<Prediction[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getMatchWinners(matchId)
      .then((w) => {
        if (!cancelled) setWinners(w);
      })
      .catch(() => {
        if (!cancelled) setWinners([]);
      });
    return () => {
      cancelled = true;
    };
  }, [matchId, enabled]);

  return { winners: winners ?? [], loading: enabled && winners === null };
}
