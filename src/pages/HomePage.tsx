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
      {/* Hero banner — stadium art with the headline in its dark upper area */}
      <div className="relative overflow-hidden rounded-xl border">
        <img
          src="/images/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
        <div className="relative px-4 pb-24 pt-10 text-center sm:pb-28 sm:pt-12">
          <h1 className="text-3xl font-black text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-4xl">
            {t("appName")}
          </h1>
          <p className="mt-1 text-sm font-semibold text-foreground/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {t("appTagline")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="shimmer h-48 rounded-xl border bg-card/40" />
          <div className="shimmer h-72 rounded-xl border bg-card/40" />
        </div>
      ) : !current ? (
        <div className="rounded-xl border bg-card/60 p-8 text-center">
          <img
            src="/images/steps.jpg"
            alt=""
            className="mx-auto mb-4 w-48 rounded-xl border"
          />
          <p className="text-sm text-muted-foreground">{t("match.noMatches")}</p>
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
              <div className="relative overflow-hidden rounded-xl border border-warning/40">
                <img
                  src="/images/matchday.jpg"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-background/60" />
                <div className="relative flex items-center justify-center gap-3 p-6 text-sm font-bold text-warning">
                  <Lock className="size-5 shrink-0 drop-shadow" />
                  <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                    {t("match.locked")}
                    <span className="block text-xs font-semibold opacity-90">
                      {t("match.lockedHint")}
                    </span>
                  </span>
                </div>
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
