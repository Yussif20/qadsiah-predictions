import { describe, expect, it } from "vitest";
import { hashPhone, maskPhone, normalizeSaudiPhone, toLatinDigits, toLocalFormat } from "./phone";

describe("toLatinDigits", () => {
  it("converts Arabic-Indic digits", () => {
    expect(toLatinDigits("٠٥٠١٢٣٤٥٦٧")).toBe("0501234567");
  });

  it("converts extended Arabic-Indic digits", () => {
    expect(toLatinDigits("۰۵۰۱۲۳۴۵۶۷")).toBe("0501234567");
  });

  it("leaves Latin digits untouched", () => {
    expect(toLatinDigits("0501234567")).toBe("0501234567");
  });
});

describe("normalizeSaudiPhone", () => {
  const canonical = "+966501234567";

  it.each([
    "0501234567",
    "501234567",
    "966501234567",
    "+966501234567",
    "00966501234567",
    "050 123 4567",
    "050-123-4567",
    "٠٥٠١٢٣٤٥٦٧",
    "+966 50 123 4567",
  ])("normalizes %s", (input) => {
    expect(normalizeSaudiPhone(input)).toBe(canonical);
  });

  it.each([
    "",
    "12345",
    "0601234567", // not a Saudi mobile prefix
    "05012345678", // too long
    "050123456", // too short
    "abc",
    "+20 100 123 4567", // Egyptian number
  ])("rejects %s", (input) => {
    expect(normalizeSaudiPhone(input)).toBeNull();
  });
});

describe("toLocalFormat / maskPhone", () => {
  it("converts to local format", () => {
    expect(toLocalFormat("+966501234567")).toBe("0501234567");
  });

  it("masks the middle digits", () => {
    expect(maskPhone("+966501234567")).toBe("050•••••67");
  });
});

describe("hashPhone", () => {
  it("is deterministic and hex-shaped", async () => {
    const a = await hashPhone("+966501234567");
    const b = await hashPhone("+966501234567");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different phones", async () => {
    expect(await hashPhone("+966501234567")).not.toBe(await hashPhone("+966501234568"));
  });
});
