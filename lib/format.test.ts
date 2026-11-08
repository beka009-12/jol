import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bishkekClock,
  currentMonth,
  daysUntil,
  formatDate,
  formatRelativeDays,
  formatSeason,
  formatSom,
  formatUsd,
  monthName,
  monthsFrom,
  nearestMonth,
  todayInBishkek,
  tyiynToSom,
  weekdayName,
} from "./format.ts";

test("tyiyn convert to whole som", () => {
  assert.equal(tyiynToSom(1_200_000), 12_000);
});

test("prices format per locale", () => {
  assert.equal(formatSom(1_200_000, "en"), "12,000");
  assert.match(formatSom(1_200_000, "ru"), /^12\s000$/u);
});

test("usd hint uses the default rate", () => {
  assert.equal(formatUsd(1_200_000, "en"), "137");
});

test("date-only values never shift a day across time zones", () => {
  assert.equal(formatDate("2026-12-01", "en"), "December 1");
  assert.equal(formatDate("2026-12-01", "ru"), "1 декабря");
});

test("bishkek's date wins over UTC around midnight", () => {
  const lateUtc = new Date("2026-12-31T20:00:00Z");
  assert.equal(todayInBishkek(lateUtc), "2027-01-01");
  assert.equal(currentMonth(lateUtc), 1);
});

test("month names are localized and undotted", () => {
  assert.equal(monthName(12, "en"), "December");
  assert.equal(monthName(12, "ru"), "декабрь");
  assert.equal(monthName(12, "ru", "short"), "дек");
});

test("months wrap from the current one", () => {
  assert.deepEqual(monthsFrom(11).slice(0, 3), [11, 12, 1]);
  assert.equal(monthsFrom(11).length, 12);
});

test("nearest month wraps over the new year", () => {
  assert.equal(nearestMonth([1, 2, 3, 12], 7), 12);
  assert.equal(nearestMonth([1, 2, 3], 7), 1);
  assert.equal(nearestMonth([6, 7], 6), 6);
  assert.equal(nearestMonth([], 6), null);
});

test("daysUntil counts calendar days", () => {
  assert.equal(daysUntil("2026-12-01", "2026-11-08"), 23);
  assert.equal(daysUntil("2026-11-08", "2026-11-08"), 0);
});

test("relative days read naturally in both languages", () => {
  assert.equal(formatRelativeDays(23, "ru"), "через 23 дня");
  assert.equal(formatRelativeDays(23, "en"), "in 23 days");
});

test("a season reads as a range of months in both languages", () => {
  assert.equal(
    formatSeason([6, 7, 8, 9], "en", "All year"),
    "June\u00a0– September",
  );
  assert.equal(
    formatSeason([6, 7, 8, 9], "ru", "Круглый год"),
    "июнь\u00a0– сентябрь",
  );
});

test("a season across the new year is one range, whatever the order", () => {
  assert.equal(
    formatSeason([1, 2, 3, 12], "en", "All year"),
    "December\u00a0– March",
  );
});

test("a season with a gap lists each range, earliest start first", () => {
  assert.equal(
    formatSeason([1, 2, 3, 7, 8, 12], "en", "All year"),
    "July\u00a0– August, December\u00a0– March",
  );
});

test("a single month is named on its own", () => {
  assert.equal(formatSeason([12], "en", "All year"), "December");
});

test("twelve months use the all-year label", () => {
  assert.equal(
    formatSeason([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "en", "All year"),
    "All year",
  );
});

test("a season can use short month names", () => {
  assert.equal(
    formatSeason([12, 1, 2], "ru", "Круглый год", "short"),
    "дек\u00a0– февр",
  );
});

test("weekday names count from Sunday", () => {
  assert.equal(weekdayName(0, "en"), "Sunday");
  assert.equal(weekdayName(1, "ru"), "понедельник");
  assert.equal(weekdayName(1, "ru", "short"), "пн");
});

test("the clock reads the weekday and time in Bishkek, not UTC", () => {
  // 18:30 UTC on Sunday 8 November 2026 is 00:30 on Monday in Bishkek.
  assert.deepEqual(bishkekClock(new Date("2026-11-08T18:30:00Z")), {
    day: 1,
    minutes: 30,
  });
});

test("midnight in Bishkek is zero minutes", () => {
  assert.deepEqual(bishkekClock(new Date("2026-11-08T18:00:00Z")), {
    day: 1,
    minutes: 0,
  });
});
