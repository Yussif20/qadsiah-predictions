import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";

export function CountdownTimer({ targetMs }: { targetMs: number }) {
  const { t } = useTranslation();
  const now = useNow();
  const diff = Math.max(0, targetMs - now);
  const urgent = diff > 0 && diff < 3_600_000;

  const cells = [
    { value: Math.floor(diff / 86_400_000), label: t("countdown.days") },
    { value: Math.floor(diff / 3_600_000) % 24, label: t("countdown.hours") },
    { value: Math.floor(diff / 60_000) % 60, label: t("countdown.minutes") },
    { value: Math.floor(diff / 1_000) % 60, label: t("countdown.seconds") },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
      {cells.map((cell) => (
        <div key={cell.label} className="card-elevated min-w-0 max-w-16 flex-1 rounded-lg py-2 text-center sm:max-w-20">
          <div
            className={cn(
              "font-display text-3xl sm:text-4xl",
              urgent ? "text-accent" : "text-primary"
            )}
          >
            {/* Keyed remount replays the tick animation only when the value changes */}
            <span key={cell.value} className="tick block">
              {String(cell.value).padStart(2, "0")}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
