import assert from "node:assert/strict";
import { test } from "node:test";
import { openStateAt } from "./opening-hours.ts";

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const SATURDAY = 6;

const DAYTIME = { opens_at: "09:00", closes_at: "19:00", closed_days: [] };
const LATE_NIGHT = { opens_at: "18:00", closes_at: "02:00", closed_days: [] };

function at(hour: number, minute = 0): number {
  return hour * 60 + minute;
}

test("open from the opening minute until just before closing", () => {
  const open = { status: "open", until: "19:00" };
  assert.deepEqual(
    openStateAt(DAYTIME, { day: WEDNESDAY, minutes: at(9) }),
    open,
  );
  assert.deepEqual(
    openStateAt(DAYTIME, { day: WEDNESDAY, minutes: at(18, 59) }),
    open,
  );
});

test("before opening, it opens later the same day", () => {
  assert.deepEqual(openStateAt(DAYTIME, { day: WEDNESDAY, minutes: at(8, 59) }), {
    status: "closed",
    next: { time: "09:00", inDays: 0, day: WEDNESDAY },
  });
});

test("from the closing minute on, it opens the next day", () => {
  assert.deepEqual(openStateAt(DAYTIME, { day: WEDNESDAY, minutes: at(19) }), {
    status: "closed",
    next: { time: "09:00", inDays: 1, day: THURSDAY },
  });
});

test("the next day after Saturday is Sunday", () => {
  assert.deepEqual(openStateAt(DAYTIME, { day: SATURDAY, minutes: at(20) }), {
    status: "closed",
    next: { time: "09:00", inDays: 1, day: SUNDAY },
  });
});

test("a day off stays closed during normal hours", () => {
  const hours = { ...DAYTIME, closed_days: [MONDAY] };
  assert.deepEqual(openStateAt(hours, { day: MONDAY, minutes: at(12) }), {
    status: "closed",
    next: { time: "09:00", inDays: 1, day: TUESDAY },
  });
});

test("the next opening skips a day off", () => {
  const hours = { ...DAYTIME, closed_days: [MONDAY] };
  assert.deepEqual(openStateAt(hours, { day: SUNDAY, minutes: at(20) }), {
    status: "closed",
    next: { time: "09:00", inDays: 2, day: TUESDAY },
  });
});

test("overnight hours are open late in the evening and past midnight", () => {
  const open = { status: "open", until: "02:00" };
  assert.deepEqual(
    openStateAt(LATE_NIGHT, { day: TUESDAY, minutes: at(23) }),
    open,
  );
  assert.deepEqual(
    openStateAt(LATE_NIGHT, { day: TUESDAY, minutes: at(1) }),
    open,
  );
});

test("overnight hours close at the closing minute and reopen that evening", () => {
  assert.deepEqual(openStateAt(LATE_NIGHT, { day: TUESDAY, minutes: at(2) }), {
    status: "closed",
    next: { time: "18:00", inDays: 0, day: TUESDAY },
  });
});

test("the hours after midnight belong to the night before", () => {
  const hours = { ...LATE_NIGHT, closed_days: [MONDAY] };
  assert.deepEqual(openStateAt(hours, { day: MONDAY, minutes: at(1) }), {
    status: "open",
    until: "02:00",
  });
  assert.deepEqual(openStateAt(hours, { day: TUESDAY, minutes: at(1) }), {
    status: "closed",
    next: { time: "18:00", inDays: 0, day: TUESDAY },
  });
});

test("after midnight on Sunday, the night before is Saturday", () => {
  const hours = { ...LATE_NIGHT, closed_days: [SATURDAY] };
  assert.deepEqual(openStateAt(hours, { day: SUNDAY, minutes: at(1) }), {
    status: "closed",
    next: { time: "18:00", inDays: 0, day: SUNDAY },
  });
});

test("closed every day has no next opening", () => {
  const hours = { ...DAYTIME, closed_days: [0, 1, 2, 3, 4, 5, 6] };
  assert.deepEqual(openStateAt(hours, { day: MONDAY, minutes: at(12) }), {
    status: "closed",
    next: null,
  });
});
