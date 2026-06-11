import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enAdmin from "./locales/en/admin.json";
import arCommon from "./locales/ar/common.json";
import arAdmin from "./locales/ar/admin.json";

export const resources = {
  en: {
    common: enCommon,
    admin: enAdmin,
  },
  ar: {
    common: arCommon,
    admin: arAdmin,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: ["common", "admin"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // localStorage only — no navigator detection. Arabic is the default for
      // anyone without a saved preference, regardless of browser locale.
      order: ["localStorage"],
      caches: ["localStorage"],
    },
  });

const applyDir = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
};

applyDir(i18n.language);
i18n.on("languageChanged", applyDir);

export default i18n;
