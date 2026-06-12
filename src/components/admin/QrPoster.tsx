import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, ImageDown, QrCode as QrCodeIcon } from "lucide-react";
import { inputClass } from "@/components/predict/PredictionForm";
import { Spinner } from "@/components/ui/Spinner";

// Poster copy is always Arabic — it hangs in the venue for the employees,
// regardless of which language the admin uses in the panel.
const POSTER_TITLE = "نادي القادسية";
const POSTER_SUBTITLE = "كأس العالم 2026";
const POSTER_CTA = "امسح الرمز وتوقّع النتيجة واربح الجائزة";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Compose the printable A4-ish (2:3) poster: artwork + headline + QR card. */
async function composePoster(url: string): Promise<string> {
  const [bg, qrImg] = await Promise.all([
    loadImage("/images/poster.jpg"),
    QRCode.toDataURL(url, {
      width: 520,
      margin: 1,
      color: { dark: "#04120F", light: "#FFFFFF" },
    }).then(loadImage),
  ]);
  // Make sure Cairo is ready before drawing Arabic on the canvas.
  try {
    await Promise.all([
      document.fonts.load("900 96px Cairo"),
      document.fonts.load("700 40px Cairo"),
      document.fonts.load("800 52px Cairo"),
    ]);
  } catch {
    /* system font fallback still renders correctly */
  }

  const W = 1200;
  const H = 1800;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-unsupported");

  ctx.drawImage(bg, 0, 0, W, H);
  ctx.textAlign = "center";

  // Headline in the plain deep-green band above the artwork
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#B4D337";
  ctx.font = "900 96px Cairo, sans-serif";
  ctx.fillText(POSTER_TITLE, W / 2, 170);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 40px Cairo, sans-serif";
  ctx.fillText(POSTER_SUBTITLE, W / 2, 237);
  ctx.restore();

  // Call to action above the QR card, in the deep-green lower third
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#B4D337";
  ctx.font = "800 52px Cairo, sans-serif";
  ctx.fillText(POSTER_CTA, W / 2, 1232);
  ctx.restore();

  // White QR card with a soft green glow
  const qrSize = 380;
  const pad = 26;
  const boxW = qrSize + pad * 2;
  const boxX = (W - boxW) / 2;
  const boxY = 1268;
  ctx.save();
  ctx.shadowColor = "rgba(69,183,90,0.45)";
  ctx.shadowBlur = 44;
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, boxX, boxY, boxW, boxW, 28);
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, boxX + pad, boxY + pad, qrSize, qrSize);

  // Bare link under the card for people who prefer typing it
  ctx.save();
  ctx.direction = "ltr";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 30px 'Space Grotesk', Cairo, sans-serif";
  ctx.fillText(url.replace(/^https?:\/\//, ""), W / 2, boxY + boxW + 58);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function QrPoster() {
  const { t } = useTranslation("admin");
  const [url, setUrl] = useState(() => window.location.origin);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmed = url.trim();
    const generated: Promise<string | null> = trimmed
      ? QRCode.toDataURL(trimmed, {
          width: 600,
          margin: 2,
          color: { dark: "#04120F", light: "#FFFFFF" },
        }).catch(() => null)
      : Promise.resolve(null);
    generated.then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const makePoster = async () => {
    if (!url.trim() || composing) return;
    setComposing(true);
    try {
      setPoster(await composePoster(url.trim()));
    } catch {
      toast.error(t("qr.posterError"));
    } finally {
      setComposing(false);
    }
  };

  return (
    <section className="card-elevated rounded-xl p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
        <QrCodeIcon className="size-5 text-primary" />
        {t("qr.title")}
      </h2>
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-bold text-muted-foreground">{t("qr.url")}</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" className={inputClass} />
          <p className="text-[11px] text-muted-foreground">{t("qr.hint")}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
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
            <button
              onClick={makePoster}
              disabled={composing || !url.trim()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/50 px-4 py-2 text-sm font-extrabold text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {composing ? <Spinner className="size-4" /> : <ImageDown className="size-4" />}
              {t("qr.posterMake")}
            </button>
          </div>
        </div>
        {dataUrl && (
          <img
            src={dataUrl}
            alt="QR"
            className="w-40 rounded-lg border bg-white p-2 shadow-[0_0_24px_rgba(69,183,90,0.15)]"
          />
        )}
      </div>

      {poster && (
        <div className="mt-4 flex flex-col items-start gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <img src={poster} alt="" className="w-36 rounded-lg border" />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("qr.posterHint")}</p>
            <a
              href={poster}
              download="qadsiah-venue-poster.png"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground hover:opacity-90"
            >
              <Download className="size-4" />
              {t("qr.posterDownload")}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
