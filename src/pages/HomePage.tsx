import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Trophy } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { useNow } from "@/hooks/useNow";
import { effectiveMatchStatus } from "@/lib/matchStatus";
import { MatchHero } from "@/components/predict/MatchHero";
import { PredictionForm } from "@/components/predict/PredictionForm";
import { CountdownTimer } from "@/components/predict/CountdownTimer";
import { HowItWorks } from "@/components/predict/HowItWorks";

export function HomePage() {
  const { t } = useTranslation();
  const { matches, loading } = useMatches();
  const now = useNow();

  const withStatus = matches.map((m) => ({ match: m, status: effectiveMatchStatus(m, now) }));
  // Next open match first; otherwise the most recent kicked-off match;
  // otherwise the most recent completed one.
  const current =
    withStatus.find((x) => x.status === "upcoming") ??
    [...withStatus].reverse().find((x) => x.status === "locked") ??
    [...withStatus].reverse().find((x) => x.status === "completed") ??
    null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-primary">{t("appName")}</h1>
        <p className="text-sm text-muted-foreground">{t("appTagline")}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="shimmer h-48 rounded-xl border bg-card/40" />
          <div className="shimmer h-72 rounded-xl border bg-card/40" />
        </div>
      ) : !current ? (
        <div className="rounded-xl border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          {t("match.noMatches")}
        </div>
      ) : (
        <div className="space-y-4">
          <MatchHero match={current.match} />

          {current.status === "upcoming" && (
            <>
              <CountdownTimer targetMs={current.match.matchDate.toMillis()} />
              <p className="text-center text-[11px] text-muted-foreground">
                {t("match.predictionsCloseAtKickoff")}
              </p>
              <PredictionForm match={current.match} open />
            </>
          )}

          {current.status === "locked" && (
            <>
              <div className="flex items-center justify-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm font-semibold text-warning">
                <Lock className="size-5 shrink-0" />
                <span>
                  {t("match.locked")}
                  <span className="block text-xs font-normal opacity-80">
                    {t("match.lockedHint")}
                  </span>
                </span>
              </div>
              <PredictionForm match={current.match} open={false} />
            </>
          )}

          {current.status === "completed" && (
            <Link
              to="/winners"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground hover:opacity-90"
            >
              <Trophy className="size-4" />
              {t("nav.winners")}
            </Link>
          )}
        </div>
      )}

      <HowItWorks />
    </div>
  );
}
