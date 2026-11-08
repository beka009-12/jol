import type { Clock } from "./format";

const DAYS_IN_WEEK = 7;

export interface OpeningHours {
  /** "HH:MM" in Bishkek time. A closing time at or before opening runs past midnight. */
  opens_at: string;
  closes_at: string;
  /** Weekdays it stays closed, 0 = Sunday. */
  closed_days: number[];
}

export type OpenState =
  | { status: "open"; until: string }
  | {
      status: "closed";
      /** Null when every day is a day off. */
      next: { time: string; inDays: number; day: number } | null;
    };

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function openStateAt(hours: OpeningHours, clock: Clock): OpenState {
  const opens = toMinutes(hours.opens_at);
  const closes = toMinutes(hours.closes_at);

  const weekday = (offset: number) =>
    (clock.day + offset + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const worksOn = (day: number) => !hours.closed_days.includes(day);

  // After midnight, overnight hours still belong to the day before.
  const openNow =
    closes <= opens
      ? (clock.minutes >= opens && worksOn(clock.day)) ||
        (clock.minutes < closes && worksOn(weekday(-1)))
      : clock.minutes >= opens && clock.minutes < closes && worksOn(clock.day);

  if (openNow) return { status: "open", until: hours.closes_at };

  const firstOffset = clock.minutes < opens ? 0 : 1;
  for (let inDays = firstOffset; inDays < firstOffset + DAYS_IN_WEEK; inDays += 1) {
    const day = weekday(inDays);
    if (worksOn(day)) {
      return { status: "closed", next: { time: hours.opens_at, inDays, day } };
    }
  }
  return { status: "closed", next: null };
}
