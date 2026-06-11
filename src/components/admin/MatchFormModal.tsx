import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Match, Stage, TeamInfo } from "@/types";
import { SAUDI_TEAM, STAGES, STAGE_LABEL_KEYS } from "@/lib/constants";
import { createMatch, updateMatch, type MatchInput } from "@/lib/firestore";
import { toDatetimeLocalValue } from "@/lib/format";
import { inputClass } from "@/components/predict/PredictionForm";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Spinner } from "@/components/ui/Spinner";

interface MatchFormModalProps {
  /** null = create mode. */
  match: Match | null;
  /** Create-mode prefill, e.g. from the football-data.org import modal. */
  initial?: Partial<MatchInput> | null;
  onClose: () => void;
}

interface TeamFieldsProps {
  legend: string;
  team: TeamInfo;
  onChange: (team: TeamInfo) => void;
}

function TeamFields({ legend, team, onChange }: TeamFieldsProps) {
  const { t } = useTranslation("admin");
  return (
    <fieldset className="space-y-3 rounded-lg border p-3">
      <legend className="px-1 text-xs font-extrabold text-primary">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("matches.teamName")}
          </label>
          <input
            value={team.name}
            onChange={(e) => onChange({ ...team, name: e.target.value })}
            dir="ltr"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("matches.teamNameAr")}
          </label>
          <input
            value={team.nameAr}
            onChange={(e) => onChange({ ...team, nameAr: e.target.value })}
            dir="rtl"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-muted-foreground">
          {t("matches.teamFlag")}
        </label>
        <div className="flex items-center gap-2">
          <input
            value={team.flag}
            onChange={(e) => onChange({ ...team, flag: e.target.value })}
            dir="ltr"
            placeholder="mx"
            className={inputClass}
          />
          {team.flag.trim() && <CountryFlag code={team.flag.trim().toLowerCase()} size="sm" />}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{t("matches.flagHint")}</p>
      </div>
    </fieldset>
  );
}

export function MatchFormModal({ match, initial, onClose }: MatchFormModalProps) {
  const { t } = useTranslation("admin");

  // Manual creation defaults the home side to Saudi Arabia — the venue's main
  // event — while leaving everything editable for test/other matches.
  const [home, setHome] = useState<TeamInfo>(match?.home ?? initial?.home ?? SAUDI_TEAM);
  const [away, setAway] = useState<TeamInfo>(
    match?.away ?? initial?.away ?? { name: "", nameAr: "", flag: "" }
  );
  const [stage, setStage] = useState<Stage>(match?.stage ?? initial?.stage ?? "group");
  const [dateValue, setDateValue] = useState(() => {
    if (match) return toDatetimeLocalValue(match.matchDate.toDate());
    if (initial?.matchDate) return toDatetimeLocalValue(initial.matchDate);
    return "";
  });
  const [saving, setSaving] = useState(false);
  // Carried through invisibly so editing an imported match keeps its API link.
  const apiMatchId = match?.apiMatchId ?? initial?.apiMatchId ?? null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const teamsValid = [home, away].every(
      (team) => team.name.trim() && team.nameAr.trim() && team.flag.trim()
    );
    if (!teamsValid || !dateValue) {
      toast.error(t("matches.required"));
      return;
    }
    const input: MatchInput = {
      home,
      away,
      stage,
      matchDate: new Date(dateValue),
      apiMatchId,
    };
    setSaving(true);
    try {
      if (match) {
        await updateMatch(match.id, input);
        toast.success(t("matches.updated"));
      } else {
        await createMatch(input);
        toast.success(t("matches.created"));
      }
      onClose();
    } catch {
      toast.error(t("matches.required"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">
            {match ? t("matches.edit") : t("matches.create")}
          </h2>
          <button type="button" onClick={onClose} aria-label="close">
            <X className="size-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <TeamFields legend={t("matches.team1")} team={home} onChange={setHome} />
        <TeamFields legend={t("matches.team2")} team={away} onChange={setAway} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              {t("matches.stage")}
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
              className={inputClass}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {t(`common:${STAGE_LABEL_KEYS[s]}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              {t("matches.date")}
            </label>
            <input
              type="datetime-local"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("matches.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-extrabold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Spinner className="size-4 text-primary-foreground" />}
            {t("matches.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
