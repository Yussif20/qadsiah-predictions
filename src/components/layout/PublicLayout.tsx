import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shield, Trophy, Volleyball } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground"
  );

export function PublicLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4">
          {/* Brand is logos-only: the WE ARE 26 mark and the club crest frame the nav */}
          <Link to="/" className="shrink-0">
            <img
              src="/images/logo.png"
              alt="WE ARE 26"
              className="size-9 rounded-lg ring-1 ring-primary/30"
            />
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <Volleyball className="size-4" />
              <span className="hidden sm:inline">{t("nav.predict")}</span>
            </NavLink>
            <NavLink to="/winners" className={navLinkClass}>
              <Trophy className="size-4" />
              <span className="hidden sm:inline">{t("nav.winners")}</span>
            </NavLink>
            <LanguageSwitcher />
            {/* Discreet admin entry — redirects straight to /admin when already signed in */}
            <Link
              to="/admin/login"
              aria-label={t("nav.admin")}
              title={t("nav.admin")}
              className="flex items-center justify-center rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Shield className="size-3.5" />
            </Link>
          </nav>
          <Link to="/" className="shrink-0">
            <img src="/images/club-crest.png" alt={t("appTagline")} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="divider-glow" />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="pb-8 pt-2 text-center text-xs text-muted-foreground">
        <div className="divider-glow mx-auto mb-5 max-w-3xl px-4" />
        <img src="/images/club-crest.png" alt="" className="mx-auto mb-2 h-7 w-auto opacity-50" />
        {t("footer")}
      </footer>
    </div>
  );
}
