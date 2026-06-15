import { useEffect } from "react";
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

  // Flag public routes so the global backdrop (body::before) can switch to the
  // left-half image panel on desktop; admin and the wheel keep the full-bleed
  // backdrop. Cleared on unmount when navigating into the admin area.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-route", "public");
    return () => html.removeAttribute("data-route");
  }, []);

  return (
    // Header and footer are full-width bands; only <main> is offset into the
    // right half on desktop (lg:ml-[50%]), opposite the left-half artwork panel.
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40">
        {/* Brand is logos-only: the WE ARE 26 mark and the club crest frame the
            nav. The logos are pinned with physical left/right so they keep the
            same physical sides in both LTR and RTL — the Qadsiah club crest is
            always first on the right regardless of language/direction. */}
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-center gap-2 px-4 sm:px-6">
          <Link to="/" className="absolute left-4 shrink-0 sm:left-6">
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
          <Link to="/" className="absolute right-4 shrink-0 sm:right-6">
            <img src="/images/club-crest.png" alt={t("appTagline")} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="divider-glow" />
      </header>

      {/* Offset into the right half on desktop; full width below lg. The inner
          column keeps the readable max-width, centered within its half. */}
      <main className="flex-1 px-4 py-8 lg:ml-[50%]">
        <div className="mx-auto w-full max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
