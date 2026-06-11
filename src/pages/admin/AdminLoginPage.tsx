import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { inputClass } from "@/components/predict/PredictionForm";
import { FullScreenSpinner, Spinner } from "@/components/ui/Spinner";

export function AdminLoginPage() {
  const { t } = useTranslation("admin");
  const { isAdmin, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <FullScreenSpinner />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === "not-admin"
          ? t("login.notAdmin")
          : t("login.error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Faint knight watermark behind the form */}
      <div className="pointer-events-none fixed inset-0 bg-[url(/images/emblem.png)] bg-[length:50vmin] bg-center bg-no-repeat opacity-[0.04]" />
      <form
        onSubmit={onSubmit}
        className="rise-in card-elevated relative w-full max-w-sm space-y-4 rounded-xl p-8"
      >
        <div className="text-center">
          <img src="/images/emblem.png" alt="" className="mx-auto mb-3 size-16 rounded-xl" />
          <h1 className="text-xl font-extrabold">{t("login.title")}</h1>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("login.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            {t("login.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-cta flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-extrabold"
        >
          {submitting ? <Spinner className="size-4 text-primary-foreground" /> : <LogIn className="size-4" />}
          {t("login.submit")}
        </button>
      </form>
    </div>
  );
}
