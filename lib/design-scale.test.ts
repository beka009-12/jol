import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/*
  Spacing comes only from 4 / 8 / 12 / 16 / 24 / 32 / 48 px (see globals.css).
  Sizes (h-, w-, size-) are not checked: a 44px tap target is a size, not a gap.
*/
const STEPS = new Set(["0", "1", "2", "3", "4", "6", "8", "12"]);
const ALLOWED_LITERALS = new Set([
  "0", "0px", "4px", "8px", "12px", "16px", "24px", "32px", "48px",
  "0rem", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem",
]);

const SPACING =
  /^-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])-(.+)$/;

function offScale(token: string): string | null {
  const base = token.split(/:(?![^[]*\])/).pop() ?? token;
  const match = SPACING.exec(base);
  if (!match) return null;
  const value = match[1];

  if (/^\d+(\.\d+)?$/.test(value)) {
    return STEPS.has(value) ? null : base;
  }
  if (value.startsWith("[")) {
    for (const step of value.matchAll(/--spacing\((\d+(?:\.\d+)?)\)/g)) {
      if (!STEPS.has(step[1])) return base;
    }
    const literals = value
      .replace(/--spacing\([^)]*\)/g, "")
      .match(/-?\d*\.?\d+(?:px|rem)/g);
    for (const literal of literals ?? []) {
      if (!ALLOWED_LITERALS.has(literal.replace(/^-/, ""))) return base;
    }
  }
  return null;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

test("spacing utilities stay on the 4/8/12/16/24/32/48 scale", () => {
  const found: string[] = [];
  for (const file of [...sourceFiles("app"), ...sourceFiles("components")]) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        for (const token of line.split(/[\s"'`{},]+/)) {
          const bad = offScale(token.replace(/^\(+|\)+$/g, ""));
          if (bad) found.push(`${file}:${index + 1} ${bad}`);
        }
      });
  }
  assert.deepEqual(found, [], `Off-scale spacing:\n${found.join("\n")}`);
});

test("the checker itself flags and allows the right things", () => {
  assert.equal(offScale("mt-5"), "mt-5");
  assert.equal(offScale("lg:py-20"), "py-20");
  assert.equal(offScale("has-[:focus-visible]:px-3.5"), "px-3.5");
  assert.equal(offScale("pt-[calc(env(safe-area-inset-top)+1.25rem)]"), "pt-[calc(env(safe-area-inset-top)+1.25rem)]");
  assert.equal(offScale("pb-[calc(var(--hero-overlap)+--spacing(5))]"), "pb-[calc(var(--hero-overlap)+--spacing(5))]");
  assert.equal(offScale("-mx-4"), null);
  assert.equal(offScale("lg:gap-x-12"), null);
  assert.equal(offScale("pb-nav"), null);
  assert.equal(offScale("mx-auto"), null);
  assert.equal(offScale("pt-[calc(env(safe-area-inset-top)+--spacing(6))]"), null);
  assert.equal(offScale("size-11"), null);
  assert.equal(offScale("mt-0.5"), "mt-0.5");
});
