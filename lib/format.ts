const TYIYN_PER_SOM = 100;
const KGS_PER_USD = Number(process.env.NEXT_PUBLIC_KGS_PER_USD) || 87.5;
const TIME_ZONE = "Asia/Bishkek";

export function tyiynToSom(tyiyn: number): number {
  return Math.round(tyiyn / TYIYN_PER_SOM);
}

export function tyiynToUsd(tyiyn: number): number {
  return Math.round(tyiyn / TYIYN_PER_SOM / KGS_PER_USD);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatSom(tyiyn: number, locale: string): string {
  return formatNumber(tyiynToSom(tyiyn), locale);
}

export function formatUsd(tyiyn: number, locale: string): string {
  return formatNumber(tyiynToUsd(tyiyn), locale);
}

// Date-only API values are read as UTC so the day never shifts across zones.
function parseIsoDate(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
}

export function formatDate(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" },
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: iso.length === 10 ? "UTC" : TIME_ZONE,
    ...options,
  }).format(parseIsoDate(iso));
}

export function formatShortDate(iso: string, locale: string): string {
  return formatDate(iso, locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function monthName(
  month: number,
  locale: string,
  width: "long" | "short" = "long",
): string {
  return new Intl.DateTimeFormat(locale, {
    month: width,
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(2024, month - 1, 1)))
    .replace(".", "");
}

export function todayInBishkek(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function currentMonth(now: Date = new Date()): number {
  return Number(todayInBishkek(now).slice(5, 7));
}

export function monthsFrom(start: number): number[] {
  return Array.from({ length: 12 }, (_, i) => ((start - 1 + i) % 12) + 1);
}

/** First month in `months` at or after `from`, wrapping over the new year. */
export function nearestMonth(months: number[], from: number): number | null {
  return monthsFrom(from).find((m) => months.includes(m)) ?? null;
}

export function daysUntil(iso: string, today: string = todayInBishkek()): number {
  const midnight = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  return Math.round((midnight(iso) - midnight(today)) / 86_400_000);
}

export function formatRelativeDays(days: number, locale: string): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
}

export function weekdayName(
  day: number,
  locale: string,
  width: "long" | "short" = "long",
): string {
  // 7 January 2024 was a Sunday.
  return new Intl.DateTimeFormat(locale, {
    weekday: width,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 7 + day)));
}

export interface Clock {
  /** 0 = Sunday. */
  day: number;
  /** Minutes since midnight. */
  minutes: number;
}

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function bishkekClock(now: Date = new Date()): Clock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return {
    day: WEEKDAYS_EN.indexOf(part("weekday")),
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

function monthRuns(months: number[]): number[][] {
  const active = new Set(months);
  const previous = (month: number) => ((month + 10) % 12) + 1;
  const next = (month: number) => (month % 12) + 1;

  return monthsFrom(1)
    .filter((month) => active.has(month) && !active.has(previous(month)))
    .map((start) => {
      const run = [start];
      while (active.has(next(run[run.length - 1]))) {
        run.push(next(run[run.length - 1]));
      }
      return run;
    });
}

/** "June – September", joined across the new year: "December – March". */
export function formatSeason(
  months: number[],
  locale: string,
  allYearLabel: string,
  width: "long" | "short" = "long",
): string {
  if (new Set(months).size === 12) return allYearLabel;

  const name = (month: number) => monthName(month, locale, width);
  return monthRuns(months)
    .map((run) =>
      run.length === 1
        ? name(run[0])
        : `${name(run[0])}\u00a0– ${name(run[run.length - 1])}`,
    )
    .join(", ");
}
