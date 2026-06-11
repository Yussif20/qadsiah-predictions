/**
 * Saudi mobile number handling. The phone is the participant's identity, so
 * every accepted spelling of the same number must normalize to one canonical
 * form: "+9665XXXXXXXX".
 */

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Arabic-Indic digits (typed by Arabic keyboards) to Latin digits. */
export function toLatinDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const i = ARABIC_INDIC.indexOf(ch);
    if (i !== -1) return String(i);
    return String(EXTENDED_ARABIC_INDIC.indexOf(ch));
  });
}

/**
 * Normalize any common spelling of a Saudi mobile to "+9665XXXXXXXX".
 * Accepts: 05XXXXXXXX, 5XXXXXXXX, 9665XXXXXXXX, +9665XXXXXXXX,
 * 009665XXXXXXXX — with spaces, dashes, or Arabic digits anywhere.
 * Returns null when the input is not a valid Saudi mobile.
 */
export function normalizeSaudiPhone(input: string): string | null {
  let digits = toLatinDigits(input).replace(/[\s\-().+]/g, "");
  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  else if (digits.startsWith("05")) digits = digits.slice(1);

  // What remains must be the 9-digit mobile part: 5XXXXXXXX
  if (!/^5\d{8}$/.test(digits)) return null;
  return `+966${digits}`;
}

/** "+9665XXXXXXXX" -> local display form "05XXXXXXXX". */
export function toLocalFormat(normalized: string): string {
  return `0${normalized.slice(4)}`;
}

/** Public-safe mask: "+966501234567" -> "050•••••67". */
export function maskPhone(normalized: string): string {
  const local = toLocalFormat(normalized);
  return `${local.slice(0, 3)}•••••${local.slice(-2)}`;
}

/**
 * SHA-256 hex of the normalized phone — used in prediction doc IDs so the
 * public `predictions` collection never contains a raw phone number.
 */
export async function hashPhone(normalized: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
