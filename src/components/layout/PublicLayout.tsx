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
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/emblem.png" alt="" className="size-9 rounded-lg" />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold sm:text-base">{t("appName")}</span>
              <span className="block text-[11px] text-muted-foreground">{t("appTagline")}</span>
            </span>
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">{t("footer")}</footer>
    </div>
  );
}
