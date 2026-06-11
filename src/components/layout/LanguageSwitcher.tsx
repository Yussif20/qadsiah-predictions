import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const next = i18n.language === "ar" ? "en" : "ar";
  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
    >
      <Languages className="size-3.5" />
      {t("language")}
    </button>
  );
}
