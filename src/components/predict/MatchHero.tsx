import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import type { Match, TeamInfo } from "@/types";
import { STAGE_LABEL_KEYS, teamDisplayName } from "@/lib/constants";
import { formatMatchDate } from "@/lib/format";
import { TeamFlag } from "@/components/ui/CountryFlag";

function TeamBlock({ team, lang }: { team: TeamInfo; lang: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <TeamFlag team={team} size="lg" className="rounded ring-1 ring-white/10" />
      <span className="max-w-full break-words text-center text-base font-extrabold sm:text-lg">
        {teamDisplayName(team, lang)}
      </span>
    </div>
  );
}

export function MatchHero({ match }: { match: Match }) {
  const { t, i18n } = useTranslation();
  const completed = match.status === "completed";

  return (
    <section className="card-brand rounded-xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded-full bg-gradient-to-b from-primary/25 to-primary/5 px-3 py-1 font-bold text-primary ring-1 ring-primary/30">
          {t(STAGE_LABEL_KEYS[match.stage])}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatMatchDate(match.matchDate.toDate(), i18n.language)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2" dir="ltr">
        <TeamBlock team={match.home} lang={i18n.language} />
        <div className="shrink-0 px-1 text-center">
          {completed ? (
            <span className="whitespace-nowrap font-display text-[clamp(2.5rem,13vw,3.75rem)] text-foreground sm:text-7xl">
              {match.actualScoreHome} <span className="text-primary">:</span>{" "}
              {match.actualScoreAway}
            </span>
          ) : (
            /* Split-brand diamond. The label inherits Cairo — Arabic "ضد"
               must never go through font-display (no Arabic glyphs). */
            <div className="mx-2 flex size-12 rotate-45 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#45B75A_50%,#B4D337_50%)] p-[3px] shadow-[0_0_20px_rgba(69,183,90,0.35)]">
              <div className="flex size-full items-center justify-center rounded-md bg-background">
                <span className="-rotate-45 text-sm font-black text-primary">{t("vs")}</span>
              </div>
            </div>
          )}
        </div>
        <TeamBlock team={match.away} lang={i18n.language} />
      </div>

      {completed && (
        <p className="mt-4 flex justify-center">
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            {t("match.completed")}
          </span>
        </p>
      )}
    </section>
  );
}
