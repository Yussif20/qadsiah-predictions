import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Crown, Eye, FerrisWheel, RefreshCw, Save } from "lucide-react";
import type { Match } from "@/types";
import { teamDisplayName } from "@/lib/constants";
import { enterResult } from "@/lib/firestore";
import { getApiMatch } from "@/lib/football-api";
import { formatMatchDate } from "@/lib/format";
import { toLocalFormat } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { useMatch } from "@/hooks/useMatches";
import { useAdminPredictions } from "@/hooks/useAdminPredictions";
import { ScoreInput } from "@/components/predict/ScoreInput";
import { FullScreenSpinner, Spinner } from "@/components/ui/Spinner";

/** Keyed by match id from the parent, so state seeds from the loaded match. */
function ResultEntry({ match }: { match: Match }) {
  const { t, i18n } = useTranslation("admin");
  const [scoreHome, setScoreHome] = useState(() => match.actualScoreHome ?? 0);
  const [scoreAway, setScoreAway] = useState(() => match.actualScoreAway ?? 0);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const completed = match.status === "completed";

  const onSaveResult = async () => {
    setSaving(true);
    try {
      const outcome = await enterResult(match.id, scoreHome, scoreAway);
      toast.success(t("detail.resultSaved", { count: outcome.winnersCount }));
    } catch {
      toast.error(t("login.error"));
    } finally {
      setSaving(false);
    }
  };

  // Pull the score from football-data.org into the steppers; the admin still
  // confirms by saving (which computes winners and resets the wheel).
  const onSyncFromApi = async () => {
    if (!match.apiMatchId) return;
    setSyncing(true);
    try {
      const fd = await getApiMatch(match.apiMatchId);
      const { home, away } = fd.score.fullTime;
      if (home === null || away === null) {
        toast.info(t("api.syncNoScore"));
        return;
      }
      // Imported matches keep the API's home/away order, so this maps directly.
      setScoreHome(home);
      setScoreAway(away);
      toast.success(
        fd.status === "FINISHED" || fd.status === "AWARDED"
          ? t("api.syncFinished")
          : t("api.syncLive")
      );
    } catch {
      toast.error(t("api.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-extrabold">{t("detail.result")}</h2>
        {match.apiMatchId != null && (
          <button
            onClick={onSyncFromApi}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-full border border-primary/50 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <RefreshCw className={syncing ? "size-3.5 animate-spin" : "size-3.5"} />
            {t("api.sync")}
          </button>
        )}
      </div>
      <div className="flex gap-3" dir="ltr">
        <ScoreInput
          label={teamDisplayName(match.home, i18n.language)}
          team={match.home}
          value={scoreHome}
          onChange={setScoreHome}
        />
        <ScoreInput
          label={teamDisplayName(match.away, i18n.language)}
          team={match.away}
          value={scoreAway}
          onChange={setScoreAway}
        />
      </div>
      {completed && (
        <p className="text-xs font-semibold text-warning">{t("detail.resultWarning")}</p>
      )}
      <button
        onClick={onSaveResult}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Spinner className="size-4 text-primary-foreground" /> : <Save className="size-4" />}
        {t("detail.enterResult")}
      </button>
    </section>
  );
}

export function AdminMatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { t, i18n } = useTranslation("admin");
  const ar = i18n.language === "ar";
  const { match, loading } = useMatch(matchId);
  const { rows, loading: rowsLoading } = useAdminPredictions(matchId);

  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  if (loading) return <FullScreenSpinner />;
  if (!match) {
    return (
      <p className="rounded-xl border bg-card/60 p-10 text-center text-sm text-muted-foreground">
        {t("detail.notFound")}
      </p>
    );
  }

  const completed = match.status === "completed";
  const BackArrow = ar ? ArrowRight : ArrowLeft;
  const winners = rows.filter((r) => r.isWinner);

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <BackArrow className="size-4" />
        {t("detail.back")}
      </Link>

      <div>
        <h1 className="text-2xl font-black">
          {teamDisplayName(match.home, i18n.language)} ×{" "}
          {teamDisplayName(match.away, i18n.language)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatMatchDate(match.matchDate.toDate(), i18n.language)}
        </p>
      </div>

      <ResultEntry key={match.id} match={match} />

      {/* Winners + wheel */}
      {completed && (
        <section className="space-y-3 rounded-xl border bg-card/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-extrabold">
              {t("detail.winners")}{" "}
              <span className="text-sm font-semibold text-muted-foreground">
                ({winners.length})
              </span>
            </h2>
            {match.winnersCount > 0 ? (
              <Link
                to={`/admin/wheel/${match.id}`}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-extrabold text-accent-foreground hover:opacity-90"
              >
                <FerrisWheel className="size-4" />
                {t("detail.openWheel")}
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">{t("detail.wheelNeedsResult")}</p>
            )}
          </div>
          {match.prizeWinner && (
            <p className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm font-bold text-primary">
              <Crown className="size-4" />
              {t("detail.prizeWinner")}: {match.prizeWinner.name}
            </p>
          )}
          <ul className="flex flex-wrap gap-2">
            {winners.map((w) => (
              <li
                key={w.id}
                className="rounded-full border bg-secondary/60 px-3 py-1.5 text-sm font-semibold"
              >
                {w.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Predictions table */}
      <section className="rounded-xl border bg-card/60 p-5">
        <h2 className="mb-3 text-base font-extrabold">
          {t("detail.predictions")}{" "}
          <span className="text-sm font-semibold text-muted-foreground">({rows.length})</span>
        </h2>
        {rowsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="size-6" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("detail.noPredictions")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 text-start font-bold">{t("detail.name")}</th>
                  <th className="py-2 text-start font-bold">{t("detail.phone")}</th>
                  <th className="py-2 text-center font-bold">{t("detail.prediction")}</th>
                  <th className="py-2 text-center font-bold">{t("detail.goalError")}</th>
                  <th className="py-2 text-center font-bold">{t("detail.winner")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn("border-b border-border/50", row.isWinner && "bg-primary/5")}
                  >
                    <td className="py-2 font-semibold">{row.name}</td>
                    <td className="py-2" dir="ltr">
                      {row.phone ? (
                        revealed.has(row.id) ? (
                          <span className="font-mono">{toLocalFormat(row.phone)}</span>
                        ) : (
                          <button
                            onClick={() => toggleReveal(row.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                            {row.phoneMasked}
                          </button>
                        )
                      ) : (
                        row.phoneMasked
                      )}
                    </td>
                    <td className="py-2 text-center font-display text-lg" dir="ltr">
                      {`${row.predictedScoreHome} : ${row.predictedScoreAway}`}
                    </td>
                    <td className="py-2 text-center text-muted-foreground">
                      {row.goalError ?? "—"}
                    </td>
                    <td className="py-2 text-center">
                      {row.isWinner && <Crown className="mx-auto size-4 text-primary" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
