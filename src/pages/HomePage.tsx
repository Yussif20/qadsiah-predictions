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
    <div>
      {/* Hero banner — the match card floats over its dark lower third */}
      <div className="rise-in relative overflow-hidden rounded-xl border">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
        {/* dir="ltr" keeps the pair's physical order constant: the WE ARE 26 mark
            on the left and the Qadsiah club crest on the right (first on the
            right) regardless of language/direction. */}
        <div
          dir="ltr"
          className="relative flex items-center justify-center gap-5 px-4 pb-28 pt-10 sm:gap-6 sm:pb-32 sm:pt-12"
        >
          <img
            src="/images/logo.png"
            alt="WE ARE 26"
            className="w-24 rounded-2xl shadow-2xl ring-1 ring-white/20 sm:w-28"
          />
          <img
            src="/images/club-crest.png"
            alt={t("appTagline")}
            className="w-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:w-24"
          />
        </div>
      </div>

      <div className="relative z-10 -mt-20 space-y-8 sm:-mt-24">
        {loading ? (
          <div className="space-y-4">
            <div className="shimmer h-48 rounded-xl border bg-card/40" />
            <div className="shimmer h-72 rounded-xl border bg-card/40" />
          </div>
        ) : !current ? (
          <div
            className="rise-in card-elevated rounded-xl p-8 text-center"
            style={{ animationDelay: "90ms" }}
          >
            <img
              src="/images/steps.jpg"
              alt=""
              className="mx-auto mb-4 w-48 rounded-xl [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
            />
            <p className="text-sm text-muted-foreground">{t("match.noMatches")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rise-in" style={{ animationDelay: "90ms" }}>
              <MatchHero match={current.match} />
            </div>

            {current.status === "upcoming" && (
              <>
                <div className="rise-in" style={{ animationDelay: "180ms" }}>
                  <CountdownTimer targetMs={current.match.matchDate.toMillis()} />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    {t("match.predictionsCloseAtKickoff")}
                  </p>
                </div>
                <div className="rise-in" style={{ animationDelay: "270ms" }}>
                  <PredictionForm match={current.match} open />
                </div>
              </>
            )}

            {current.status === "locked" && (
              <>
                <div
                  className="rise-in relative overflow-hidden rounded-xl border border-warning/40"
                  style={{ animationDelay: "180ms" }}
                >
                  <img
                    src="/images/matchday.jpg"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/60" />
                  <div className="relative flex items-center justify-center gap-3 p-6 text-sm font-bold text-warning">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-warning/30 to-warning/5 ring-1 ring-warning/40">
                      <Lock className="size-5" />
                    </span>
                    <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      {t("match.locked")}
                      <span className="block text-xs font-semibold opacity-90">
                        {t("match.lockedHint")}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="rise-in" style={{ animationDelay: "270ms" }}>
                  <PredictionForm match={current.match} open={false} />
                </div>
              </>
            )}

            {current.status === "completed" && (
              <Link
                to="/winners"
                className="btn-cta btn-sheen rise-in flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold"
                style={{ animationDelay: "180ms" }}
              >
                <Trophy className="size-4" />
                {t("nav.winners")}
              </Link>
            )}
          </div>
        )}

        <HowItWorks />
      </div>
    </div>
  );
}
