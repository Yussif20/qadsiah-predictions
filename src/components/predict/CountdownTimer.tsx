import { useTranslation } from "react-i18next";
import { useNow } from "@/hooks/useNow";

export function CountdownTimer({ targetMs }: { targetMs: number }) {
  const { t } = useTranslation();
  const now = useNow();
  const diff = Math.max(0, targetMs - now);

  const cells = [
    { value: Math.floor(diff / 86_400_000), label: t("countdown.days") },
    { value: Math.floor(diff / 3_600_000) % 24, label: t("countdown.hours") },
    { value: Math.floor(diff / 60_000) % 60, label: t("countdown.minutes") },
    { value: Math.floor(diff / 1_000) % 60, label: t("countdown.seconds") },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="w-16 rounded-lg border bg-secondary/60 py-2 text-center sm:w-20"
        >
          <div className="font-display text-2xl text-primary sm:text-3xl">
            {String(cell.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-muted-foreground">{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
