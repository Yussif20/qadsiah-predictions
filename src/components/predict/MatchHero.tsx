import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import type { Match, TeamInfo } from "@/types";
import { STAGE_LABEL_KEYS, teamDisplayName } from "@/lib/constants";
import { formatMatchDate } from "@/lib/format";
import { TeamFlag } from "@/components/ui/CountryFlag";

function TeamBlock({ team, lang }: { team: TeamInfo; lang: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <TeamFlag team={team} size="lg" />
      <span className="text-center text-base font-extrabold sm:text-lg">
        {teamDisplayName(team, lang)}
      </span>
    </div>
  );
}

export function MatchHero({ match }: { match: Match }) {
  const { t, i18n } = useTranslation();
  const completed = match.status === "completed";

  return (
    <section className="rounded-xl border bg-card/60 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/15 px-3 py-1 font-bold text-primary">
          {t(STAGE_LABEL_KEYS[match.stage])}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatMatchDate(match.matchDate.toDate(), i18n.language)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2" dir="ltr">
        <TeamBlock team={match.home} lang={i18n.language} />
        <div className="px-1 text-center">
          {completed ? (
            <span className="font-display text-5xl text-foreground sm:text-6xl">
              {match.actualScoreHome} <span className="text-primary">:</span>{" "}
              {match.actualScoreAway}
            </span>
          ) : (
            <span className="font-display text-3xl text-primary sm:text-4xl">{t("vs")}</span>
          )}
        </div>
        <TeamBlock team={match.away} lang={i18n.language} />
      </div>

      {completed && (
        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
          {t("match.completed")}
        </p>
      )}
    </section>
  );
}
