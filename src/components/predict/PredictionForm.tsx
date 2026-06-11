import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Pencil, Send } from "lucide-react";
import type { Match } from "@/types";
import { teamDisplayName } from "@/lib/constants";
import { toLocalFormat } from "@/lib/phone";
import { useMyPrediction } from "@/hooks/useMyPrediction";
import { ScoreInput } from "./ScoreInput";
import { Spinner } from "@/components/ui/Spinner";

export const inputClass =
  "w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60";

interface PredictionFormProps {
  match: Match;
  /** False once the match has kicked off — the form becomes read-only. */
  open: boolean;
}

export function PredictionForm({ match, open }: PredictionFormProps) {
  const { t, i18n } = useTranslation();
  const { identity, prediction, loading, submit } = useMyPrediction(match.id);

  // Identity is read synchronously from localStorage by the hook, so it is
  // already available on first render for prefilling.
  const [name, setName] = useState(() => identity?.name ?? "");
  const [phone, setPhone] = useState(() => (identity ? toLocalFormat(identity.phone) : ""));
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const homeName = teamDisplayName(match.home, i18n.language);
  const awayName = teamDisplayName(match.away, i18n.language);

  const startEdit = () => {
    if (prediction) {
      setScoreHome(prediction.predictedScoreHome);
      setScoreAway(prediction.predictedScoreAway);
    }
    setEditing(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("form.nameRequired"));
      return;
    }
    const isUpdate = prediction !== null;
    setSubmitting(true);
    try {
      await submit(name, phone, scoreHome, scoreAway);
      toast.success(isUpdate ? t("form.updated") : t("form.submitted"));
      setEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === "invalid-phone"
          ? t("form.phoneInvalid")
          : t("form.error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center rounded-xl border bg-card/60 p-10">
        <Spinner className="size-7" />
      </div>
    );
  }

  // Existing prediction summary (and the only view once the match kicked off)
  if (prediction && !editing) {
    return (
      <section className="rounded-xl border bg-card/60 p-5 text-center">
        <h3 className="mb-1 text-sm font-bold text-muted-foreground">
          {t("form.yourPrediction")}
        </h3>
        <div className="font-display text-5xl text-primary" dir="ltr">
          {prediction.predictedScoreHome} : {prediction.predictedScoreAway}
        </div>
        <p className="mt-1 text-sm font-semibold">{prediction.name}</p>
        <p className="text-xs text-muted-foreground">{prediction.phoneMasked}</p>
        {open && (
          <>
            <button
              onClick={startEdit}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors hover:border-primary"
            >
              <Pencil className="size-3.5" />
              {t("form.edit")}
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">{t("form.editUntilKickoff")}</p>
          </>
        )}
      </section>
    );
  }

  if (!open) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card/60 p-5 sm:p-6">
      <h3 className="text-center text-lg font-extrabold">{t("form.title")}</h3>

      <div className="flex gap-3" dir="ltr">
        <ScoreInput label={homeName} team={match.home} value={scoreHome} onChange={setScoreHome} />
        <ScoreInput label={awayName} team={match.away} value={scoreAway} onChange={setScoreAway} />
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("form.name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("form.namePlaceholder")}
            maxLength={60}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("form.phone")}
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("form.phonePlaceholder")}
            inputMode="tel"
            dir="ltr"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">{t("form.phoneHint")}</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-extrabold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? <Spinner className="size-4 text-primary-foreground" /> : <Send className="size-4" />}
        {prediction ? t("form.update") : t("form.submit")}
      </button>
    </form>
  );
}
