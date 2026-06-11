import { cn } from "@/lib/utils";
import type { TeamInfo } from "@/types";

const SIZES = {
  sm: "w-7",
  md: "w-11",
  lg: "w-16",
} as const;

interface CountryFlagProps {
  /** ISO code understood by flagcdn.com, e.g. "sa", "mx", "gb-eng". */
  code: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function CountryFlag({ code, size = "md", className }: CountryFlagProps) {
  return (
    <img
      src={`https://flagcdn.com/w160/${code}.png`}
      alt={code}
      loading="lazy"
      className={cn("aspect-[4/3] rounded object-cover shadow-md", SIZES[size], className)}
    />
  );
}

interface TeamFlagProps {
  team: Pick<TeamInfo, "flag" | "crest">;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Team image: football-data.org crest when available, flagcdn otherwise. */
export function TeamFlag({ team, size = "md", className }: TeamFlagProps) {
  if (team.crest) {
    return (
      <img
        src={team.crest}
        alt=""
        loading="lazy"
        className={cn("aspect-square object-contain drop-shadow-md", SIZES[size], className)}
      />
    );
  }
  return <CountryFlag code={team.flag || "un"} size={size} className={className} />;
}
