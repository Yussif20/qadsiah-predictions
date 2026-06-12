import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { MatchWinnersCard } from "@/components/winners/MatchWinnersCard";

export function WinnersPage() {
  const { t } = useTranslation();
  const { matches, loading } = useMatches();

  const completed = matches
    .filter((m) => m.status === "completed")
    .sort((a, b) => b.matchDate.toMillis() - a.matchDate.toMillis());

  return (
    <div className="space-y-6">
      {/* Trophy banner — artwork keeps its empty dark side for the title */}
      <div className="relative overflow-hidden rounded-xl border">
        <img
          src="/images/winners.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/85" />
        <div className="relative px-4 py-12 text-center sm:py-14">
          <h1 className="text-gradient-brand text-3xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-4xl">
            {t("winners.title")}
          </h1>
          <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-foreground/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {t("winners.subtitle")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="shimmer h-40 rounded-xl border bg-card/40" />
          <div className="shimmer h-40 rounded-xl border bg-card/40" />
        </div>
      ) : completed.length === 0 ? (
        <div className="rise-in card-elevated rounded-xl p-10 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-primary/25 to-primary/5 ring-1 ring-primary/30">
            <Trophy className="size-7 text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground">{t("winners.noCompleted")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((m, i) => (
            <div
              key={m.id}
              className="rise-in"
              style={{ animationDelay: `${Math.min(i, 5) * 80}ms` }}
            >
              <MatchWinnersCard match={m} featured={i === 0} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
