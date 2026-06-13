import { useTranslation } from "react-i18next";
import { Crown, Gift } from "lucide-react";
import type { Match } from "@/types";
import { teamDisplayName } from "@/lib/constants";
import { formatMatchDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMatchWinners } from "@/hooks/useMatchWinners";
import { TeamFlag } from "@/components/ui/CountryFlag";
import { Spinner } from "@/components/ui/Spinner";

interface MatchWinnersCardProps {
  match: Match;
  /** Newest completed match — gets the gold treatment and trophy backdrop. */
  featured?: boolean;
}

export function MatchWinnersCard({ match, featured = false }: MatchWinnersCardProps) {
  const { t, i18n } = useTranslation();
  const { winners, loading } = useMatchWinners(match.id);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl p-5",
        featured ? "card-brand" : "card-elevated"
      )}
    >
      {featured && (
        <>
          <img
            src="/images/winners.jpg"
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-15"
          />
          <span className="absolute top-3 end-3 z-10 rounded-full bg-gradient-to-b from-primary/30 to-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/40">
            {t("winners.latest")}
          </span>
        </>
      )}

      <div className="relative">
        {/* Match header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <span className="flex items-center gap-2" dir="ltr">
              <TeamFlag team={match.home} size="sm" className="rounded ring-1 ring-white/10" />
              <span className="font-display text-3xl">
                {match.actualScoreHome} : {match.actualScoreAway}
              </span>
              <TeamFlag team={match.away} size="sm" className="rounded ring-1 ring-white/10" />
            </span>
            <span className="ms-1">
              {teamDisplayName(match.home, i18n.language)} ×{" "}
              {teamDisplayName(match.away, i18n.language)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatMatchDate(match.matchDate.toDate(), i18n.language)}
          </p>
        </div>

        {/* Prize winner */}
        {match.prizeWinner && (
          <div className="winner-glow card-brand mb-4 flex items-center gap-3 rounded-lg p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary/5 ring-1 ring-primary/40">
              <Gift className="size-6 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground">
                {t("winners.prizeWinner")}
              </p>
              <p className="break-words text-xl font-extrabold text-primary sm:text-2xl">
                {match.prizeWinner.name}
              </p>
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
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-success">
                {t("winners.exact")}
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
                      "flex max-w-full items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1.5 text-sm",
                      isPrize && "border-primary/60 bg-primary/10 text-primary"
                    )}
                  >
                    {isPrize && <Crown className="size-3.5 shrink-0" />}
                    <span className="min-w-0 break-words font-semibold">{w.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground" dir="ltr">
                      {w.phoneMasked}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </article>
  );
}
