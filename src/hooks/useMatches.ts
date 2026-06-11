import { useEffect, useState } from "react";
import { doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { matchesCol, snapToMatch } from "@/lib/firestore";
import type { Match } from "@/types";

/** All matches, live, sorted by kickoff time ascending. */
export function useMatches() {
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(
    () =>
      onSnapshot(query(matchesCol, orderBy("matchDate", "asc")), (snap) =>
        setMatches(snap.docs.map(snapToMatch))
      ),
    []
  );

  return { matches: matches ?? [], loading: matches === null };
}

/** Single match, live. `match` is null when missing, `loading` until first snapshot. */
export function useMatch(matchId: string | undefined) {
  // The snapshot is stored together with the id it belongs to, so a stale
  // result for a previous id is simply ignored instead of being cleared
  // synchronously in the effect.
  const [state, setState] = useState<{ id: string; match: Match | null } | null>(null);

  useEffect(() => {
    if (!matchId) return;
    return onSnapshot(doc(matchesCol, matchId), (snap) =>
      setState({ id: matchId, match: snap.exists() ? snapToMatch(snap) : null })
    );
  }, [matchId]);

  const current = state !== null && state.id === matchId ? state.match : null;
  return {
    match: current,
    loading: !!matchId && (state === null || state.id !== matchId),
  };
}
