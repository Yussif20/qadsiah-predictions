import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AdminLayout() {
  const { t } = useTranslation("admin");
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/images/emblem.png" alt="" className="size-8 rounded-lg" />
            <span className="text-sm font-extrabold">{t("nav.title")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">{t("nav.viewSite")}</span>
            </Link>
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </button>
          </div>
        </div>
        <div className="divider-glow" />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
