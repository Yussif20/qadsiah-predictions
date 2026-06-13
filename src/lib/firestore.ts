import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { hashPhone, maskPhone } from "./phone";
import { computeWinners } from "./winners";
import type {
  Contact,
  Match,
  Prediction,
  PrizeWinner,
  Stage,
  TeamInfo,
  WheelSpin,
  WinnerTier,
} from "@/types";

export const matchesCol = collection(db, "matches");
export const predictionsCol = collection(db, "predictions");
export const contactsCol = collection(db, "contacts");

export function snapToMatch(snap: DocumentSnapshot): Match {
  const data = snap.data() as Record<string, unknown>;
  // Legacy shape from before the home/away refactor ("opponent" + saudiIsHome
  // fields): normalize on read so old test docs render and can be deleted.
  if (data && !data.home && data.opponent !== undefined) {
    const saudi: TeamInfo = { name: "Saudi Arabia", nameAr: "السعودية", flag: "sa" };
    const opp: TeamInfo = {
      name: (data.opponent as string) ?? "",
      nameAr: (data.opponentAr as string) ?? "",
      flag: (data.opponentFlag as string) ?? "un",
    };
    const saudiHome = data.saudiIsHome !== false;
    return {
      ...(data as unknown as Omit<Match, "id">),
      id: snap.id,
      home: saudiHome ? saudi : opp,
      away: saudiHome ? opp : saudi,
      actualScoreHome:
        (saudiHome ? (data.actualScoreSaudi as number) : (data.actualScoreOpponent as number)) ??
        null,
      actualScoreAway:
        (saudiHome ? (data.actualScoreOpponent as number) : (data.actualScoreSaudi as number)) ??
        null,
    };
  }
  return { id: snap.id, ...(data as unknown as Omit<Match, "id">) };
}

export function snapToPrediction(snap: DocumentSnapshot): Prediction {
  return { id: snap.id, ...(snap.data() as Omit<Prediction, "id">) };
}

export function snapToContact(snap: DocumentSnapshot): Contact {
  return { id: snap.id, ...(snap.data() as Omit<Contact, "id">) };
}

// ───────────────────────── Public (no auth) ─────────────────────────

export function predictionDocId(matchId: string, phoneHash: string): string {
  return `${matchId}_${phoneHash}`;
}

export async function getPredictionForPhone(
  matchId: string,
  normalizedPhone: string
): Promise<Prediction | null> {
  const id = predictionDocId(matchId, await hashPhone(normalizedPhone));
  const snap = await getDoc(doc(predictionsCol, id));
  return snap.exists() ? snapToPrediction(snap) : null;
}

export interface SubmitPredictionInput {
  matchId: string;
  name: string;
  /** Normalized "+9665XXXXXXXX" — see normalizeSaudiPhone(). */
  phone: string;
  predictedScoreHome: number;
  predictedScoreAway: number;
}

/**
 * Create or overwrite the caller's prediction. The doc ID embeds a hash of
 * the phone so the public collection never exposes raw numbers; the full
 * phone goes to the admin-only `contacts` collection in the same batch.
 */
export async function submitPrediction(input: SubmitPredictionInput): Promise<Prediction> {
  const id = predictionDocId(input.matchId, await hashPhone(input.phone));
  const ref = doc(predictionsCol, id);
  const existing = await getDoc(ref);
  const name = input.name.trim();

  const base = {
    matchId: input.matchId,
    name,
    phoneMasked: maskPhone(input.phone),
    predictedScoreHome: input.predictedScoreHome,
    predictedScoreAway: input.predictedScoreAway,
    isWinner: false,
    winnerTier: null,
    goalError: null,
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(ref, existing.exists() ? base : { ...base, createdAt: serverTimestamp() }, {
    merge: true,
  });
  batch.set(
    doc(contactsCol, id),
    { matchId: input.matchId, name, phone: input.phone, createdAt: serverTimestamp() },
    { merge: true }
  );
  await batch.commit();

  const fresh = await getDoc(ref);
  return snapToPrediction(fresh);
}

/** Winners of a completed match — publicly listable once match.status == "completed". */
export async function getMatchWinners(matchId: string): Promise<Prediction[]> {
  const snap = await getDocs(
    query(predictionsCol, where("matchId", "==", matchId), where("isWinner", "==", true))
  );
  return snap.docs.map(snapToPrediction).sort((a, b) => a.name.localeCompare(b.name));
}

// ───────────────────────── Admin ─────────────────────────

export interface MatchInput {
  home: TeamInfo;
  away: TeamInfo;
  stage: Stage;
  matchDate: Date;
  /** Set when the match was imported from football-data.org. */
  apiMatchId?: number | null;
}

function cleanTeam(team: TeamInfo): TeamInfo {
  return {
    name: team.name.trim(),
    nameAr: team.nameAr.trim(),
    flag: team.flag.trim().toLowerCase(),
    crest: team.crest ?? null, // Firestore rejects undefined
  };
}

export async function createMatch(input: MatchInput): Promise<string> {
  const ref = doc(matchesCol);
  await setDoc(ref, {
    ...input,
    home: cleanTeam(input.home),
    away: cleanTeam(input.away),
    apiMatchId: input.apiMatchId ?? null,
    matchDate: Timestamp.fromDate(input.matchDate),
    status: "upcoming",
    actualScoreHome: null,
    actualScoreAway: null,
    winnerTier: null,
    winnersCount: 0,
    prizeWinner: null,
    wheelSpins: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMatch(matchId: string, input: MatchInput): Promise<void> {
  await updateDoc(doc(matchesCol, matchId), {
    ...input,
    home: cleanTeam(input.home),
    away: cleanTeam(input.away),
    apiMatchId: input.apiMatchId ?? null,
    matchDate: Timestamp.fromDate(input.matchDate),
    updatedAt: serverTimestamp(),
  });
}

const BATCH_LIMIT = 450;

export async function deleteMatchCascade(matchId: string): Promise<void> {
  const [preds, contacts] = await Promise.all([
    getDocs(query(predictionsCol, where("matchId", "==", matchId))),
    getDocs(query(contactsCol, where("matchId", "==", matchId))),
  ]);
  const refs = [
    ...preds.docs.map((d) => d.ref),
    ...contacts.docs.map((d) => d.ref),
    doc(matchesCol, matchId),
  ];
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const ref of refs.slice(i, i + BATCH_LIMIT)) batch.delete(ref);
    await batch.commit();
  }
}

export async function listMatchPredictions(matchId: string): Promise<Prediction[]> {
  const snap = await getDocs(query(predictionsCol, where("matchId", "==", matchId)));
  return snap.docs.map(snapToPrediction);
}

export async function listMatchContacts(matchId: string): Promise<Contact[]> {
  const snap = await getDocs(query(contactsCol, where("matchId", "==", matchId)));
  return snap.docs.map(snapToContact);
}

export interface EnterResultOutcome {
  winnersCount: number;
  tier: WinnerTier | null;
}

/**
 * Save the final score, mark winners (exact final score only — no winners if
 * nobody nailed it), and complete the match. Safe to re-run for a corrected
 * result — everything is recomputed,
 * and any earlier wheel outcome is reset since the winner pool changed.
 */
export async function enterResult(
  matchId: string,
  actualScoreHome: number,
  actualScoreAway: number
): Promise<EnterResultOutcome> {
  const predictions = await listMatchPredictions(matchId);
  const result = computeWinners(predictions, {
    scoreHome: actualScoreHome,
    scoreAway: actualScoreAway,
  });

  for (let i = 0; i < predictions.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const p of predictions.slice(i, i + BATCH_LIMIT)) {
      const isWinner = result.winnerIds.has(p.id);
      batch.update(doc(predictionsCol, p.id), {
        isWinner,
        winnerTier: isWinner ? result.tier : null,
        goalError: result.errors.get(p.id) ?? null,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }

  await updateDoc(doc(matchesCol, matchId), {
    actualScoreHome,
    actualScoreAway,
    status: "completed",
    winnerTier: result.tier,
    winnersCount: result.winnerIds.size,
    prizeWinner: null,
    wheelSpins: [],
    updatedAt: serverTimestamp(),
  });

  return { winnersCount: result.winnerIds.size, tier: result.tier };
}

export async function saveWheelSpin(
  matchId: string,
  spin: WheelSpin,
  prizeWinner: PrizeWinner
): Promise<void> {
  await updateDoc(doc(matchesCol, matchId), {
    prizeWinner,
    wheelSpins: arrayUnion(spin),
    updatedAt: serverTimestamp(),
  });
}
