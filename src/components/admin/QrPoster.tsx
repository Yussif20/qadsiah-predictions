import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { Download, QrCode as QrCodeIcon } from "lucide-react";
import { inputClass } from "@/components/predict/PredictionForm";

export function QrPoster() {
  const { t } = useTranslation("admin");
  const [url, setUrl] = useState(() => window.location.origin);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const trimmed = url.trim();
    const generated: Promise<string | null> = trimmed
      ? QRCode.toDataURL(trimmed, {
          width: 600,
          margin: 2,
          color: { dark: "#0B0905", light: "#FFFFFF" },
        }).catch(() => null)
      : Promise.resolve(null);
    generated.then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <section className="rounded-xl border bg-card/60 p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
        <QrCodeIcon className="size-5 text-primary" />
        {t("qr.title")}
      </h2>
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-bold text-muted-foreground">{t("qr.url")}</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" className={inputClass} />
          <p className="text-[11px] text-muted-foreground">{t("qr.hint")}</p>
          {dataUrl && (
            <a
              href={dataUrl}
              download="qadsiah-predictions-qr.png"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground hover:opacity-90"
            >
              <Download className="size-4" />
              {t("qr.download")}
            </a>
          )}
        </div>
        {dataUrl && (
          <img src={dataUrl} alt="QR" className="w-40 rounded-lg border bg-white p-2" />
        )}
      </div>
    </section>
  );
}
