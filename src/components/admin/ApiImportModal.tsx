import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudDownload, X } from "lucide-react";
import {
  getWorldCupMatches,
  isSaudiTeam,
  mapApiStage,
  type FdMatch,
} from "@/lib/football-api";
import { DEFAULT_FLAG, findTeamByApiName } from "@/lib/team-mappings";
import type { MatchInput } from "@/lib/firestore";
import type { TeamInfo } from "@/types";
import { STAGE_LABEL_KEYS, teamDisplayName } from "@/lib/constants";
import { formatMatchDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TeamFlag } from "@/components/ui/CountryFlag";
import { Spinner } from "@/components/ui/Spinner";

interface ApiImportModalProps {
  /** apiMatchIds of matches already in Firestore — shown as "added". */
  existingApiIds: ReadonlySet<number>;
  onPick: (initial: Partial<MatchInput>) => void;
  onClose: () => void;
}

function toTeamInfo(team: FdMatch["homeTeam"]): TeamInfo {
  const mapping = findTeamByApiName(team.name);
  return {
    name: mapping?.appName ?? team.name ?? "",
    nameAr: mapping?.appNameAr ?? team.name ?? "",
    flag: mapping?.flagCode ?? DEFAULT_FLAG,
    // Crest covers teams that aren't in TEAM_MAPPINGS — every API team has one.
    crest: mapping ? null : (team.crest ?? null),
  };
}

function toMatchInput(fd: FdMatch): Partial<MatchInput> {
  return {
    home: toTeamInfo(fd.homeTeam),
    away: toTeamInfo(fd.awayTeam),
    stage: mapApiStage(fd.stage),
    matchDate: new Date(fd.utcDate),
    apiMatchId: fd.id,
  };
}

function involvesSaudi(fd: FdMatch): boolean {
  return isSaudiTeam(fd.homeTeam.name) || isSaudiTeam(fd.awayTeam.name);
}

export function ApiImportModal({ existingApiIds, onPick, onClose }: ApiImportModalProps) {
  const { t, i18n } = useTranslation("admin");

  const [matches, setMatches] = useState<FdMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saudiOnly, setSaudiOnly] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getWorldCupMatches()
      .then((m) => {
        if (!cancelled) setMatches(m);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const errorText =
    error === "rate-limit"
      ? t("api.errorRateLimit")
      : error === "forbidden"
        ? t("api.errorForbidden")
        : t("api.error");

  const shown = (matches ?? []).filter((fd) => !saudiOnly || involvesSaudi(fd));

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="rise-in card-elevated flex max-h-[90vh] w-full max-w-lg flex-col gap-4 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <CloudDownload className="size-5 text-primary" />
            {t("api.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="rounded-full border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Saudi / all toggle — useful for testing the app on earlier WC matches */}
        <div className="flex rounded-lg border bg-secondary/40 p-1 text-xs font-bold">
          {(
            [
              [true, t("api.filterSaudi")],
              [false, t("api.filterAll")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              onClick={() => setSaudiOnly(value)}
              className={cn(
                "flex-1 rounded-md py-1.5 transition-colors",
                saudiOnly === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {errorText}
          </p>
        ) : matches === null ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            {t("api.loading")}
          </div>
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("api.empty")}</p>
        ) : (
          <ul className="space-y-2 overflow-y-auto">
            {shown.map((fd) => {
              const input = toMatchInput(fd);
              const added = existingApiIds.has(fd.id);
              return (
                <li
                  key={fd.id}
                  className="flex items-center gap-3 rounded-lg border bg-secondary/40 p-3 transition-colors hover:border-primary/40"
                >
                  <span className="flex shrink-0 items-center gap-1" dir="ltr">
                    <TeamFlag team={input.home!} size="sm" />
                    <TeamFlag team={input.away!} size="sm" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {teamDisplayName(input.home!, i18n.language)} ×{" "}
                      {teamDisplayName(input.away!, i18n.language)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`common:${STAGE_LABEL_KEYS[input.stage ?? "group"]}`)} —{" "}
                      {formatMatchDate(new Date(fd.utcDate), i18n.language)}
                    </p>
                  </div>
                  {added ? (
                    <span className="shrink-0 rounded-full bg-success/15 px-3 py-1 text-[11px] font-bold text-success">
                      {t("api.alreadyAdded")}
                    </span>
                  ) : (
                    <button
                      onClick={() => onPick(input)}
                      className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground hover:opacity-90"
                    >
                      {t("api.add")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
