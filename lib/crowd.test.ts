import assert from "node:assert/strict";
import { test } from "node:test";
import { summarizeCrowd } from "./crowd.ts";

//             J   F   M   A   M   J   J    A   S   O   N  D
const SUMMER = [5, 5, 5, 20, 40, 69, 100, 70, 35, 34, 5, 5];

function levels(values: number[], openMonths?: number[]): string[] {
  const summary = summarizeCrowd(values, openMonths);
  assert.ok(summary);
  return summary.bars.map((bar) => bar.level);
}

test("levels follow each month's share of the busiest month", () => {
  assert.deepEqual(levels(SUMMER).slice(5, 10), [
    "moderate",
    "busy",
    "busy",
    "moderate",
    "quiet",
  ]);
});

test("heights are relative to the busiest month, whatever the scale", () => {
  const summary = summarizeCrowd([800, 400, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(
    summary?.bars.slice(0, 3).map((bar) => bar.height),
    [100, 50, 25],
  );
});

test("a closed month is off season and has no bar, even with visitors", () => {
  const open = [6, 7, 8, 9];
  const summary = summarizeCrowd(SUMMER, open);
  assert.deepEqual(
    { level: summary?.bars[0].level, height: summary?.bars[0].height },
    { level: "off_season", height: 0 },
  );
});

test("the scale ignores visitors in closed months", () => {
  const values = [100, 50, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const summary = summarizeCrowd(values, [2, 3]);
  assert.deepEqual(
    summary?.bars.slice(1, 3).map((bar) => bar.height),
    [100, 50],
  );
});

test("a month with no visitors is off season", () => {
  const values = [0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.equal(levels(values)[0], "off_season");
});

test("a very quiet month keeps a visible bar", () => {
  const summary = summarizeCrowd([1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.ok((summary?.bars[0].height ?? 0) >= 5);
});

test("only the earliest of the busiest months is the peak", () => {
  const values = [0, 0, 0, 0, 0, 0, 100, 100, 0, 0, 0, 0];
  const summary = summarizeCrowd(values);
  assert.deepEqual(
    summary?.bars.filter((bar) => bar.peak).map((bar) => bar.month),
    [7],
  );
});

test("the peak ignores closed months", () => {
  const values = [100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const summary = summarizeCrowd(values, [2]);
  assert.deepEqual(
    summary?.bars.filter((bar) => bar.peak).map((bar) => bar.month),
    [2],
  );
});

test("it lists the busy months and the quiet ones, skipping off season", () => {
  const summary = summarizeCrowd(SUMMER, [5, 6, 7, 8, 9, 10]);
  assert.deepEqual(summary?.busiest, [7, 8]);
  assert.deepEqual(summary?.quietest, [10]);
});

test("months are numbered from January", () => {
  const summary = summarizeCrowd(SUMMER);
  assert.equal(summary?.bars[0].month, 1);
  assert.equal(summary?.bars[11].month, 12);
});

test("there is no summary without usable data", () => {
  assert.equal(summarizeCrowd(null), null);
  assert.equal(summarizeCrowd(undefined), null);
  assert.equal(summarizeCrowd([100, 50]), null);
  assert.equal(summarizeCrowd(new Array(12).fill(0)), null);
  assert.equal(summarizeCrowd(SUMMER, []), null);
});
