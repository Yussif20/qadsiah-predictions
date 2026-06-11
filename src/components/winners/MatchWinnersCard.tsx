import { useTranslation } from "react-i18next";
import { Crown, Gift } from "lucide-react";
import type { Match } from "@/types";
import { teamDisplayName } from "@/lib/constants";
import { formatMatchDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMatchWinners } from "@/hooks/useMatchWinners";
import { TeamFlag } from "@/components/ui/CountryFlag";
import { Spinner } from "@/components/ui/Spinner";

export function MatchWinnersCard({ match }: { match: Match }) {
  const { t, i18n } = useTranslation();
  const { winners, loading } = useMatchWinners(match.id);

  return (
    <article className="rounded-xl border bg-card/60 p-5">
      {/* Match header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex items-center gap-2" dir="ltr">
            <TeamFlag team={match.home} size="sm" />
            <span className="font-display text-2xl">
              {match.actualScoreHome} : {match.actualScoreAway}
            </span>
            <TeamFlag team={match.away} size="sm" />
          </span>
          <span className="ms-1">
            {teamDisplayName(match.home, i18n.language)} ×{" "}
            {teamDisplayName(match.away, i18n.language)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatMatchDate(match.matchDate.toDate(), i18n.language)}
        </span>
      </div>

      {/* Prize winner */}
      {match.prizeWinner && (
        <div className="winner-glow mb-4 flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
          <Gift className="size-8 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] font-bold text-muted-foreground">{t("winners.prizeWinner")}</p>
            <p className="text-lg font-extrabold text-primary">{match.prizeWinner.name}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {match.prizeWinner.phoneMasked}
            </p>
          </div>
        </div>
      )}

      {/* Winners list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner className="size-5" />
        </div>
      ) : winners.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">{t("winners.noWinners")}</p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5",
                match.winnerTier === "exact"
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              )}
            >
              {match.winnerTier === "exact" ? t("winners.exact") : t("winners.closest")}
            </span>
            <span>{t("winners.winnersCount", { count: winners.length })}</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {winners.map((w) => {
              const isPrize = match.prizeWinner?.predictionId === w.id;
              return (
                <li
                  key={w.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1.5 text-sm",
                    isPrize && "border-primary text-primary"
                  )}
                >
                  {isPrize && <Crown className="size-3.5" />}
                  <span className="font-semibold">{w.name}</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {w.phoneMasked}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </article>
  );
}
