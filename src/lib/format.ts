/**
 * Explicit Gregorian calendar: some browsers default "ar-SA" to the Hijri
 * calendar, which would shift match dates. Latin digits keep dates consistent
 * with the score digits used across the UI.
 */
export function formatMatchDate(date: Date, lang: string): string {
  const locale = lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Date -> value for <input type="datetime-local"> in local time. */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
