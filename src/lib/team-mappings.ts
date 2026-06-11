/**
 * Maps football-data.org team names to display names + flagcdn codes.
 * Copied from reda-predictions; the opponent of any Saudi match should be
 * here — unmapped teams fall back to the API name and the UN flag.
 */

export interface TeamMapping {
  appName: string;
  appNameAr: string;
  flagCode: string;
  apiNames: string[];
}

export const DEFAULT_FLAG = "un";

export const TEAM_MAPPINGS: TeamMapping[] = [
  { appName: "Morocco", appNameAr: "المغرب", flagCode: "ma", apiNames: ["Morocco"] },
  { appName: "Scotland", appNameAr: "اسكتلندا", flagCode: "gb-sct", apiNames: ["Scotland"] },
  { appName: "Mexico", appNameAr: "المكسيك", flagCode: "mx", apiNames: ["Mexico"] },
  { appName: "Zambia", appNameAr: "زامبيا", flagCode: "zm", apiNames: ["Zambia"] },
  { appName: "USA", appNameAr: "أمريكا", flagCode: "us", apiNames: ["United States", "USA", "US"] },
  { appName: "Bolivia", appNameAr: "بوليفيا", flagCode: "bo", apiNames: ["Bolivia"] },
  { appName: "Germany", appNameAr: "ألمانيا", flagCode: "de", apiNames: ["Germany"] },
  { appName: "Kenya", appNameAr: "كينيا", flagCode: "ke", apiNames: ["Kenya"] },
  { appName: "Colombia", appNameAr: "كولومبيا", flagCode: "co", apiNames: ["Colombia"] },
  { appName: "Turkey", appNameAr: "تركيا", flagCode: "tr", apiNames: ["Turkey", "Türkiye"] },
  { appName: "Italy", appNameAr: "إيطاليا", flagCode: "it", apiNames: ["Italy"] },
  { appName: "Albania", appNameAr: "ألبانيا", flagCode: "al", apiNames: ["Albania"] },
  { appName: "Argentina", appNameAr: "الأرجنتين", flagCode: "ar", apiNames: ["Argentina"] },
  { appName: "Peru", appNameAr: "بيرو", flagCode: "pe", apiNames: ["Peru"] },
  { appName: "France", appNameAr: "فرنسا", flagCode: "fr", apiNames: ["France"] },
  { appName: "Uzbekistan", appNameAr: "أوزبكستان", flagCode: "uz", apiNames: ["Uzbekistan"] },
  { appName: "Brazil", appNameAr: "البرازيل", flagCode: "br", apiNames: ["Brazil"] },
  { appName: "Nigeria", appNameAr: "نيجيريا", flagCode: "ng", apiNames: ["Nigeria"] },
  { appName: "England", appNameAr: "إنجلترا", flagCode: "gb-eng", apiNames: ["England"] },
  { appName: "Denmark", appNameAr: "الدنمارك", flagCode: "dk", apiNames: ["Denmark"] },
  { appName: "Spain", appNameAr: "إسبانيا", flagCode: "es", apiNames: ["Spain"] },
  { appName: "Uruguay", appNameAr: "أوروغواي", flagCode: "uy", apiNames: ["Uruguay"] },
  { appName: "Canada", appNameAr: "كندا", flagCode: "ca", apiNames: ["Canada"] },
  { appName: "Saudi Arabia", appNameAr: "السعودية", flagCode: "sa", apiNames: ["Saudi Arabia"] },
  { appName: "Japan", appNameAr: "اليابان", flagCode: "jp", apiNames: ["Japan"] },
  // Saudi Arabia's WC 2026 group includes Cape Verde (API: "Cape Verde Islands")
  { appName: "Cape Verde", appNameAr: "الرأس الأخضر", flagCode: "cv", apiNames: ["Cape Verde Islands", "Cape Verde"] },
  // Broader WC 2026 coverage so Arabic names localize; teams missing from this
  // list still render via the football-data.org crest image.
  { appName: "Jordan", appNameAr: "الأردن", flagCode: "jo", apiNames: ["Jordan"] },
  { appName: "Qatar", appNameAr: "قطر", flagCode: "qa", apiNames: ["Qatar"] },
  { appName: "Iran", appNameAr: "إيران", flagCode: "ir", apiNames: ["Iran", "IR Iran"] },
  { appName: "South Korea", appNameAr: "كوريا الجنوبية", flagCode: "kr", apiNames: ["South Korea", "Korea Republic"] },
  { appName: "Australia", appNameAr: "أستراليا", flagCode: "au", apiNames: ["Australia"] },
  { appName: "Ecuador", appNameAr: "الإكوادور", flagCode: "ec", apiNames: ["Ecuador"] },
  { appName: "Paraguay", appNameAr: "باراغواي", flagCode: "py", apiNames: ["Paraguay"] },
  { appName: "Panama", appNameAr: "بنما", flagCode: "pa", apiNames: ["Panama"] },
  { appName: "Haiti", appNameAr: "هايتي", flagCode: "ht", apiNames: ["Haiti"] },
  { appName: "Curaçao", appNameAr: "كوراساو", flagCode: "cw", apiNames: ["Curaçao", "Curacao"] },
  { appName: "Ghana", appNameAr: "غانا", flagCode: "gh", apiNames: ["Ghana"] },
  { appName: "Senegal", appNameAr: "السنغال", flagCode: "sn", apiNames: ["Senegal"] },
  { appName: "Tunisia", appNameAr: "تونس", flagCode: "tn", apiNames: ["Tunisia"] },
  { appName: "Algeria", appNameAr: "الجزائر", flagCode: "dz", apiNames: ["Algeria"] },
  { appName: "Egypt", appNameAr: "مصر", flagCode: "eg", apiNames: ["Egypt"] },
  { appName: "South Africa", appNameAr: "جنوب أفريقيا", flagCode: "za", apiNames: ["South Africa"] },
  { appName: "Ivory Coast", appNameAr: "ساحل العاج", flagCode: "ci", apiNames: ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"] },
  { appName: "New Zealand", appNameAr: "نيوزيلندا", flagCode: "nz", apiNames: ["New Zealand"] },
  { appName: "Netherlands", appNameAr: "هولندا", flagCode: "nl", apiNames: ["Netherlands", "Holland"] },
  { appName: "Belgium", appNameAr: "بلجيكا", flagCode: "be", apiNames: ["Belgium"] },
  { appName: "Croatia", appNameAr: "كرواتيا", flagCode: "hr", apiNames: ["Croatia"] },
  { appName: "Portugal", appNameAr: "البرتغال", flagCode: "pt", apiNames: ["Portugal"] },
  { appName: "Switzerland", appNameAr: "سويسرا", flagCode: "ch", apiNames: ["Switzerland"] },
  { appName: "Austria", appNameAr: "النمسا", flagCode: "at", apiNames: ["Austria"] },
  { appName: "Norway", appNameAr: "النرويج", flagCode: "no", apiNames: ["Norway"] },
  { appName: "Poland", appNameAr: "بولندا", flagCode: "pl", apiNames: ["Poland"] },
  { appName: "Czechia", appNameAr: "التشيك", flagCode: "cz", apiNames: ["Czechia", "Czech Republic"] },
  { appName: "Sweden", appNameAr: "السويد", flagCode: "se", apiNames: ["Sweden"] },
  { appName: "Ukraine", appNameAr: "أوكرانيا", flagCode: "ua", apiNames: ["Ukraine"] },
  { appName: "Wales", appNameAr: "ويلز", flagCode: "gb-wls", apiNames: ["Wales"] },
  { appName: "Ireland", appNameAr: "أيرلندا", flagCode: "ie", apiNames: ["Ireland", "Republic of Ireland"] },
  { appName: "Slovakia", appNameAr: "سلوفاكيا", flagCode: "sk", apiNames: ["Slovakia"] },
  { appName: "Romania", appNameAr: "رومانيا", flagCode: "ro", apiNames: ["Romania"] },
  { appName: "Hungary", appNameAr: "المجر", flagCode: "hu", apiNames: ["Hungary"] },
  { appName: "Greece", appNameAr: "اليونان", flagCode: "gr", apiNames: ["Greece"] },
  { appName: "North Macedonia", appNameAr: "مقدونيا الشمالية", flagCode: "mk", apiNames: ["North Macedonia"] },
  { appName: "Bosnia and Herzegovina", appNameAr: "البوسنة والهرسك", flagCode: "ba", apiNames: ["Bosnia and Herzegovina", "Bosnia-Herzegovina"] },
  { appName: "Kosovo", appNameAr: "كوسوفو", flagCode: "xk", apiNames: ["Kosovo"] },
  { appName: "Honduras", appNameAr: "هندوراس", flagCode: "hn", apiNames: ["Honduras"] },
  { appName: "Costa Rica", appNameAr: "كوستاريكا", flagCode: "cr", apiNames: ["Costa Rica"] },
  { appName: "Jamaica", appNameAr: "جامايكا", flagCode: "jm", apiNames: ["Jamaica"] },
  { appName: "El Salvador", appNameAr: "السلفادور", flagCode: "sv", apiNames: ["El Salvador"] },
  { appName: "Venezuela", appNameAr: "فنزويلا", flagCode: "ve", apiNames: ["Venezuela"] },
  { appName: "Chile", appNameAr: "تشيلي", flagCode: "cl", apiNames: ["Chile"] },
  { appName: "Suriname", appNameAr: "سورينام", flagCode: "sr", apiNames: ["Suriname"] },
  { appName: "Iraq", appNameAr: "العراق", flagCode: "iq", apiNames: ["Iraq"] },
  { appName: "UAE", appNameAr: "الإمارات", flagCode: "ae", apiNames: ["United Arab Emirates", "UAE"] },
  { appName: "Oman", appNameAr: "عُمان", flagCode: "om", apiNames: ["Oman"] },
  { appName: "Bahrain", appNameAr: "البحرين", flagCode: "bh", apiNames: ["Bahrain"] },
  { appName: "Kuwait", appNameAr: "الكويت", flagCode: "kw", apiNames: ["Kuwait"] },
  { appName: "Indonesia", appNameAr: "إندونيسيا", flagCode: "id", apiNames: ["Indonesia"] },
  { appName: "DR Congo", appNameAr: "الكونغو الديمقراطية", flagCode: "cd", apiNames: ["DR Congo", "Congo DR", "Democratic Republic of the Congo"] },
  { appName: "Cameroon", appNameAr: "الكاميرون", flagCode: "cm", apiNames: ["Cameroon"] },
  { appName: "Mali", appNameAr: "مالي", flagCode: "ml", apiNames: ["Mali"] },
  { appName: "Burkina Faso", appNameAr: "بوركينا فاسو", flagCode: "bf", apiNames: ["Burkina Faso"] },
  { appName: "Gabon", appNameAr: "الغابون", flagCode: "ga", apiNames: ["Gabon"] },
];

/** Find team mapping by any of its known API names (case-insensitive). */
export function findTeamByApiName(apiName: string | null | undefined): TeamMapping | undefined {
  if (!apiName) return undefined;
  const lower = apiName.toLowerCase();
  return TEAM_MAPPINGS.find((t) => t.apiNames.some((name) => name.toLowerCase() === lower));
}
