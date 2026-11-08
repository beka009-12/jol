const MONTHS_IN_YEAR = 12;

/* Shares of the busiest month, in percent. */
const BUSY_FROM = 70;
const MODERATE_FROM = 35;
/** A quiet month still needs a bar you can see and tell apart from "closed". */
const MIN_HEIGHT = 6;

export type CrowdLevel = "off_season" | "quiet" | "moderate" | "busy";

export interface CrowdBar {
  /** 1-12. */
  month: number;
  level: CrowdLevel;
  /** Share of the busiest month, 0-100. */
  height: number;
  peak: boolean;
}

export interface CrowdSummary {
  bars: CrowdBar[];
  busiest: number[];
  quietest: number[];
}

/**
 * Reads visitors per month, January first, on any scale.
 * `openMonths` leaves closed months out, for a listing that isn't open all year.
 */
export function summarizeCrowd(
  visitors: number[] | null | undefined,
  openMonths?: number[],
): CrowdSummary | null {
  if (!visitors || visitors.length !== MONTHS_IN_YEAR) return null;

  const isOpen = (month: number) => !openMonths || openMonths.includes(month);
  const highest = Math.max(
    0,
    ...visitors.filter((_, index) => isOpen(index + 1)),
  );
  if (highest <= 0) return null;

  const peakIndex = visitors.findIndex(
    (value, index) => isOpen(index + 1) && value === highest,
  );

  const bars = visitors.map((value, index): CrowdBar => {
    const month = index + 1;
    if (!isOpen(month) || value <= 0) {
      return { month, level: "off_season", height: 0, peak: false };
    }
    const share = (value / highest) * 100;
    return {
      month,
      level:
        share >= BUSY_FROM ? "busy" : share >= MODERATE_FROM ? "moderate" : "quiet",
      height: Math.max(Math.round(share), MIN_HEIGHT),
      peak: index === peakIndex,
    };
  });

  const monthsAt = (level: CrowdLevel) =>
    bars.filter((bar) => bar.level === level).map((bar) => bar.month);

  return { bars, busiest: monthsAt("busy"), quietest: monthsAt("quiet") };
}
