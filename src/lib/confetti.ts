import confetti from "canvas-confetti";

const BRAND_COLORS = ["#45B75A", "#B4D337", "#FFFFFF"];

/** Celebration for the lucky wheel reveal. */
export function celebrationBurst(): void {
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: BRAND_COLORS });
  setTimeout(
    () =>
      confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: BRAND_COLORS }),
    200
  );
  setTimeout(
    () =>
      confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: BRAND_COLORS }),
    400
  );
}
