/**
 * Full-page floating sparkle background.
 *
 * A fixed, viewport-filling <canvas> behind all app content (mounted once in
 * App). Draws twinkling mint stars, slow-drifting green orbs and a steady
 * stream of rising particles (mostly green with the occasional lime spark —
 * the World Cup 2026 club palette) over the dark page backdrop.
 *
 * Pauses while the tab is hidden so it doesn't burn CPU in the background,
 * and skips entirely under `prefers-reduced-motion`.
 *
 * Ported from reda-predictions' SparkleBackground, re-coloured from blue/red
 * to green/lime.
 */

import { useEffect, useRef } from "react";

// World Cup club palette, as "R, G, B" triplets for rgba() interpolation.
const GREEN_RGB = "69, 183, 90"; // --color-primary
const LIME_RGB = "180, 211, 55"; // --color-accent

export default function SparkleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const running = { value: true };

    // Viewport dimensions (CSS px) — the canvas is fixed to the viewport.
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(vw * dpr));
      canvas.height = Math.max(1, Math.floor(vh * dpr));
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    interface Star {
      x: number;
      y: number;
      r: number;
      speed: number;
      twinkle: number;
      drift: number;
    }
    interface Orb {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
    }
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      r: number;
      life: number;
      maxLife: number;
      lime: boolean; // true → lime spark, false → green
    }

    const stars: Star[] = [];
    const orbs: Orb[] = [];
    const particles: Particle[] = [];

    const seed = () => {
      stars.length = 0;
      orbs.length = 0;
      const targetStars = Math.min(220, Math.floor((vw * vh) / 7000));
      for (let i = 0; i < targetStars; i++) {
        stars.push({
          x: Math.random() * vw,
          y: Math.random() * vh,
          r: Math.random() * 1.4 + 0.2,
          speed: Math.random() * 0.01 + 0.003,
          twinkle: Math.random() * Math.PI * 2,
          // Gentle upward drift (px/frame) — slow enough to read as a starfield
          // rather than rain. Stars wrap back to the bottom when they leave.
          drift: -(Math.random() * 0.08 + 0.02),
        });
      }
      const targetOrbs = Math.min(8, Math.max(3, Math.floor(vw / 220)));
      for (let i = 0; i < targetOrbs; i++) {
        orbs.push({
          x: Math.random() * vw,
          y: Math.random() * vh,
          r: Math.random() * 140 + 90,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          alpha: Math.random() * 0.05 + 0.012,
        });
      }
    };
    seed();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        seed();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    /** Spawn a rising particle. `fromBottom` true → starts just below the
     *  viewport edge. false → starts at a random Y so motion shows up across
     *  the full height immediately. ~20% are lime sparks. */
    const spawnParticle = (fromBottom = false) => {
      particles.push({
        x: Math.random() * vw,
        y: fromBottom ? vh + 10 : Math.random() * (vh + 20),
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 1.1 + 0.4),
        alpha: 0,
        r: Math.random() * 1.4 + 0.5,
        life: 0,
        maxLife: 220 + Math.random() * 180,
        lime: Math.random() < 0.2,
      });
    };

    // Pre-populate so the first frames already show particles across the full
    // height instead of an empty screen that slowly fills from the bottom.
    {
      const initial = Math.min(60, Math.floor(vh / 24));
      for (let i = 0; i < initial; i++) {
        spawnParticle(false);
        const p = particles[particles.length - 1];
        p.life = Math.floor(Math.random() * p.maxLife * 0.6);
      }
    }

    let frame = 0;
    const draw = () => {
      if (!running.value) {
        raf = 0;
        return;
      }
      frame++;
      ctx.clearRect(0, 0, vw, vh);

      // Slow-drifting green orbs
      for (let i = 0; i < orbs.length; i++) {
        const o = orbs[i];
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = vw + o.r;
        if (o.x > vw + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = vh + o.r;
        if (o.y > vh + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${GREEN_RGB},${o.alpha})`);
        g.addColorStop(0.5, `rgba(${GREEN_RGB},${o.alpha * 0.4})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twinkling + slowly drifting stars (wrap to bottom when off the top)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.twinkle += s.speed;
        s.y += s.drift;
        if (s.y < -2) {
          s.y = vh + 2;
          s.x = Math.random() * vw;
        }
        const alpha = 0.25 + 0.75 * Math.abs(Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(213,243,224,${alpha * 0.7})`;
        ctx.fill();
      }

      // Rising particles — mostly green, ~20% lime. Spawned at random Y for
      // ~70% of spawns so motion is distributed across the whole viewport.
      if (frame % 5 === 0) spawnParticle(Math.random() < 0.3);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.04) * 0.3;
        p.y += p.vy;
        p.vy -= 0.003;
        const progress = p.life / p.maxLife;
        p.alpha =
          progress < 0.15
            ? (progress / 0.15) * 0.7
            : progress > 0.65
              ? (1 - (progress - 0.65) / 0.35) * 0.7
              : 0.7;
        const col = p.lime ? LIME_RGB : GREEN_RGB;
        const core = p.lime ? "240,250,200" : "216,246,226";
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `rgba(${col},${p.alpha * 0.6})`);
        glow.addColorStop(0.4, `rgba(${col},${p.alpha * 0.2})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${core},${p.alpha})`;
        ctx.fill();
        if (p.life >= p.maxLife || p.y < -20) particles.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    };

    // Pause when the tab is hidden
    const onVisibility = () => {
      if (!document.hidden && running.value && !raf) draw();
    };
    document.addEventListener("visibilitychange", onVisibility);

    draw();

    return () => {
      running.value = false;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // -z-[5]: above the app-bg artwork (body::before, -10) and the wheel
      // page's own backdrop (-10), below all content.
      className="pointer-events-none fixed inset-0 -z-[5] h-full w-full"
    />
  );
}
