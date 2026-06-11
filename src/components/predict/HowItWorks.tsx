import { useTranslation } from "react-i18next";
import { FerrisWheel, QrCode, Target } from "lucide-react";

const STEPS = [
  { icon: QrCode, title: "howItWorks.step1Title", text: "howItWorks.step1Text" },
  { icon: Target, title: "howItWorks.step2Title", text: "howItWorks.step2Text" },
  { icon: FerrisWheel, title: "howItWorks.step3Title", text: "howItWorks.step3Text" },
] as const;

export function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="mb-4 text-center text-xl font-extrabold">{t("howItWorks.title")}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-xl border bg-card/60 p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15">
              <step.icon className="size-6 text-primary" />
            </div>
            <h3 className="mb-1 text-sm font-bold">{t(step.title)}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t(step.text)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
