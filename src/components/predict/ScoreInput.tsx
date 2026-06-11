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

export function ScoreInput({ label, team, value, onChange }: ScoreInputProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border bg-secondary/40 p-4">
      <TeamFlag team={team} size="md" />
      <span className="text-center text-sm font-bold">{label}</span>
      <div className="flex items-center gap-3" dir="ltr">
        <button
          type="button"
          aria-label="minus"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex size-9 items-center justify-center rounded-full border bg-muted transition-colors hover:border-primary"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center font-display text-4xl text-primary">{value}</span>
        <button
          type="button"
          aria-label="plus"
          onClick={() => onChange(Math.min(SCORE_MAX, value + 1))}
          className="flex size-9 items-center justify-center rounded-full border bg-muted transition-colors hover:border-primary"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
