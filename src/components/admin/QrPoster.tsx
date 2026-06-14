import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, ImageDown, QrCode as QrCodeIcon } from "lucide-react";
import { inputClass } from "@/components/predict/PredictionForm";
import { Spinner } from "@/components/ui/Spinner";

// The poster is the client's finished artwork (public/images/poster.jpg) — the
// headline, logos and layout are all baked into the image. We only overlay the
// live QR onto the white card, replacing the placeholder QR in the design.
// Card position, measured from the artwork (596×842 pt page), as fractions of
// the image: a 346pt square at x124,y315.
const CARD = { x: 0.2081, y: 0.3741, side: 0.5805 }; // side as a fraction of WIDTH

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

/** Compose the venue poster: the client's A4 artwork with our live QR overlaid
 *  onto the card (covering the design's placeholder QR). */
async function composePoster(url: string): Promise<string> {
  const bg = await loadImage("/images/poster.jpg");
  const W = bg.naturalWidth;
  const H = bg.naturalHeight;

  // Card geometry in output pixels. The card is a square, so its side is taken
  // from the width and reused for the height to stay square on any image size.
  const cardX = CARD.x * W;
  const cardY = CARD.y * H;
  const side = CARD.side * W;
  // Quiet zone around the QR (needed for reliable scanning); the rest of the
  // card stays white, matching the design.
  const quiet = side * 0.07;
  const qrPx = Math.round(side - quiet * 2);

  // Generate the QR at exactly the size it is drawn — no scaling, crisp modules.
  // Dark modules (not the mockup's brand-green) for dependable scanning at the venue.
  const qrImg = await QRCode.toDataURL(url, {
    width: qrPx,
    margin: 0,
    color: { dark: "#04120F", light: "#FFFFFF" },
  }).then(loadImage);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-unsupported");

  ctx.drawImage(bg, 0, 0, W, H);

  // Wipe the placeholder QR with a white rounded patch. A radius larger than the
  // card's keeps this patch inside the card silhouette (white-on-white, no seam,
  // never spilling into the teal corners).
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, cardX, cardY, side, side, side * 0.13);
  ctx.fill();

  ctx.drawImage(qrImg, cardX + quiet, cardY + quiet, qrPx, qrPx);

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
