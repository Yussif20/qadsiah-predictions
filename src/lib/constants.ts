import type { Stage, TeamInfo } from "@/types";

export const SCORE_MAX = 15;

export const STAGES: Stage[] = [
  "group",
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

/** i18n keys under common:stages.* */
export const STAGE_LABEL_KEYS: Record<Stage, string> = {
  group: "stages.group",
  round32: "stages.round32",
  round16: "stages.round16",
  quarter: "stages.quarter",
  semi: "stages.semi",
  third: "stages.third",
  final: "stages.final",
};

/** Default home team when the admin creates a match manually. */
export const SAUDI_TEAM: TeamInfo = {
  name: "Saudi Arabia",
  nameAr: "السعودية",
  flag: "sa",
};

export function teamDisplayName(team: TeamInfo, lang: string): string {
  return lang === "ar" ? team.nameAr : team.name;
}
