import { describe, expect, it } from "vitest";
import { computeWinners, goalError } from "./winners";

const pred = (id: string, h: number, a: number) => ({
  id,
  predictedScoreHome: h,
  predictedScoreAway: a,
});

describe("goalError", () => {
  it("is 0 for an exact prediction", () => {
    expect(
      goalError({ scoreHome: 2, scoreAway: 1 }, { scoreHome: 2, scoreAway: 1 })
    ).toBe(0);
  });

  it("sums both sides' absolute differences", () => {
    expect(
      goalError({ scoreHome: 3, scoreAway: 0 }, { scoreHome: 1, scoreAway: 1 })
    ).toBe(3);
  });
});

describe("computeWinners", () => {
  const actual = { scoreHome: 2, scoreAway: 1 };

  it("returns exact tier when someone nailed the score", () => {
    const result = computeWinners(
      [pred("a", 2, 1), pred("b", 1, 1), pred("c", 2, 1)],
      actual
    );
    expect(result.tier).toBe("exact");
    expect(result.minError).toBe(0);
    expect(result.winnerIds).toEqual(new Set(["a", "c"]));
  });

  it("falls back to closest when nobody is exact", () => {
    const result = computeWinners(
      [pred("a", 0, 0), pred("b", 1, 1), pred("c", 3, 3)],
      actual
    );
    expect(result.tier).toBe("closest");
    expect(result.minError).toBe(1);
    expect(result.winnerIds).toEqual(new Set(["b"]));
  });

  it("includes everyone tied at the smallest error", () => {
    const result = computeWinners(
      [pred("a", 1, 1), pred("b", 3, 1), pred("c", 0, 0)],
      actual
    );
    expect(result.tier).toBe("closest");
    expect(result.winnerIds).toEqual(new Set(["a", "b"]));
  });

  it("handles no predictions", () => {
    const result = computeWinners([], actual);
    expect(result.tier).toBeNull();
    expect(result.minError).toBeNull();
    expect(result.winnerIds.size).toBe(0);
  });

  it("records per-prediction errors", () => {
    const result = computeWinners([pred("a", 0, 3)], actual);
    expect(result.errors.get("a")).toBe(4);
  });
});
