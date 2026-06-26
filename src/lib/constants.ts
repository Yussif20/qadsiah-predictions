import type { Stage, TeamInfo } from "@/types";

export const SCORE_MAX = 15;

/**
 * Predictions open only this many hours before kickoff (and close at kickoff).
 * Mirror any change in `firestore.rules` → `matchOpen` (`duration.value(3, 'h')`),
 * which can't import this module.
 */
export const PREDICTIONS_OPEN_BEFORE_HOURS = 3;
export const PREDICTIONS_OPEN_BEFORE_MS = PREDICTIONS_OPEN_BEFORE_HOURS * 60 * 60 * 1000;

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
