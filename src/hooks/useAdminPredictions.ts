import { useEffect, useMemo, useState } from "react";
import { onSnapshot, query, where } from "firebase/firestore";
import { listMatchContacts, predictionsCol, snapToPrediction } from "@/lib/firestore";
import type { Prediction } from "@/types";

export interface AdminPredictionRow extends Prediction {
  /** Full phone joined from the admin-only contacts collection. */
  phone: string | null;
}

/** Live predictions for a match joined with full phone numbers (admin only). */
export function useAdminPredictions(matchId: string | undefined) {
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [phones, setPhones] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!matchId) return;
    return onSnapshot(query(predictionsCol, where("matchId", "==", matchId)), (snap) =>
      setPredictions(snap.docs.map(snapToPrediction))
    );
  }, [matchId]);

  const count = predictions?.length ?? 0;

  useEffect(() => {
    if (!matchId || count === 0) return;
    let cancelled = false;
    listMatchContacts(matchId)
      .then((contacts) => {
        if (!cancelled) setPhones(new Map(contacts.map((c) => [c.id, c.phone])));
      })
      .catch(() => {
        /* non-admin or offline — table just shows masked numbers */
      });
    return () => {
      cancelled = true;
    };
  }, [matchId, count]);

  const rows: AdminPredictionRow[] = useMemo(
    () =>
      (predictions ?? [])
        .map((p) => ({ ...p, phone: phones.get(p.id) ?? null }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [predictions, phones]
  );

  return { rows, loading: predictions === null };
}
