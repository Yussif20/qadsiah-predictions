import { useCallback, useEffect, useState } from "react";
import { getPredictionForPhone, submitPrediction } from "@/lib/firestore";
import { normalizeSaudiPhone } from "@/lib/phone";
import type { Prediction } from "@/types";

const IDENTITY_KEY = "qadsiah-identity";

export interface SavedIdentity {
  name: string;
  /** Normalized "+9665XXXXXXXX". */
  phone: string;
}

function loadIdentity(): SavedIdentity | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedIdentity;
    return parsed.name && parsed.phone ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * The visitor's own prediction for a match, keyed by the phone they last used
 * on this device (kept in localStorage so returning visitors are recognized).
 */
export function useMyPrediction(matchId: string | null) {
  const [identity, setIdentity] = useState<SavedIdentity | null>(() => loadIdentity());
  // Fetched prediction is stored with the key it was fetched for; results for
  // a stale match/phone pair are ignored rather than cleared in the effect.
  const [fetched, setFetched] = useState<{ key: string; prediction: Prediction | null } | null>(
    null
  );

  const key = matchId && identity ? `${matchId}|${identity.phone}` : null;

  useEffect(() => {
    if (!matchId || !identity) return;
    const fetchKey = `${matchId}|${identity.phone}`;
    let cancelled = false;
    getPredictionForPhone(matchId, identity.phone)
      .then((p) => {
        if (!cancelled) setFetched({ key: fetchKey, prediction: p });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: fetchKey, prediction: null });
      });
    return () => {
      cancelled = true;
    };
  }, [matchId, identity]);

  const prediction = key !== null && fetched?.key === key ? fetched.prediction : null;
  const loading = key !== null && fetched?.key !== key;

  const submit = useCallback(
    async (
      name: string,
      rawPhone: string,
      predictedScoreHome: number,
      predictedScoreAway: number
    ): Promise<Prediction> => {
      if (!matchId) throw new Error("no-match");
      const phone = normalizeSaudiPhone(rawPhone);
      if (!phone) throw new Error("invalid-phone");

      const saved = await submitPrediction({
        matchId,
        name,
        phone,
        predictedScoreHome,
        predictedScoreAway,
      });
      const id: SavedIdentity = { name: name.trim(), phone };
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(id));
      setIdentity(id);
      setFetched({ key: `${matchId}|${phone}`, prediction: saved });
      return saved;
    },
    [matchId]
  );

  return { identity, prediction, loading, submit };
}
