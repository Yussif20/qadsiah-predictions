import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Gift, RotateCcw } from "lucide-react";
import type { Prediction } from "@/types";
import { teamDisplayName } from "@/lib/constants";
import { celebrationBurst } from "@/lib/confetti";
import { saveWheelSpin } from "@/lib/firestore";
import { useMatch } from "@/hooks/useMatches";
import { useMatchWinners } from "@/hooks/useMatchWinners";
import { LuckyWheel, SPIN_SECONDS, type SpinTarget } from "@/components/wheel/LuckyWheel";
import { FullScreenSpinner } from "@/components/ui/Spinner";

function secureRandomIndex(length: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % length;
}

export function WheelPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { t, i18n } = useTranslation("admin");
  const ar = i18n.language === "ar";
  const { match, loading } = useMatch(matchId);
  const completed = match?.status === "completed";
  const { winners, loading: winnersLoading } = useMatchWinners(matchId ?? "", completed);

  const [target, setTarget] = useState<SpinTarget | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [revealedWinner, setRevealedWinner] = useState<Prediction | null>(null);
  // Drawn IDs tracked locally as well — the Firestore snapshot lags the save,
  // and an instant re-spin must already exclude the name just drawn.
  const [localDrawn, setLocalDrawn] = useState<ReadonlySet<string>>(new Set());
  const pendingRef = useRef<Prediction | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Names already drawn (including the current prize winner) stay off the wheel.
  const drawnIds = useMemo(
    () => new Set([...(match?.wheelSpins ?? []).map((s) => s.predictionId), ...localDrawn]),
    [match?.wheelSpins, localDrawn]
  );
  const available = useMemo(
    () => winners.filter((w) => !drawnIds.has(w.id)),
    [winners, drawnIds]
  );

  if (loading || (completed && winnersLoading)) return <FullScreenSpinner />;

  const BackArrow = ar ? ArrowRight : ArrowLeft;
  const matchTitle = match
    ? `${teamDisplayName(match.home, i18n.language)} × ${teamDisplayName(match.away, i18n.language)}`
    : "";

  const spin = () => {
    if (!match || spinning || available.length === 0) return;
    const index = secureRandomIndex(available.length);
    pendingRef.current = available[index];
    setRevealedWinner(null);
    setSpinning(true);
    setTarget((prev) => ({
      index,
      nonce: Date.now(),
      seq: (prev?.seq ?? 0) + 1,
      count: available.length,
    }));
    // transitionend can be missed if the tab is backgrounded — fall back.
    fallbackRef.current = setTimeout(onSpinEnd, (SPIN_SECONDS + 1.5) * 1000);
  };

  const onSpinEnd = async () => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    const winner = pendingRef.current;
    if (!match || !winner) return; // already handled (transitionend + fallback dedup)
    pendingRef.current = null;
    setSpinning(false);
    setRevealedWinner(winner);
    setLocalDrawn((prev) => new Set([...prev, winner.id]));
    celebrationBurst();
    try {
      await saveWheelSpin(
        match.id,
        { predictionId: winner.id, name: winner.name, spunAtMs: Date.now() },
        { predictionId: winner.id, name: winner.name, phoneMasked: winner.phoneMasked }
      );
      toast.success(t("wheel.saved"));
    } catch {
      toast.error(t("login.error"));
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link
        to={`/admin/matches/${matchId}`}
        className="absolute top-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground ltr:left-5 rtl:right-5"
      >
        <BackArrow className="size-4" />
        {t("wheel.back")}
      </Link>

      {!match || !completed ? (
        <p className="rounded-xl border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          {t("wheel.needsResult")}
        </p>
      ) : winners.length === 0 ? (
        <p className="rounded-xl border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          {t("wheel.noWinners")}
        </p>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-black text-primary sm:text-4xl">{matchTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("common:winners.prizeWinner")}
            </p>
          </div>

          <LuckyWheel
            entries={available.map((w) => ({ id: w.id, name: w.name }))}
            target={target}
            onSpinEnd={onSpinEnd}
            className="w-full"
          />

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={spin}
              disabled={spinning || available.length === 0}
              className="rounded-full bg-primary px-14 py-4 text-2xl font-black text-primary-foreground shadow-[0_0_40px_rgba(249,223,0,0.35)] transition-transform hover:scale-105 disabled:opacity-40"
            >
              {spinning ? t("wheel.spinning") : t("wheel.spin")}
            </button>
            {match.prizeWinner && !spinning && !revealedWinner && (
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <Gift className="size-4" />
                {t("detail.prizeWinner")}: {match.prizeWinner.name}
              </p>
            )}
          </div>
        </>
      )}

      {/* Winner reveal overlay */}
      {revealedWinner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/85 p-6">
          <p className="text-2xl font-bold text-muted-foreground">{t("wheel.winner")}</p>
          <div className="winner-glow rounded-3xl border-2 border-primary bg-card px-10 py-12 text-center sm:px-20">
            <Gift className="mx-auto mb-4 size-12 text-primary" />
            <p className="text-4xl font-black text-primary sm:text-6xl">{revealedWinner.name}</p>
            <p className="mt-3 text-lg text-muted-foreground" dir="ltr">
              {revealedWinner.phoneMasked}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setRevealedWinner(null)}
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-extrabold text-primary-foreground hover:opacity-90"
            >
              {t("wheel.continue")}
            </button>
            {available.length > 0 && (
              <button
                onClick={spin}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                {t("wheel.respin")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
