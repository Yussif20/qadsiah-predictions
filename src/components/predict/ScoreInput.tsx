import { Minus, Plus } from "lucide-react";
import type { TeamInfo } from "@/types";
import { SCORE_MAX } from "@/lib/constants";
import { TeamFlag } from "@/components/ui/CountryFlag";

interface ScoreInputProps {
  label: string;
  team: Pick<TeamInfo, "flag" | "crest">;
  value: number;
  onChange: (value: number) => void;
}

const stepBtnClass =
  "flex size-10 items-center justify-center rounded-full border bg-muted transition-all hover:border-primary hover:bg-primary/15 active:scale-90 disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-muted";

export function ScoreInput({ label, team, value, onChange }: ScoreInputProps) {
  return (
    <div className="card-elevated flex flex-1 flex-col items-center gap-2 rounded-xl p-4">
      <TeamFlag team={team} size="md" />
      <span className="text-center text-sm font-bold">{label}</span>
      <div className="flex items-center gap-3" dir="ltr">
        <button
          type="button"
          aria-label="minus"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className={stepBtnClass}
        >
          <Minus className="size-4" />
        </button>
        {/* Keyed remount replays the pop animation on every change */}
        <span key={value} className="score-pop w-12 text-center font-display text-5xl text-primary">
          {value}
        </span>
        <button
          type="button"
          aria-label="plus"
          onClick={() => onChange(Math.min(SCORE_MAX, value + 1))}
          disabled={value === SCORE_MAX}
          className={stepBtnClass}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
