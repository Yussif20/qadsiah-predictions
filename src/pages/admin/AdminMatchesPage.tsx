import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudDownload,
  Gift,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Match } from "@/types";
import { STAGE_LABEL_KEYS, teamDisplayName } from "@/lib/constants";
import { deleteMatchCascade, type MatchInput } from "@/lib/firestore";
import { effectiveMatchStatus } from "@/lib/matchStatus";
import { formatMatchDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMatches } from "@/hooks/useMatches";
import { useNow } from "@/hooks/useNow";
import { TeamFlag } from "@/components/ui/CountryFlag";
import { ApiImportModal } from "@/components/admin/ApiImportModal";
import { MatchFormModal } from "@/components/admin/MatchFormModal";
import { QrPoster } from "@/components/admin/QrPoster";

const STATUS_BADGES = {
  upcoming: "bg-info/15 text-info",
  locked: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
} as const;

export function AdminMatchesPage() {
  const { t, i18n } = useTranslation("admin");
  const ar = i18n.language === "ar";
  const { matches, loading } = useMatches();
  const now = useNow(10_000);

  const [modal, setModal] = useState<{
    open: boolean;
    match: Match | null;
    initial: Partial<MatchInput> | null;
  }>({ open: false, match: null, initial: null });
  const [importOpen, setImportOpen] = useState(false);

  const existingApiIds = new Set(
    matches.map((m) => m.apiMatchId).filter((id): id is number => id != null)
  );

  const statuses = matches.map((m) => effectiveMatchStatus(m, now));
  const completedCount = statuses.filter((s) => s === "completed").length;
  const upcomingCount = statuses.filter((s) => s === "upcoming").length;
  const Chevron = ar ? ChevronLeft : ChevronRight;

  const onDelete = async (match: Match) => {
    if (!window.confirm(t("matches.deleteConfirm"))) return;
    try {
      await deleteMatchCascade(match.id);
      toast.success(t("matches.deleted"));
    } catch {
      toast.error(t("matches.required"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{t("matches.title")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-primary/50 px-4 py-2 text-sm font-extrabold text-primary hover:bg-primary/10"
          >
            <CloudDownload className="size-4" />
            {t("api.import")}
          </button>
          <button
            onClick={() => setModal({ open: true, match: null, initial: null })}
            className="btn-cta flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold"
          >
            <Plus className="size-4" />
            {t("matches.create")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(
          [
            [t("stats.matches"), matches.length, CalendarDays],
            [t("stats.upcoming"), upcomingCount, Clock],
            [t("stats.completed"), completedCount, CheckCircle2],
          ] as const
        ).map(([label, value, Icon]) => (
          <div key={label} className="card-elevated rounded-xl p-4 text-center">
            <Icon className="mx-auto mb-1 size-4 text-primary/60" />
            <div className="font-display text-3xl text-primary">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="shimmer h-20 rounded-xl border bg-card/40" />
          <div className="shimmer h-20 rounded-xl border bg-card/40" />
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          {t("matches.empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => {
            const status = effectiveMatchStatus(match, now);
            return (
              <li
                key={match.id}
                className="card-elevated flex flex-wrap items-center gap-3 rounded-xl p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex shrink-0 items-center gap-1" dir="ltr">
                  <TeamFlag team={match.home} size="sm" />
                  <TeamFlag team={match.away} size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {teamDisplayName(match.home, i18n.language)} ×{" "}
                    {teamDisplayName(match.away, i18n.language)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`common:${STAGE_LABEL_KEYS[match.stage]}`)} —{" "}
                    {formatMatchDate(match.matchDate.toDate(), i18n.language)}
                  </p>
                  {match.prizeWinner && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-primary">
                      <Gift className="size-3" />
                      {match.prizeWinner.name}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    STATUS_BADGES[status]
                  )}
                >
                  {status === "completed" && match.actualScoreHome !== null ? (
                    <span dir="ltr">{`${match.actualScoreHome} : ${match.actualScoreAway}`}</span>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-current" />
                      {t(`status.${status}`)}
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModal({ open: true, match, initial: null })}
                    aria-label="edit"
                    className="rounded-full border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(match)}
                    aria-label="delete"
                    className="rounded-full border p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <Link
                    to={`/admin/matches/${match.id}`}
                    className="flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition-colors hover:border-primary"
                  >
                    {t("matches.details")}
                    <Chevron className="size-3.5" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <QrPoster />

      {importOpen && (
        <ApiImportModal
          existingApiIds={existingApiIds}
          onPick={(initial) => {
            setImportOpen(false);
            setModal({ open: true, match: null, initial });
          }}
          onClose={() => setImportOpen(false)}
        />
      )}

      {modal.open && (
        <MatchFormModal
          match={modal.match}
          initial={modal.initial}
          onClose={() => setModal({ open: false, match: null, initial: null })}
        />
      )}
    </div>
  );
}
