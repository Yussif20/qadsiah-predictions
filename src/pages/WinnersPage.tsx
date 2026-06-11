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
      <div className="text-center">
        <h1 className="text-3xl font-black text-primary">{t("winners.title")}</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {t("winners.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="shimmer h-40 rounded-xl border bg-card/40" />
          <div className="shimmer h-40 rounded-xl border bg-card/40" />
        </div>
      ) : completed.length === 0 ? (
        <div className="rounded-xl border bg-card/60 p-10 text-center">
          <Trophy className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("winners.noCompleted")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((m) => (
            <MatchWinnersCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
